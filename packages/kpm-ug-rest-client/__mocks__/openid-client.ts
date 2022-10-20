import assert from "node:assert/strict";

const _mockResponses: { [index: string]: any } = {};

class Client {
  _client_id: string;
  _client_secret: string;
  _grant_type?: string;
  _scope?: string;

  constructor({ client_id, client_secret }: any) {
    this._client_id = client_id;
    this._client_secret = client_secret;
  }

  async grant({ grant_type, scope }: any) {
    this._grant_type = grant_type;
    this._scope = scope;

    return {
      access_token: `dummy-token ${grant_type} ${scope}`,
      expires_at: Date.now() + 1,
    };
  }

  async requestResource(path: string, token: string) {
    assert(
      _mockResponses[path] !== undefined,
      `The requested path ${path} hasn't been mocked, check spelling.`
    );
    return _mockResponses[path];
  }
}

export class Issuer {
  static async discover(baseURI: string) {
    return {
      Client,
      metadata: {
        grant_types_supported: ["client_credentials"],
      },
    };
  }
}

/**
 * Add mock responses for testing
 */
export function addMockResponse(path: string, response: any) {
  _mockResponses[path] = response;
}
