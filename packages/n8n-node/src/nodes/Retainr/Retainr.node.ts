import type {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionType, NodeOperationError } from 'n8n-workflow';

export class Retainr implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Retainr',
    name: 'retainr',
    icon: 'file:retainr.svg',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["operation"]}}',
    description: 'AI agent memory persistence for your automations',
    defaults: { name: 'Retainr' },
    inputs: [NodeConnectionType.Main],
    outputs: [NodeConnectionType.Main],
    credentials: [{ name: 'retainrApi', required: true }],

    properties: [
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        options: [
          { name: 'Store Memory', value: 'storeMemory', description: 'Save a memory for later retrieval' },
          { name: 'Search Memory', value: 'searchMemory', description: 'Find relevant memories by semantic search' },
          { name: 'List Memories', value: 'listMemories', description: 'List memories with exact filters' },
          { name: 'Delete Memories', value: 'deleteMemories', description: 'Clear memories by scope or identifier' },
          { name: 'Generate PDF', value: 'generatePdf', description: 'Generate a PDF from a template' },
          { name: 'Get PDF Status', value: 'getPdfStatus', description: 'Check PDF generation status' },
        ],
        default: 'storeMemory',
      },

      // ── Store Memory ──────────────────────────────────────────────────────────
      {
        displayName: 'Content',
        name: 'content',
        type: 'string',
        typeOptions: { rows: 3 },
        displayOptions: { show: { operation: ['storeMemory'] } },
        default: '',
        required: true,
        description: 'The memory content to store',
      },
      {
        displayName: 'Scope',
        name: 'scope',
        type: 'options',
        options: [
          { name: 'Session', value: 'session', description: 'Scoped to a single workflow run' },
          { name: 'User', value: 'user', description: 'Persists across sessions for a user' },
          { name: 'Agent', value: 'agent', description: 'Shared across all users for an agent' },
          { name: 'Global', value: 'global', description: 'Shared across the entire workspace' },
        ],
        displayOptions: { show: { operation: ['storeMemory', 'searchMemory', 'listMemories', 'deleteMemories'] } },
        default: 'user',
        required: true,
      },
      {
        displayName: 'User ID',
        name: 'userId',
        type: 'string',
        displayOptions: { show: { operation: ['storeMemory', 'searchMemory', 'listMemories', 'deleteMemories'], scope: ['user'] } },
        default: '',
        description: 'Unique identifier for the user (e.g. email or customer ID)',
        required: true,
      },
      {
        displayName: 'Session ID',
        name: 'sessionId',
        type: 'string',
        displayOptions: { show: { operation: ['storeMemory', 'searchMemory', 'listMemories', 'deleteMemories'], scope: ['session'] } },
        default: '',
        description: 'Unique identifier for this workflow run',
        required: true,
      },
      {
        displayName: 'Agent ID',
        name: 'agentId',
        type: 'string',
        displayOptions: { show: { operation: ['storeMemory', 'searchMemory', 'listMemories', 'deleteMemories'], scope: ['agent'] } },
        default: '',
        description: 'Unique identifier for the agent',
        required: true,
      },
      {
        displayName: 'TTL (seconds)',
        name: 'ttlSeconds',
        type: 'number',
        displayOptions: { show: { operation: ['storeMemory'] } },
        default: 0,
        description: 'Time-to-live in seconds. 0 = no expiry.',
      },
      {
        displayName: 'Tags',
        name: 'tags',
        type: 'string',
        displayOptions: { show: { operation: ['storeMemory'] } },
        default: '',
        description: 'Comma-separated tags (e.g. "preference,communication")',
      },

      // ── Search Memory ─────────────────────────────────────────────────────────
      {
        displayName: 'Query',
        name: 'query',
        type: 'string',
        displayOptions: { show: { operation: ['searchMemory'] } },
        default: '',
        required: true,
        description: 'Natural language query to find relevant memories',
      },
      {
        displayName: 'Limit',
        name: 'limit',
        type: 'number',
        displayOptions: { show: { operation: ['searchMemory', 'listMemories'] } },
        default: 5,
        description: 'Maximum number of results to return',
      },
      {
        displayName: 'Similarity Threshold',
        name: 'threshold',
        type: 'number',
        typeOptions: { minValue: 0, maxValue: 1, numberPrecision: 2 },
        displayOptions: { show: { operation: ['searchMemory'] } },
        default: 0.7,
        description: 'Minimum similarity score (0–1). Higher = more relevant results only.',
      },

      // ── PDF ───────────────────────────────────────────────────────────────────
      {
        displayName: 'Template',
        name: 'pdfTemplate',
        type: 'options',
        options: [
          { name: 'Invoice', value: 'invoice' },
          { name: 'Purchase Order', value: 'purchase_order' },
          { name: 'Quote', value: 'quote' },
          { name: 'Custom HTML', value: '__custom__' },
        ],
        displayOptions: { show: { operation: ['generatePdf'] } },
        default: 'invoice',
        required: true,
      },
      {
        displayName: 'Custom Template HTML',
        name: 'templateHtml',
        type: 'string',
        typeOptions: { rows: 5 },
        displayOptions: { show: { operation: ['generatePdf'], pdfTemplate: ['__custom__'] } },
        default: '',
        description: 'Handlebars HTML template. Use {{variable}} for dynamic values.',
      },
      {
        displayName: 'Data (JSON)',
        name: 'pdfData',
        type: 'json',
        displayOptions: { show: { operation: ['generatePdf'] } },
        default: '{}',
        description: 'Data to inject into the template',
        required: true,
      },
      {
        displayName: 'Webhook URL',
        name: 'webhookUrl',
        type: 'string',
        displayOptions: { show: { operation: ['generatePdf'] } },
        default: '',
        description: 'Optional URL to notify when PDF is ready',
      },
      {
        displayName: 'Job ID',
        name: 'jobId',
        type: 'string',
        displayOptions: { show: { operation: ['getPdfStatus'] } },
        default: '',
        required: true,
        description: 'The job_id returned from Generate PDF',
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const operation = this.getNodeParameter('operation', 0) as string;
    const credentials = await this.getCredentials('retainrApi');
    const baseUrl = credentials.baseUrl as string;
    const apiKey = credentials.apiKey as string;

    const results: INodeExecutionData[] = [];

    for (let i = 0; i < items.length; i++) {
      try {
        let responseData: unknown;

        if (operation === 'storeMemory') {
          const scope = this.getNodeParameter('scope', i) as string;
          const body: Record<string, unknown> = {
            content: this.getNodeParameter('content', i),
            scope,
          };
          if (scope === 'user') body.user_id = this.getNodeParameter('userId', i);
          if (scope === 'session') body.session_id = this.getNodeParameter('sessionId', i);
          if (scope === 'agent') body.agent_id = this.getNodeParameter('agentId', i);

          const ttl = this.getNodeParameter('ttlSeconds', i) as number;
          if (ttl > 0) body.ttl_seconds = ttl;

          const tags = this.getNodeParameter('tags', i) as string;
          if (tags) body.tags = tags.split(',').map((t) => t.trim()).filter(Boolean);

          responseData = await this.helpers.request({
            method: 'POST',
            url: `${baseUrl}/v1/memories`,
            headers: { Authorization: `Bearer ${apiKey}` },
            body,
            json: true,
          });

        } else if (operation === 'searchMemory') {
          const scope = this.getNodeParameter('scope', i) as string;
          const body: Record<string, unknown> = {
            query: this.getNodeParameter('query', i),
            scope,
            limit: this.getNodeParameter('limit', i),
            threshold: this.getNodeParameter('threshold', i),
          };
          if (scope === 'user') body.user_id = this.getNodeParameter('userId', i);
          if (scope === 'session') body.session_id = this.getNodeParameter('sessionId', i);
          if (scope === 'agent') body.agent_id = this.getNodeParameter('agentId', i);

          responseData = await this.helpers.request({
            method: 'POST',
            url: `${baseUrl}/v1/memories/search`,
            headers: { Authorization: `Bearer ${apiKey}` },
            body,
            json: true,
          });

        } else if (operation === 'listMemories') {
          const scope = this.getNodeParameter('scope', i) as string;
          const params = new URLSearchParams({ scope, limit: String(this.getNodeParameter('limit', i)) });
          if (scope === 'user') params.set('user_id', this.getNodeParameter('userId', i) as string);
          if (scope === 'session') params.set('session_id', this.getNodeParameter('sessionId', i) as string);
          if (scope === 'agent') params.set('agent_id', this.getNodeParameter('agentId', i) as string);

          responseData = await this.helpers.request({
            method: 'GET',
            url: `${baseUrl}/v1/memories?${params}`,
            headers: { Authorization: `Bearer ${apiKey}` },
            json: true,
          });

        } else if (operation === 'deleteMemories') {
          const scope = this.getNodeParameter('scope', i) as string;
          const body: Record<string, unknown> = { scope };
          if (scope === 'user') body.user_id = this.getNodeParameter('userId', i);
          if (scope === 'session') body.session_id = this.getNodeParameter('sessionId', i);
          if (scope === 'agent') body.agent_id = this.getNodeParameter('agentId', i);

          responseData = await this.helpers.request({
            method: 'DELETE',
            url: `${baseUrl}/v1/memories`,
            headers: { Authorization: `Bearer ${apiKey}` },
            body,
            json: true,
          });

        } else if (operation === 'generatePdf') {
          const template = this.getNodeParameter('pdfTemplate', i) as string;
          const body: Record<string, unknown> = {
            data: JSON.parse(this.getNodeParameter('pdfData', i) as string),
          };
          if (template === '__custom__') {
            body.template_html = this.getNodeParameter('templateHtml', i);
          } else {
            body.template = template;
          }
          const webhook = this.getNodeParameter('webhookUrl', i) as string;
          if (webhook) body.webhook_url = webhook;

          responseData = await this.helpers.request({
            method: 'POST',
            url: `${baseUrl}/v1/pdf/generate`,
            headers: { Authorization: `Bearer ${apiKey}` },
            body,
            json: true,
          });

        } else if (operation === 'getPdfStatus') {
          const jobId = this.getNodeParameter('jobId', i) as string;
          responseData = await this.helpers.request({
            method: 'GET',
            url: `${baseUrl}/v1/pdf/jobs/${jobId}`,
            headers: { Authorization: `Bearer ${apiKey}` },
            json: true,
          });
        }

        results.push({ json: responseData as Record<string, unknown> });

      } catch (error) {
        if (this.continueOnFail()) {
          results.push({ json: { error: (error as Error).message }, pairedItem: i });
          continue;
        }
        throw new NodeOperationError(this.getNode(), error as Error, { itemIndex: i });
      }
    }

    return [results];
  }
}
