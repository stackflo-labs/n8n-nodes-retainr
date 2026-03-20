"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RetainrApi = void 0;
class RetainrApi {
    constructor() {
        this.name = 'retainrApi';
        this.displayName = 'Retainr API';
        this.documentationUrl = 'https://retainr.dev/docs/api';
        this.properties = [
            {
                displayName: 'API Key',
                name: 'apiKey',
                type: 'string',
                typeOptions: { password: true },
                default: '',
                placeholder: 'rec_live_...',
                description: 'Your retainr.dev API key. Each key is scoped to one workspace. Create keys at https://retainr.dev/dashboard.',
            },
            {
                displayName: 'Base URL',
                name: 'baseUrl',
                type: 'string',
                default: 'https://api.retainr.dev',
                description: 'API base URL. Only change this if you run a self-hosted instance.',
            },
        ];
        this.authenticate = {
            type: 'generic',
            properties: {
                headers: {
                    Authorization: '=Bearer {{$credentials.apiKey}}',
                },
            },
        };
        this.test = {
            request: {
                baseURL: '={{$credentials.baseUrl}}',
                url: '/v1/workspace',
                method: 'GET',
            },
        };
    }
}
exports.RetainrApi = RetainrApi;
