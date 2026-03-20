import type { IExecuteFunctions, IHttpRequestOptions } from 'n8n-workflow';
import { Retainr } from '../Retainr.node';

const BASE_URL = 'https://api.retainr.dev';
const API_KEY = 'rec_live_testkey_base58';

type MockedFunctions = IExecuteFunctions & {
	helpers: { httpRequestWithAuthentication: jest.Mock };
};

function createMock(
	parameters: Record<string, unknown>,
	mockResponse: unknown = { id: 'mem_test123' },
	continueOnFail = false,
): MockedFunctions {
	const httpRequestWithAuthentication = jest
		.fn()
		.mockResolvedValue(mockResponse);

	return {
		getInputData: () => [{ json: {}, pairedItem: 0 }],
		getNodeParameter: (name: string, _index?: number, defaultValue?: unknown) => {
			const val = parameters[name];
			return val !== undefined ? val : defaultValue;
		},
		getCredentials: jest.fn().mockResolvedValue({
			apiKey: API_KEY,
			baseUrl: BASE_URL,
		}),
		helpers: { httpRequestWithAuthentication },
		continueOnFail: () => continueOnFail,
		getNode: () => ({
			name: 'Retainr',
			type: 'n8n-nodes-retainr.retainr',
			id: 'n1',
			position: [0, 0],
			parameters: {},
		}),
	} as unknown as MockedFunctions;
}

/** Extract the IHttpRequestOptions passed to httpRequestWithAuthentication */
function getRequestOptions(mock: MockedFunctions): IHttpRequestOptions {
	return mock.helpers.httpRequestWithAuthentication.mock.calls[0][1];
}

describe('Retainr node', () => {
	const node = new Retainr();

	// ── Memory > Store ──────────────────────────────────────────────────────

	describe('Memory > Store', () => {
		it('POSTs to /v1/memories with content only (no namespace)', async () => {
			const mock = createMock({
				resource: 'memory',
				operation: 'store',
				content: 'User prefers dark mode',
				namespace: '',
				storeAdditionalFields: {},
			});

			const result = await node.execute.call(
				mock as unknown as IExecuteFunctions,
			);

			const opts = getRequestOptions(mock);
			expect(opts.method).toBe('POST');
			expect(opts.url).toBe(`${BASE_URL}/v1/memories`);
			expect(opts.body).toEqual({ content: 'User prefers dark mode' });
			expect(result[0][0].json).toEqual({ id: 'mem_test123' });
		});

		it('POSTs with namespace set', async () => {
			const mock = createMock({
				resource: 'memory',
				operation: 'store',
				content: 'Workflow context',
				namespace: 'customer:alice',
				storeAdditionalFields: {},
			});

			await node.execute.call(mock as unknown as IExecuteFunctions);

			const opts = getRequestOptions(mock);
			expect(opts.body).toEqual(
				expect.objectContaining({
					content: 'Workflow context',
					namespace: 'customer:alice',
				}),
			);
		});

		it('omits namespace when empty string', async () => {
			const mock = createMock({
				resource: 'memory',
				operation: 'store',
				content: 'Global note',
				namespace: '',
				storeAdditionalFields: {},
			});

			await node.execute.call(mock as unknown as IExecuteFunctions);

			const body = getRequestOptions(mock).body as Record<string, unknown>;
			expect(body.content).toBe('Global note');
			expect(body).not.toHaveProperty('namespace');
		});

		it('includes ttl_seconds from additional fields', async () => {
			const mock = createMock({
				resource: 'memory',
				operation: 'store',
				content: 'Ephemeral',
				namespace: '',
				storeAdditionalFields: { ttlSeconds: 3600 },
			});

			await node.execute.call(mock as unknown as IExecuteFunctions);

			const body = getRequestOptions(mock).body as Record<string, unknown>;
			expect(body.ttl_seconds).toBe(3600);
		});

		it('omits ttl_seconds when 0 (falsy)', async () => {
			const mock = createMock({
				resource: 'memory',
				operation: 'store',
				content: 'Permanent',
				namespace: '',
				storeAdditionalFields: { ttlSeconds: 0 },
			});

			await node.execute.call(mock as unknown as IExecuteFunctions);

			const body = getRequestOptions(mock).body as Record<string, unknown>;
			expect(body).not.toHaveProperty('ttl_seconds');
		});

		it('parses comma-separated tags into array', async () => {
			const mock = createMock({
				resource: 'memory',
				operation: 'store',
				content: 'Tagged memory',
				namespace: '',
				storeAdditionalFields: {
					tags: 'preference, communication, important',
				},
			});

			await node.execute.call(mock as unknown as IExecuteFunctions);

			const body = getRequestOptions(mock).body as Record<string, unknown>;
			expect(body.tags).toEqual([
				'preference',
				'communication',
				'important',
			]);
		});

		it('omits tags when empty string', async () => {
			const mock = createMock({
				resource: 'memory',
				operation: 'store',
				content: 'No tags',
				namespace: '',
				storeAdditionalFields: { tags: '' },
			});

			await node.execute.call(mock as unknown as IExecuteFunctions);

			const body = getRequestOptions(mock).body as Record<string, unknown>;
			expect(body).not.toHaveProperty('tags');
		});

		it('includes dedup_threshold when set', async () => {
			const mock = createMock({
				resource: 'memory',
				operation: 'store',
				content: 'Dedup test',
				namespace: '',
				storeAdditionalFields: { dedupThreshold: 0.95 },
			});

			await node.execute.call(mock as unknown as IExecuteFunctions);

			const body = getRequestOptions(mock).body as Record<string, unknown>;
			expect(body.dedup_threshold).toBe(0.95);
		});

		it('parses metadata JSON string', async () => {
			const mock = createMock({
				resource: 'memory',
				operation: 'store',
				content: 'With metadata',
				namespace: '',
				storeAdditionalFields: {
					metadata: '{"source":"n8n","version":2}',
				},
			});

			await node.execute.call(mock as unknown as IExecuteFunctions);

			const body = getRequestOptions(mock).body as Record<string, unknown>;
			expect(body.metadata).toEqual({ source: 'n8n', version: 2 });
		});
	});

	// ── Memory > Search ─────────────────────────────────────────────────────

	describe('Memory > Search', () => {
		it('POSTs to /v1/memories/search with query and namespace', async () => {
			const mock = createMock(
				{
					resource: 'memory',
					operation: 'search',
					query: 'user preferences',
					namespace: 'customer:alice',
					searchAdditionalFields: {
						limit: 3,
						threshold: 0.8,
					},
				},
				{
					results: [
						{ id: 'mem_1', content: 'dark mode', score: 0.92 },
					],
				},
			);

			const result = await node.execute.call(
				mock as unknown as IExecuteFunctions,
			);

			const opts = getRequestOptions(mock);
			expect(opts.method).toBe('POST');
			expect(opts.url).toBe(`${BASE_URL}/v1/memories/search`);
			expect(opts.body).toEqual({
				query: 'user preferences',
				namespace: 'customer:alice',
				limit: 3,
				threshold: 0.8,
			});
			expect(result[0][0].json).toEqual({
				results: [
					{ id: 'mem_1', content: 'dark mode', score: 0.92 },
				],
			});
		});

		it('omits unset optional fields', async () => {
			const mock = createMock({
				resource: 'memory',
				operation: 'search',
				query: 'anything',
				namespace: '',
				searchAdditionalFields: {},
			});

			await node.execute.call(mock as unknown as IExecuteFunctions);

			const body = getRequestOptions(mock).body as Record<string, unknown>;
			expect(body).toEqual({ query: 'anything' });
		});

		it('includes tags filter', async () => {
			const mock = createMock({
				resource: 'memory',
				operation: 'search',
				query: 'tagged search',
				namespace: '',
				searchAdditionalFields: { tags: 'preference, urgent' },
			});

			await node.execute.call(mock as unknown as IExecuteFunctions);

			const body = getRequestOptions(mock).body as Record<string, unknown>;
			expect(body.tags).toEqual(['preference', 'urgent']);
		});
	});

	// ── Memory > Get Context ────────────────────────────────────────────────

	describe('Memory > Get Context', () => {
		it('POSTs to /v1/memories/context with query, format, and namespace', async () => {
			const mock = createMock(
				{
					resource: 'memory',
					operation: 'getContext',
					query: 'customer summary',
					format: 'system_prompt',
					namespace: 'customer:alice',
					contextAdditionalFields: {
						maxMemories: 10,
						threshold: 0.35,
					},
				},
				{ context: 'You know the user prefers dark mode.' },
			);

			const result = await node.execute.call(
				mock as unknown as IExecuteFunctions,
			);

			const opts = getRequestOptions(mock);
			expect(opts.method).toBe('POST');
			expect(opts.url).toBe(`${BASE_URL}/v1/memories/context`);
			expect(opts.body).toEqual({
				query: 'customer summary',
				format: 'system_prompt',
				namespace: 'customer:alice',
				limit: 10,
				threshold: 0.35,
			});
			expect(result[0][0].json).toEqual({
				context: 'You know the user prefers dark mode.',
			});
		});

		it('sends only query and format when no additional fields', async () => {
			const mock = createMock({
				resource: 'memory',
				operation: 'getContext',
				query: 'basics',
				format: 'bullet_list',
				namespace: '',
				contextAdditionalFields: {},
			});

			await node.execute.call(mock as unknown as IExecuteFunctions);

			const body = getRequestOptions(mock).body as Record<string, unknown>;
			expect(body).toEqual({ query: 'basics', format: 'bullet_list' });
		});
	});

	// ── Memory > List ───────────────────────────────────────────────────────

	describe('Memory > List', () => {
		it('GETs /v1/memories with namespace and limit', async () => {
			const mock = createMock(
				{
					resource: 'memory',
					operation: 'list',
					namespace: 'customer:alice',
					listAdditionalFields: { limit: 10 },
				},
				{ memories: [] },
			);

			await node.execute.call(mock as unknown as IExecuteFunctions);

			const opts = getRequestOptions(mock);
			expect(opts.method).toBe('GET');
			expect(opts.url).toBe(`${BASE_URL}/v1/memories`);
			expect(opts.qs).toEqual({
				namespace: 'customer:alice',
				limit: 10,
			});
		});

		it('includes offset', async () => {
			const mock = createMock({
				resource: 'memory',
				operation: 'list',
				namespace: 'project:onboarding',
				listAdditionalFields: {
					limit: 20,
					offset: 50,
				},
			});

			await node.execute.call(mock as unknown as IExecuteFunctions);

			const opts = getRequestOptions(mock);
			expect(opts.qs).toEqual(
				expect.objectContaining({
					namespace: 'project:onboarding',
					limit: 20,
					offset: 50,
				}),
			);
		});

		it('sends no qs when no additional fields and no namespace', async () => {
			const mock = createMock({
				resource: 'memory',
				operation: 'list',
				namespace: '',
				listAdditionalFields: {},
			});

			await node.execute.call(mock as unknown as IExecuteFunctions);

			const opts = getRequestOptions(mock);
			expect(opts.qs).toBeUndefined();
		});
	});

	// ── Memory > Delete ─────────────────────────────────────────────────────

	describe('Memory > Delete', () => {
		it('DELETEs /v1/memories with namespace', async () => {
			const mock = createMock(
				{
					resource: 'memory',
					operation: 'delete',
					namespace: 'customer:alice',
				},
				{ deleted: 5 },
			);

			await node.execute.call(mock as unknown as IExecuteFunctions);

			const opts = getRequestOptions(mock);
			expect(opts.method).toBe('DELETE');
			expect(opts.url).toBe(`${BASE_URL}/v1/memories`);
			expect(opts.body).toEqual({ namespace: 'customer:alice' });
		});

		it('DELETEs with empty body when no namespace', async () => {
			const mock = createMock(
				{
					resource: 'memory',
					operation: 'delete',
					namespace: '',
				},
				{ deleted: 12 },
			);

			await node.execute.call(mock as unknown as IExecuteFunctions);

			const opts = getRequestOptions(mock);
			// body is empty object — apiRequest omits body when empty
			expect(opts.body).toBeUndefined();
		});
	});

	// ── Workspace > Get Info ────────────────────────────────────────────────

	describe('Workspace > Get Info', () => {
		it('GETs /v1/workspace', async () => {
			const mock = createMock(
				{
					resource: 'workspace',
					operation: 'getInfo',
				},
				{
					workspace_id: 'ws_abc',
					plan: 'pro',
					memory_count: 42,
				},
			);

			const result = await node.execute.call(
				mock as unknown as IExecuteFunctions,
			);

			const opts = getRequestOptions(mock);
			expect(opts.method).toBe('GET');
			expect(opts.url).toBe(`${BASE_URL}/v1/workspace`);
			expect(result[0][0].json).toEqual({
				workspace_id: 'ws_abc',
				plan: 'pro',
				memory_count: 42,
			});
		});
	});

	// ── Error handling ──────────────────────────────────────────────────────

	describe('error handling', () => {
		it('returns error item when continueOnFail is true', async () => {
			const mock = createMock(
				{
					resource: 'memory',
					operation: 'store',
					content: 'test',
					namespace: '',
					storeAdditionalFields: {},
				},
				undefined,
				true,
			);
			mock.helpers.httpRequestWithAuthentication.mockRejectedValue(
				new Error('Connection refused'),
			);

			const result = await node.execute.call(
				mock as unknown as IExecuteFunctions,
			);

			expect(result[0][0].json).toEqual({
				error: 'Connection refused',
			});
		});

		it('throws NodeApiError when continueOnFail is false', async () => {
			const mock = createMock(
				{
					resource: 'memory',
					operation: 'store',
					content: 'test',
					namespace: '',
					storeAdditionalFields: {},
				},
				undefined,
				false,
			);
			mock.helpers.httpRequestWithAuthentication.mockRejectedValue(
				new Error('Unauthorized'),
			);

			await expect(
				node.execute.call(mock as unknown as IExecuteFunctions),
			).rejects.toThrow();
		});
	});

	// ── Multiple items ──────────────────────────────────────────────────────

	describe('multiple input items', () => {
		it('processes each item independently', async () => {
			const items = [
				{ content: 'first memory', namespace: 'customer:u1' },
				{ content: 'second memory', namespace: 'customer:u2' },
			];

			const httpMock = jest.fn().mockResolvedValue({ id: 'ok' });
			const mock = {
				getInputData: () =>
					items.map((item) => ({ json: item, pairedItem: 0 })),
				getNodeParameter: (name: string, i: number, defaultValue?: unknown) => {
					if (name === 'resource') return 'memory';
					if (name === 'operation') return 'store';
					if (name === 'content') return items[i].content;
					if (name === 'namespace') return items[i].namespace;
					if (name === 'storeAdditionalFields') return {};
					return defaultValue;
				},
				getCredentials: jest.fn().mockResolvedValue({
					apiKey: API_KEY,
					baseUrl: BASE_URL,
				}),
				helpers: { httpRequestWithAuthentication: httpMock },
				continueOnFail: () => false,
				getNode: () => ({
					name: 'Retainr',
					type: 'n8n-nodes-retainr.retainr',
					id: 'n1',
					position: [0, 0],
					parameters: {},
				}),
			} as unknown as IExecuteFunctions;

			const result = await node.execute.call(mock);

			expect(httpMock).toHaveBeenCalledTimes(2);
			expect(result[0]).toHaveLength(2);
		});
	});

	// ── Uses httpRequestWithAuthentication ───────────────────────────────────

	describe('authentication', () => {
		it('calls httpRequestWithAuthentication with retainrApi credential name', async () => {
			const mock = createMock({
				resource: 'workspace',
				operation: 'getInfo',
			});

			await node.execute.call(mock as unknown as IExecuteFunctions);

			expect(
				mock.helpers.httpRequestWithAuthentication,
			).toHaveBeenCalledWith('retainrApi', expect.any(Object));
		});
	});
});
