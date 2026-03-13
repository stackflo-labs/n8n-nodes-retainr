#!/usr/bin/env node
/**
 * Retainr n8n Community Node — E2E Integration Tests
 *
 * Phase 1 (always): Verify the node loads into n8n's type registry.
 * Phase 2 (requires RETAINR_API_KEY): Workflow execution via internal REST API.
 *   Creates real workflows (ManualTrigger → Retainr node) and executes them,
 *   proving: n8n engine → credential decryption → node code → Retainr API.
 * Phase 3 (requires RETAINR_API_KEY): Direct Retainr API validation.
 *   Calls the same HTTP endpoints our node calls, proving the API contract.
 *
 * Usage:
 *   N8N_BASE_URL=http://localhost:5678 \
 *   RETAINR_API_KEY=rec_live_... \
 *   RETAINR_API_URL=https://api-staging.retainr.dev \
 *   node e2e/integration-test.mjs
 */

const N8N_BASE_URL = process.env.N8N_BASE_URL ?? 'http://localhost:5678'
const RETAINR_API_KEY = process.env.RETAINR_API_KEY ?? ''
const RETAINR_API_URL = process.env.RETAINR_API_URL ?? 'https://api-staging.retainr.dev'
// When n8n runs in Docker, it may need a different URL to reach the Retainr API.
const RETAINR_API_URL_FROM_N8N = process.env.RETAINR_API_URL_FROM_N8N ?? RETAINR_API_URL

const OWNER_EMAIL = 'ci@retainr-test.internal'
const OWNER_PASSWORD = 'RetainrCI-2024!'

// All test memories get a 5-minute TTL so they self-clean
const TEST_TTL = 300

let passed = 0
let failed = 0
const failures = []

function pass(msg) {
  console.log(`  ✓  ${msg}`)
  passed++
}

function fail(msg, detail = '') {
  const full = detail ? `${msg} — ${detail}` : msg
  console.error(`  ✗  ${full}`)
  failures.push(full)
  failed++
}

function assert(condition, msg, detail = '') {
  if (condition) {
    pass(msg)
  } else {
    fail(msg, detail)
    throw new Error(msg)
  }
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

// ── n8n helpers ─────────────────────────────────────────────────────────────

async function waitForN8n(maxAttempts = 40, intervalMs = 3000) {
  console.log('⏳ Waiting for n8n REST API...')
  for (let i = 1; i <= maxAttempts; i++) {
    try {
      const res = await fetch(`${N8N_BASE_URL}/rest/settings`)
      if (res.ok || res.status === 401) {
        console.log(`   n8n REST API ready (attempt ${i})\n`)
        return
      }
    } catch { /* not ready */ }
    if (i === maxAttempts) throw new Error('n8n REST API did not become ready')
    process.stdout.write('.')
    await sleep(intervalMs)
  }
}

async function setupOwner() {
  try {
    const settingsRes = await fetch(`${N8N_BASE_URL}/rest/settings`)
    if (settingsRes.ok) {
      const settings = await settingsRes.json()
      const data = settings.data ?? settings
      if (data?.userManagement?.isInstanceOwnerSetUp ?? data?.isInstanceOwnerSetUp) {
        console.log('   Owner already set up\n')
        return null
      }
    }
  } catch {}

  try {
    const res = await fetch(`${N8N_BASE_URL}/rest/owner/setup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: OWNER_EMAIL,
        firstName: 'CI',
        lastName: 'Test',
        password: OWNER_PASSWORD,
      }),
    })
    if (res.ok) {
      const cookieHeader = res.headers.get('set-cookie') ?? ''
      const sessionCookie = cookieHeader ? cookieHeader.split(';')[0] : ''
      console.log(`   Owner created\n`)
      return sessionCookie || null
    }
    return null
  } catch {
    return null
  }
}

async function signIn() {
  try {
    for (const path of ['/rest/workflows', '/rest/credentials']) {
      const probe = await fetch(`${N8N_BASE_URL}${path}`)
      if (probe.ok) {
        console.log('   Auth not required\n')
        return { token: null, cookie: '' }
      }
    }
  } catch {}

  const loginPayloads = [
    { emailOrLdapLoginId: OWNER_EMAIL, password: OWNER_PASSWORD },
    { email: OWNER_EMAIL, password: OWNER_PASSWORD },
  ]
  for (const path of ['/rest/login', '/rest/auth/login']) {
    for (const payload of loginPayloads) {
      try {
        const res = await fetch(`${N8N_BASE_URL}${path}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (res.status === 404) continue
        if (!res.ok) continue
        const body = await res.json().catch(() => ({}))
        const token = body?.data?.token ?? body?.token ?? null
        const cookieHeader = res.headers.get('set-cookie') ?? ''
        const cookieToken = cookieHeader ? cookieHeader.split(';')[0] : ''
        if (token || cookieToken) {
          console.log(`   Signed in via ${path}\n`)
          return { token, cookie: cookieToken }
        }
      } catch {}
    }
  }
  throw new Error('All sign-in paths failed.')
}

function n8nAuthHeaders({ token, cookie }) {
  const base = { 'Content-Type': 'application/json' }
  if (token) return { ...base, Authorization: `Bearer ${token}` }
  if (cookie) return { ...base, Cookie: cookie }
  return base
}

async function n8nFetch(auth, path, options = {}) {
  return fetch(`${N8N_BASE_URL}${path}`, {
    ...options,
    headers: { ...n8nAuthHeaders(auth), ...(options.headers ?? {}) },
  })
}

// ── Retainr API helpers ─────────────────────────────────────────────────────

async function retainrFetch(path, options = {}) {
  return fetch(`${RETAINR_API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${RETAINR_API_KEY}`,
      ...(options.headers ?? {}),
    },
  })
}

// ── Phase 1: Node loading ────────────────────────────────────────────────────

async function phase1NodeLoading(auth) {
  console.log('=== Phase 1: Node loading ===\n')

  let nodes = null
  for (const path of ['/types/nodes.json', '/rest/node-types', '/api/v1/node-types']) {
    try {
      const r = await n8nFetch(auth, path)
      if (r.ok) {
        const body = await r.json()
        nodes = Array.isArray(body) ? body : Object.values(body).flat()
        console.log(`   Node types from ${path} (${nodes.length} types)`)
        break
      }
    } catch {}
  }

  assert(nodes != null, 'Node types endpoint is accessible')
  assert(nodes.length > 0, `Node types list is non-empty (got ${nodes?.length ?? 0})`)

  // The scoped package @stackflo-labs/n8n-nodes-retainr registers as
  // n8n-nodes-retainr.retainr (n8n strips scope prefix)
  const retainrNode = nodes.find(
    (n) => n.name === 'n8n-nodes-retainr.retainr' || n.name === '@stackflo-labs/n8n-nodes-retainr.retainr',
  )
  assert(retainrNode != null, 'Retainr node is registered in n8n')
  assert(
    retainrNode?.displayName === 'Retainr',
    'Retainr node displayName is "Retainr"',
    `got "${retainrNode?.displayName}"`,
  )

  // Check for usableAsTool
  if (retainrNode?.usableAsTool) {
    pass('Retainr node has usableAsTool enabled')
  }

  console.log()
}

// ── Phase 2: Workflow execution ──────────────────────────────────────────────

async function createCredential(auth) {
  const res = await n8nFetch(auth, '/rest/credentials', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Retainr CI Test',
      type: 'retainrApi',
      data: {
        apiKey: RETAINR_API_KEY,
        baseUrl: RETAINR_API_URL_FROM_N8N,
      },
    }),
  })

  if (!res.ok) {
    const errBody = await res.text()
    console.log(`   Credential creation failed (${res.status}): ${errBody.slice(0, 300)}`)
    return null
  }

  const body = await res.json()
  const cred = body.data ?? body
  console.log(`   Credential created: id=${cred.id}`)
  return { id: String(cred.id), name: cred.name }
}

function buildWorkflow(name, retainrParams, credential) {
  const triggerName = 'Manual Trigger'
  return {
    name,
    nodes: [
      {
        id: crypto.randomUUID(),
        name: triggerName,
        type: 'n8n-nodes-base.manualTrigger',
        typeVersion: 1,
        position: [250, 300],
        parameters: {},
      },
      {
        id: crypto.randomUUID(),
        name: 'Retainr',
        type: 'n8n-nodes-retainr.retainr',
        typeVersion: 1,
        position: [500, 300],
        parameters: retainrParams,
        credentials: {
          retainrApi: { id: credential.id, name: credential.name },
        },
      },
    ],
    connections: {
      [triggerName]: {
        main: [[{ node: 'Retainr', type: 'main', index: 0 }]],
      },
    },
    settings: { executionOrder: 'v1' },
  }
}

async function createWorkflow(auth, workflowData) {
  const res = await n8nFetch(auth, '/rest/workflows', {
    method: 'POST',
    body: JSON.stringify(workflowData),
  })
  if (!res.ok) {
    const errBody = await res.text()
    throw new Error(`Workflow creation failed (${res.status}): ${errBody.slice(0, 300)}`)
  }
  const body = await res.json()
  const wf = body.data ?? body
  console.log(`   Workflow "${workflowData.name}" created: id=${wf.id}`)
  return wf
}

async function executeWorkflow(auth, workflowId) {
  const res = await n8nFetch(auth, `/rest/workflows/${workflowId}/run`, {
    method: 'POST',
    body: JSON.stringify({ triggerToStartFrom: { name: 'Manual Trigger' } }),
  })
  if (!res.ok) {
    const errBody = await res.text()
    console.log(`   Execute failed (${res.status}): ${errBody.slice(0, 300)}`)
    return null
  }
  const body = await res.json()
  const data = body.data ?? body
  const executionId = data.executionId ?? data.id
  console.log(`   Execution started: ${executionId}`)
  return { executionId }
}

async function waitForExecution(auth, executionId, maxAttempts = 30) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const res = await n8nFetch(auth, `/rest/executions/${executionId}`)
      if (res.ok) {
        const body = await res.json()
        const exec = body.data ?? body
        const status = exec.status ?? (exec.finished ? 'success' : 'running')
        if (['success', 'error', 'crashed'].includes(status)) return exec
      }
    } catch {}
    await sleep(1000)
  }
  return null
}

function getNodeOutput(execution, nodeName = 'Retainr') {
  const resultData = execution?.data?.resultData ?? execution?.resultData
  if (!resultData) return null
  const nodeRuns = resultData.runData?.[nodeName]
  if (!Array.isArray(nodeRuns) || nodeRuns.length === 0) return null
  const lastRun = nodeRuns[nodeRuns.length - 1]
  const items = lastRun?.data?.main?.[0] ?? []
  return items.length > 0 ? (items[0].json ?? items[0]) : null
}

function getExecutionError(execution) {
  const resultData = execution?.data?.resultData ?? execution?.resultData
  const runData = resultData?.runData ?? {}
  for (const [nodeName, runs] of Object.entries(runData)) {
    for (const run of /** @type {any[]} */ (runs)) {
      if (run.error) return `${nodeName}: ${JSON.stringify(run.error).slice(0, 200)}`
    }
  }
  return resultData?.error ? JSON.stringify(resultData.error).slice(0, 200) : 'unknown'
}

async function cleanupWorkflow(auth, workflowId) {
  try { await n8nFetch(auth, `/rest/workflows/${workflowId}`, { method: 'DELETE' }) } catch {}
}

async function runWorkflowTest(auth, name, params, credential) {
  const wf = buildWorkflow(name, params, credential)
  const created = await createWorkflow(auth, wf)
  try {
    const exec = await executeWorkflow(auth, created.id)
    assert(exec != null, `${name}: execution started`)

    const result = await waitForExecution(auth, exec.executionId)
    assert(result != null, `${name}: execution completed`)

    const status = result.status ?? (result.finished ? 'success' : 'unknown')
    if (status === 'error') {
      const errDetail = getExecutionError(result)
      assert(false, `${name}: executed successfully`, `got error: ${errDetail}`)
    }
    assert(status === 'success', `${name}: executed successfully`, `got status: ${status}`)

    const output = getNodeOutput(result)
    return output
  } finally {
    await cleanupWorkflow(auth, created.id)
  }
}

async function phase2WorkflowExecution(auth) {
  console.log('=== Phase 2: Workflow execution via n8n engine ===\n')

  const credential = await createCredential(auth)
  assert(credential != null, 'n8n credential created for retainrApi')

  const ts = Date.now()
  const testUserId = `e2e-user-${ts}`

  // ── 2a: Store Memory ────────────────────────────────────────────────────
  console.log('\n--- 2a: Store Memory ---\n')
  const storeOutput = await runWorkflowTest(auth, 'CI: Store Memory', {
    resource: 'memory',
    operation: 'store',
    content: `E2E test memory at ${ts}`,
    scope: 'user',
    userId: testUserId,
    storeAdditionalFields: { ttlSeconds: TEST_TTL, tags: 'e2e-test' },
  }, credential)
  if (storeOutput) {
    pass(`Store returned memory id: ${storeOutput.id ?? 'ok'}`)
  }

  // Wait for embedding
  await sleep(2000)

  // ── 2b: Search Memory ──────────────────────────────────────────────────
  console.log('\n--- 2b: Search Memory ---\n')
  const searchOutput = await runWorkflowTest(auth, 'CI: Search Memory', {
    resource: 'memory',
    operation: 'search',
    query: `E2E test memory at ${ts}`,
    searchAdditionalFields: {
      scope: 'user',
      userId: testUserId,
      limit: 5,
      threshold: 0.3,
    },
  }, credential)
  if (searchOutput) {
    const results = searchOutput.results ?? searchOutput.memories ?? []
    pass(`Search returned ${Array.isArray(results) ? results.length : '?'} results`)
  }

  // ── 2c: Get Context ───────────────────────────────────────────────────
  console.log('\n--- 2c: Get Context ---\n')
  const contextOutput = await runWorkflowTest(auth, 'CI: Get Context', {
    resource: 'memory',
    operation: 'getContext',
    query: `E2E test memory`,
    format: 'bullet_list',
    contextAdditionalFields: {
      scope: 'user',
      userId: testUserId,
      maxMemories: 5,
    },
  }, credential)
  if (contextOutput) {
    const ctx = contextOutput.context ?? ''
    pass(`Get Context returned ${ctx.length} chars`)
  }

  // ── 2d: List Memories ─────────────────────────────────────────────────
  console.log('\n--- 2d: List Memories ---\n')
  const listOutput = await runWorkflowTest(auth, 'CI: List Memories', {
    resource: 'memory',
    operation: 'list',
    listAdditionalFields: {
      scope: 'user',
      userId: testUserId,
      limit: 10,
    },
  }, credential)
  if (listOutput) {
    const memories = listOutput.memories ?? []
    pass(`List returned ${Array.isArray(memories) ? memories.length : '?'} memories`)
  }

  // ── 2e: Workspace Info ────────────────────────────────────────────────
  console.log('\n--- 2e: Workspace Info ---\n')
  const wsOutput = await runWorkflowTest(auth, 'CI: Workspace Info', {
    resource: 'workspace',
    operation: 'getInfo',
  }, credential)
  if (wsOutput) {
    assert(wsOutput.workspace_id != null || wsOutput.id != null,
      'Workspace info returned workspace data',
      `got: ${JSON.stringify(wsOutput).slice(0, 150)}`)
  }

  // ── 2f: Delete Memories ───────────────────────────────────────────────
  console.log('\n--- 2f: Delete Memories ---\n')
  const deleteOutput = await runWorkflowTest(auth, 'CI: Delete Memories', {
    resource: 'memory',
    operation: 'delete',
    deleteScope: 'user',
    deleteAdditionalFields: { userId: testUserId },
  }, credential)
  if (deleteOutput) {
    pass(`Delete returned: ${JSON.stringify(deleteOutput).slice(0, 100)}`)
  }

  console.log()
}

// ── Phase 3: Direct API validation ──────────────────────────────────────────

async function phase3DirectApi() {
  console.log('=== Phase 3: Direct Retainr API validation ===\n')

  const ts = Date.now()
  const userId = `e2e-direct-${ts}`

  // ── 3a: Store ─────────────────────────────────────────────────────────
  console.log('--- 3a: Store ---\n')
  const storeRes = await retainrFetch('/v1/memories', {
    method: 'POST',
    body: JSON.stringify({
      content: `Direct API test memory ${ts}`,
      scope: 'user',
      user_id: userId,
      ttl_seconds: TEST_TTL,
      tags: ['e2e-direct'],
    }),
  })
  assert(storeRes.ok, 'Store API returns 2xx', `got ${storeRes.status}`)
  const stored = await storeRes.json()
  assert(stored.id != null, 'Store returns memory ID')
  pass(`Stored memory: ${stored.id}`)

  await sleep(2000) // embedding settle

  // ── 3b: Search ────────────────────────────────────────────────────────
  console.log('\n--- 3b: Search ---\n')
  const searchRes = await retainrFetch('/v1/memories/search', {
    method: 'POST',
    body: JSON.stringify({
      query: `Direct API test memory ${ts}`,
      scope: 'user',
      user_id: userId,
      limit: 5,
      threshold: 0.3,
    }),
  })
  assert(searchRes.ok, 'Search API returns 2xx', `got ${searchRes.status}`)
  const searchData = await searchRes.json()
  const results = searchData.results ?? searchData.memories ?? []
  assert(results.length > 0, 'Search returns at least 1 result', `got ${results.length}`)

  // ── 3c: Get Context ───────────────────────────────────────────────────
  console.log('\n--- 3c: Get Context ---\n')
  const ctxRes = await retainrFetch('/v1/memories/context', {
    method: 'POST',
    body: JSON.stringify({
      query: 'Direct API test',
      format: 'system_prompt',
      scope: 'user',
      user_id: userId,
      limit: 5,
    }),
  })
  assert(ctxRes.ok, 'Context API returns 2xx', `got ${ctxRes.status}`)
  const ctxData = await ctxRes.json()
  assert(typeof ctxData.context === 'string', 'Context returns string', `got ${typeof ctxData.context}`)
  pass(`Context length: ${ctxData.context.length} chars`)

  // ── 3d: List ──────────────────────────────────────────────────────────
  console.log('\n--- 3d: List ---\n')
  const listRes = await retainrFetch(`/v1/memories?scope=user&user_id=${userId}&limit=10`)
  assert(listRes.ok, 'List API returns 2xx', `got ${listRes.status}`)
  const listData = await listRes.json()
  const memories = listData.memories ?? []
  assert(memories.length > 0, 'List returns at least 1 memory', `got ${memories.length}`)

  // ── 3e: Workspace ─────────────────────────────────────────────────────
  console.log('\n--- 3e: Workspace ---\n')
  const wsRes = await retainrFetch('/v1/workspace')
  assert(wsRes.ok, 'Workspace API returns 2xx', `got ${wsRes.status}`)
  const wsData = await wsRes.json()
  assert(wsData.workspace_id != null || wsData.id != null, 'Workspace returns ID')

  // ── 3f: Delete ────────────────────────────────────────────────────────
  console.log('\n--- 3f: Delete ---\n')
  const deleteRes = await retainrFetch('/v1/memories', {
    method: 'DELETE',
    body: JSON.stringify({ scope: 'user', user_id: userId }),
  })
  assert(deleteRes.ok, 'Delete API returns 2xx', `got ${deleteRes.status}`)
  const deleteData = await deleteRes.json()
  pass(`Deleted ${deleteData.deleted ?? '?'} memories`)

  // Verify deletion
  const verifyRes = await retainrFetch(`/v1/memories?scope=user&user_id=${userId}&limit=10`)
  if (verifyRes.ok) {
    const verifyData = await verifyRes.json()
    const remaining = verifyData.memories ?? []
    assert(remaining.length === 0, 'All test memories deleted', `${remaining.length} remain`)
  }

  console.log()
}

// ── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log('╔══════════════════════════════════════════════════╗')
  console.log('║  Retainr n8n Community Node — E2E Tests         ║')
  console.log('╠══════════════════════════════════════════════════╣')
  console.log(`║  n8n:     ${N8N_BASE_URL.padEnd(38)} ║`)
  console.log(`║  API:     ${RETAINR_API_URL.padEnd(38)} ║`)
  console.log(`║  API key: ${RETAINR_API_KEY ? RETAINR_API_KEY.slice(0, 12) + '...' : '(not set)'}${' '.repeat(Math.max(0, 38 - (RETAINR_API_KEY ? 15 : 9)))} ║`)
  console.log('╚══════════════════════════════════════════════════╝\n')

  await waitForN8n()

  const setupCookie = await setupOwner()
  let auth
  if (setupCookie) {
    auth = { token: null, cookie: setupCookie }
  } else {
    auth = await signIn()
  }

  // Phase 1: Always run — verifies node loads
  try {
    await phase1NodeLoading(auth)
  } catch (e) {
    console.error(`Phase 1 FAILED: ${e.message}\n`)
  }

  // Phase 2 + 3: Require API key
  if (!RETAINR_API_KEY) {
    console.log('⚠  RETAINR_API_KEY not set — skipping Phase 2 (workflow execution) and Phase 3 (API validation)\n')
  } else {
    try {
      await phase2WorkflowExecution(auth)
    } catch (e) {
      console.error(`Phase 2 FAILED: ${e.message}\n`)
    }

    try {
      await phase3DirectApi()
    } catch (e) {
      console.error(`Phase 3 FAILED: ${e.message}\n`)
    }
  }

  // Summary
  console.log('════════════════════════════════════════════════════')
  console.log(`  Results: ${passed} passed, ${failed} failed`)
  if (failures.length > 0) {
    console.log('\n  Failures:')
    for (const f of failures) console.log(`    - ${f}`)
  }
  console.log('════════════════════════════════════════════════════')

  process.exit(failed > 0 ? 1 : 0)
}

main().catch((e) => {
  console.error(`\nFATAL: ${e.message}`)
  process.exit(2)
})
