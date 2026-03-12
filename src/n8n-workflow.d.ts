declare module 'n8n-workflow' {
  export interface INodeProperties {
    displayName: string;
    name: string;
    type: string;
    typeOptions?: Record<string, unknown>;
    default: unknown;
    placeholder?: string;
    description?: string;
  }

  export interface ICredentialType {
    name: string;
    displayName: string;
    documentationUrl?: string;
    properties: INodeProperties[];
  }
}
