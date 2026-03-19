import type {
	IDataObject,
	IExecuteFunctions,
	IHttpRequestMethods,
	IHttpRequestOptions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	JsonObject,
} from 'n8n-workflow';
import { NodeApiError } from 'n8n-workflow';

export class Retainr implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Retainr',
		name: 'retainr',
		icon: 'file:retainr.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{"getContext":"Get Context","store":"Store Memory","search":"Search Memories","list":"List Memories","delete":"Delete Memories","getUsage":"Get Usage"}[$parameter["operation"]] ?? $parameter["operation"]}}',
		description: 'Store, search, and retrieve AI agent memories.',
		defaults: {
			name: 'Retainr',
		},
		inputs: ['main'],
		outputs: ['main'],
		usableAsTool: true,
		credentials: [
			{
				name: 'retainrApi',
				required: true,
			},
		],
		properties: [
			// ------------------------------------------------------------------
			//  Resource
			// ------------------------------------------------------------------
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Memory',
						value: 'memory',
					},
					{
						name: 'Workspace',
						value: 'workspace',
					},
				],
				default: 'memory',
			},

			// ------------------------------------------------------------------
			//  Operations — Memory
			// ------------------------------------------------------------------
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['memory'],
					},
				},
				options: [
					{
						name: 'Delete',
						value: 'delete',
						description: 'Delete memories matching a filter.',
						action: 'Delete memories',
					},
					{
						name: 'Get Context',
						value: 'getContext',
						description: 'Get pre-formatted memory context for LLM prompts.',
						action: 'Get memory context',
					},
					{
						name: 'List',
						value: 'list',
						description: 'List memories with optional filters.',
						action: 'List memories',
					},
					{
						name: 'Search',
						value: 'search',
						description: 'Semantic search across memories.',
						action: 'Search memories',
					},
					{
						name: 'Store',
						value: 'store',
						description: 'Store a new memory.',
						action: 'Store a memory',
					},
				],
				default: 'store',
			},

			// ------------------------------------------------------------------
			//  Operations — Workspace
			// ------------------------------------------------------------------
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['workspace'],
					},
				},
				options: [
					{
						name: 'Get Info',
						value: 'getInfo',
						description: 'Get workspace details, usage, and API keys.',
						action: 'Get workspace info',
					},
				],
				default: 'getInfo',
			},

			// ==================================================================
			//  Fields — Memory > Store
			// ==================================================================
			{
				displayName: 'Content',
				name: 'content',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				required: true,
				default: '',
				placeholder: 'The user prefers dark mode and speaks French.',
				description: 'The memory content to store (max 32 768 characters).',
				displayOptions: {
					show: {
						resource: ['memory'],
						operation: ['store'],
					},
				},
			},
			{
				displayName: 'Namespace',
				name: 'namespace',
				type: 'string',
				default: '',
				placeholder: 'customer:alice',
				description:
					'Group memories by any string. Leave empty for global scope.',
				displayOptions: {
					show: {
						resource: ['memory'],
						operation: ['store'],
					},
				},
			},
			{
				displayName: 'Additional Fields',
				name: 'storeAdditionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						resource: ['memory'],
						operation: ['store'],
					},
				},
				options: [
					{
						displayName: 'Dedup Threshold',
						name: 'dedupThreshold',
						type: 'number',
						typeOptions: {
							minValue: 0,
							numberPrecision: 2,
						},
						default: 0,
						description:
							'Similarity threshold (0-1) for deduplication. 0 disables dedup. 0.95 is a good starting point.',
					},
					{
						displayName: 'Metadata',
						name: 'metadata',
						type: 'json',
						default: '{}',
						description: 'Arbitrary key-value pairs as JSON object.',
					},
					{
						displayName: 'Tags',
						name: 'tags',
						type: 'string',
						default: '',
						description:
							'Comma-separated list of tags for categorical filtering (max 20 tags, 64 chars each).',
					},
					{
						displayName: 'TTL (Seconds)',
						name: 'ttlSeconds',
						type: 'number',
						typeOptions: {
							minValue: 0,
						},
						default: 0,
						description:
							'Time to live in seconds. 0 means no expiration. Max 31 536 000 (1 year).',
					},
				],
			},

			// ==================================================================
			//  Fields — Memory > Search
			// ==================================================================
			{
				displayName: 'Query',
				name: 'query',
				type: 'string',
				typeOptions: {
					rows: 2,
				},
				required: true,
				default: '',
				placeholder: "What are this user's preferences?",
				description: 'Natural language query for semantic search.',
				displayOptions: {
					show: {
						resource: ['memory'],
						operation: ['search'],
					},
				},
			},
			{
				displayName: 'Namespace',
				name: 'namespace',
				type: 'string',
				required: false,
				default: '',
				placeholder: 'customer:alice',
				description:
					'Group memories by any string. Leave empty for global scope.',
				displayOptions: {
					show: {
						resource: ['memory'],
						operation: ['search'],
					},
				},
			},
			{
				displayName: 'Additional Fields',
				name: 'searchAdditionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						resource: ['memory'],
						operation: ['search'],
					},
				},
				options: [
					{
						displayName: 'Limit',
						name: 'limit',
						type: 'number',
						typeOptions: {
							minValue: 1,
						},
						default: 50,
						description: 'Max number of results to return.',
					},
					{
						displayName: 'Tags',
						name: 'tags',
						type: 'string',
						default: '',
						description: 'Comma-separated list of tags to filter by.',
					},
					{
						displayName: 'Threshold',
						name: 'threshold',
						type: 'number',
						typeOptions: {
							minValue: 0,
							numberPrecision: 2,
						},
						default: 0.5,
						description: 'Minimum similarity threshold (0-1).',
					},
				],
			},

			// ==================================================================
			//  Fields — Memory > Get Context
			// ==================================================================
			{
				displayName: 'Query',
				name: 'query',
				type: 'string',
				typeOptions: {
					rows: 2,
				},
				required: true,
				default: '',
				placeholder: 'Summarize what we know about this customer',
				description: 'Natural language query to retrieve relevant context.',
				displayOptions: {
					show: {
						resource: ['memory'],
						operation: ['getContext'],
					},
				},
			},
			{
				displayName: 'Format',
				name: 'format',
				type: 'options',
				default: 'system_prompt',
				description: 'Output format for the context block.',
				options: [
					{
						name: 'System Prompt',
						value: 'system_prompt',
						description: 'Formatted as an LLM system prompt with header.',
					},
					{
						name: 'Bullet List',
						value: 'bullet_list',
						description: 'Simple bulleted list of memories.',
					},
					{
						name: 'Numbered List',
						value: 'numbered_list',
						description: 'Numbered list of memories.',
					},
				],
				displayOptions: {
					show: {
						resource: ['memory'],
						operation: ['getContext'],
					},
				},
			},
			{
				displayName: 'Namespace',
				name: 'namespace',
				type: 'string',
				required: false,
				default: '',
				placeholder: 'customer:alice',
				description:
					'Group memories by any string. Leave empty for global scope.',
				displayOptions: {
					show: {
						resource: ['memory'],
						operation: ['getContext'],
					},
				},
			},
			{
				displayName: 'Additional Fields',
				name: 'contextAdditionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						resource: ['memory'],
						operation: ['getContext'],
					},
				},
				options: [
					{
						displayName: 'Max Memories',
						name: 'maxMemories',
						type: 'number',
						typeOptions: {
							minValue: 1,
						},
						default: 5,
						description: 'Maximum number of memories to include in the context (API max 20).',
					},
					{
						displayName: 'Tags',
						name: 'tags',
						type: 'string',
						default: '',
						description: 'Comma-separated list of tags to filter by.',
					},
					{
						displayName: 'Threshold',
						name: 'threshold',
						type: 'number',
						typeOptions: {
							minValue: 0,
							numberPrecision: 2,
						},
						default: 0.35,
						description: 'Minimum similarity threshold (0-1).',
					},
				],
			},

			// ==================================================================
			//  Fields — Memory > List
			// ==================================================================
			{
				displayName: 'Namespace',
				name: 'namespace',
				type: 'string',
				required: false,
				default: '',
				placeholder: 'customer:alice',
				description:
					'Group memories by any string. Leave empty for global scope.',
				displayOptions: {
					show: {
						resource: ['memory'],
						operation: ['list'],
					},
				},
			},
			{
				displayName: 'Additional Fields',
				name: 'listAdditionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						resource: ['memory'],
						operation: ['list'],
					},
				},
				options: [
					{
						displayName: 'Limit',
						name: 'limit',
						type: 'number',
						typeOptions: {
							minValue: 1,
						},
						default: 50,
						description: 'Max number of results to return.',
					},
					{
						displayName: 'Offset',
						name: 'offset',
						type: 'number',
						typeOptions: {
							minValue: 0,
						},
						default: 0,
						description: 'Pagination offset.',
					},
					{
						displayName: 'Tags',
						name: 'tags',
						type: 'string',
						default: '',
						description: 'Comma-separated list of tags to filter by.',
					},
				],
			},

			// ==================================================================
			//  Fields — Memory > Delete
			// ==================================================================
			{
				displayName: 'Namespace',
				name: 'namespace',
				type: 'string',
				required: false,
				default: '',
				placeholder: 'customer:alice',
				description:
					'Group memories by any string. Leave empty for global scope.',
				displayOptions: {
					show: {
						resource: ['memory'],
						operation: ['delete'],
					},
				},
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;
		const credentials = await this.getCredentials('retainrApi');
		const baseUrl = (credentials.baseUrl as string).replace(/\/+$/, '');

		for (let i = 0; i < items.length; i++) {
			try {

				let responseData: IDataObject;

				// --------------------------------------------------------------
				//  Memory
				// --------------------------------------------------------------
				if (resource === 'memory') {
					if (operation === 'store') {
						responseData = await storeMemory.call(this, i, baseUrl);
					} else if (operation === 'search') {
						responseData = await searchMemories.call(this, i, baseUrl);
					} else if (operation === 'getContext') {
						responseData = await getContext.call(this, i, baseUrl);
					} else if (operation === 'list') {
						responseData = await listMemories.call(this, i, baseUrl);
					} else if (operation === 'delete') {
						responseData = await deleteMemories.call(this, i, baseUrl);
					} else {
						throw new Error(`Unknown operation: ${operation}`);
					}
				}
				// --------------------------------------------------------------
				//  Workspace
				// --------------------------------------------------------------
				else if (resource === 'workspace') {
					if (operation === 'getInfo') {
						responseData = await getWorkspaceInfo.call(this, baseUrl);
					} else {
						throw new Error(`Unknown operation: ${operation}`);
					}
				} else {
					throw new Error(`Unknown resource: ${resource}`);
				}

				returnData.push({ json: responseData, pairedItem: { item: i } });
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: { error: (error as Error).message },
						pairedItem: { item: i },
					});
					continue;
				}
				throw new NodeApiError(this.getNode(), error as JsonObject, {
					itemIndex: i,
				});
			}
		}

		return [returnData];
	}
}

// ======================================================================
//  Helper: Make an authenticated API request
// ======================================================================

async function apiRequest(
	this: IExecuteFunctions,
	method: IHttpRequestMethods,
	baseUrl: string,
	path: string,
	body?: IDataObject,
	qs?: IDataObject,
): Promise<IDataObject> {
	const options: IHttpRequestOptions = {
		method,
		url: `${baseUrl}${path}`,
		json: true,
	};

	if (body && Object.keys(body).length > 0) {
		options.body = body;
	}

	if (qs && Object.keys(qs).length > 0) {
		options.qs = qs;
	}

	return (await this.helpers.httpRequestWithAuthentication.call(
		this,
		'retainrApi',
		options,
	)) as IDataObject;
}

// ======================================================================
//  Helper: Parse comma-separated tags into array
// ======================================================================

function parseTags(raw: string): string[] {
	if (!raw) return [];
	return raw
		.split(',')
		.map((t) => t.trim())
		.filter(Boolean);
}

// ======================================================================
//  Operation handlers
// ======================================================================

async function storeMemory(
	this: IExecuteFunctions,
	i: number,
	baseUrl: string,
): Promise<IDataObject> {
	const content = this.getNodeParameter('content', i) as string;
	const namespace = this.getNodeParameter('namespace', i, '') as string;
	const additional = this.getNodeParameter(
		'storeAdditionalFields',
		i,
	) as IDataObject;

	const body: IDataObject = { content };

	if (namespace) {
		body.namespace = namespace;
	}
	if (additional.tags) body.tags = parseTags(additional.tags as string);
	if (additional.ttlSeconds) body.ttl_seconds = additional.ttlSeconds;
	if (additional.dedupThreshold) {
		body.dedup_threshold = additional.dedupThreshold;
	}
	if (additional.metadata) {
		body.metadata =
			typeof additional.metadata === 'string'
				? JSON.parse(additional.metadata)
				: additional.metadata;
	}

	return apiRequest.call(this, 'POST', baseUrl, '/v1/memories', body);
}

async function searchMemories(
	this: IExecuteFunctions,
	i: number,
	baseUrl: string,
): Promise<IDataObject> {
	const query = this.getNodeParameter('query', i) as string;
	const namespace = this.getNodeParameter('namespace', i, '') as string;
	const additional = this.getNodeParameter(
		'searchAdditionalFields',
		i,
	) as IDataObject;

	const body: IDataObject = { query };

	if (namespace) {
		body.namespace = namespace;
	}
	if (additional.tags) body.tags = parseTags(additional.tags as string);
	if (additional.limit) body.limit = additional.limit;
	if (additional.threshold) body.threshold = additional.threshold;

	return apiRequest.call(this, 'POST', baseUrl, '/v1/memories/search', body);
}

async function getContext(
	this: IExecuteFunctions,
	i: number,
	baseUrl: string,
): Promise<IDataObject> {
	const query = this.getNodeParameter('query', i) as string;
	const format = this.getNodeParameter('format', i) as string;
	const namespace = this.getNodeParameter('namespace', i, '') as string;
	const additional = this.getNodeParameter(
		'contextAdditionalFields',
		i,
	) as IDataObject;

	const body: IDataObject = { query, format };

	if (namespace) {
		body.namespace = namespace;
	}
	if (additional.tags) body.tags = parseTags(additional.tags as string);
	if (additional.maxMemories) body.limit = additional.maxMemories;
	if (additional.threshold) body.threshold = additional.threshold;

	return apiRequest.call(this, 'POST', baseUrl, '/v1/memories/context', body);
}

async function listMemories(
	this: IExecuteFunctions,
	i: number,
	baseUrl: string,
): Promise<IDataObject> {
	const namespace = this.getNodeParameter('namespace', i, '') as string;
	const additional = this.getNodeParameter(
		'listAdditionalFields',
		i,
	) as IDataObject;

	const qs: IDataObject = {};

	if (namespace) {
		qs.namespace = namespace;
	}
	if (additional.tags) qs.tags = (additional.tags as string);
	if (additional.limit) qs.limit = additional.limit;
	if (additional.offset) qs.offset = additional.offset;

	return apiRequest.call(
		this,
		'GET',
		baseUrl,
		'/v1/memories',
		undefined,
		qs,
	);
}

async function deleteMemories(
	this: IExecuteFunctions,
	i: number,
	baseUrl: string,
): Promise<IDataObject> {
	const namespace = this.getNodeParameter('namespace', i, '') as string;

	const body: IDataObject = {};

	if (namespace) {
		body.namespace = namespace;
	}

	return apiRequest.call(this, 'DELETE', baseUrl, '/v1/memories', body);
}

async function getWorkspaceInfo(
	this: IExecuteFunctions,
	baseUrl: string,
): Promise<IDataObject> {
	return apiRequest.call(this, 'GET', baseUrl, '/v1/workspace');
}
