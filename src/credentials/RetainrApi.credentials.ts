import type { ICredentialType, INodeProperties } from 'n8n-workflow';

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
      description: 'Your retainr.dev API key. Get one at https://retainr.dev/dashboard',
    },
    {
      displayName: 'Base URL',
      name: 'baseUrl',
      type: 'string',
      default: 'https://api.retainr.dev',
      description: 'Leave as default unless using a self-hosted instance',
    },
  ];
}
