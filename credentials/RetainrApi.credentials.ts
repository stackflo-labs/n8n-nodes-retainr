import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class RetainrApi implements ICredentialType {
	name = 'retainrApi';
	displayName = 'Retainr API';
	documentationUrl = 'https://retainr.dev/docs/api';

	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			placeholder: 'rec_live_...',
			description:
				'Your retainr.dev API key. Each key is scoped to one workspace. Create keys at https://retainr.dev/dashboard.',
		},
		{
			displayName: 'Base URL',
			name: 'baseUrl',
			type: 'string',
			default: 'https://api.retainr.dev',
			description:
				'API base URL. Only change this if you run a self-hosted instance.',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials.apiKey}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.baseUrl}}',
			url: '/v1/workspace',
			method: 'GET',
		},
	};
}
