import assert from "node:assert/strict";
import { IncomingHttpHeaders, IncomingMessage } from "node:http";
import { BaseClient, Client, Issuer, TokenSet } from "openid-client";

type TErrorTypes =
  | "UGRestClientDiscoverError"
  | "UGRestClientCredentialsError"
  | "UGRestClientResponseError"
  | "UGRestClientError"
  | "UGRestClientTokenError"
  | "UGRestClientRequestError";

export class UGRestClientError extends Error {
  type: TErrorTypes;
  err: any;
  details: any;

  constructor({
    message,
    type = "UGRestClientError",
    err = undefined,
    details = undefined,
  }: {
    message: string;
    type?: TErrorTypes;
    err?: any;
    details?: any;
  }) {
    super(message);
    this.type = type;
    if (err) {
      this.err = err;
    }
    if (details) {
      this.details = details;
    }
  }
}

export type TUGRestClient = {
  authServerDiscoveryURI: string;
  resourceBaseURI: string;
  clientId: string;
  clientSecret: string;
};

export type TUGRestClientResponse<T> = {
  headers: IncomingHttpHeaders;
  method?: string | undefined;
  url?: string | undefined;
  statusCode?: number | undefined;
  statusMessage?: string | undefined;
  data?: string | undefined;
  json?: T;
};

export class UGRestClient {
  private _authServerDiscoveryURI: string;
  private _resourceBaseURI: string;
  private _clientId: string;
  private _clientSecret: string;

  private _client?: Client;
  private _accessTokenSet?: TokenSet;

  constructor({
    authServerDiscoveryURI,
    resourceBaseURI,
    clientId,
    clientSecret,
  }: TUGRestClient) {
    this._authServerDiscoveryURI = authServerDiscoveryURI;
    this._resourceBaseURI = resourceBaseURI;
    this._clientId = clientId;
    this._clientSecret = clientSecret;
  }

  private async getClient(): Promise<Client> {
    // Use cached value if available
    if (this._client) return this._client;

    const perf1 = Date.now();
    // We use OAuth flow "Client Credentials" to receive an access token
    // This token is then passed to UG REST API using client.requestResource.
    const issuer = (await Issuer.discover(this._authServerDiscoveryURI).catch(
      discoverErr
    )) as Issuer<BaseClient>;

    const grantTypes = issuer.metadata.grant_types_supported as string[];
    assert(
      grantTypes.find((v) => v === "client_credentials"),
      "Auth server doesn't support client_credential grants"
    );

    const { Client } = issuer;
    this._client = new Client({
      client_id: this._clientId,
      client_secret: this._clientSecret,
    });
    // console.debug(`Time to create UGRestClient: ${Date.now() - perf1}ms`);

    return this._client;
  }

  private async getAccessToken(): Promise<string> {
    // Use cached value if available
    // https://github.com/panva/node-openid-client/blob/main/docs/README.md#tokenset
    if (
      this._accessTokenSet &&
      (this._accessTokenSet.expires_at === undefined ||
        this._accessTokenSet.expires_at * 1000 > Date.now() + 1000)
    ) {
      return this._accessTokenSet.access_token!;
    }

    const client = (await this.getClient().catch(getClientErr)) as BaseClient;
    const accessToken = (await client
      .grant({
        grant_type: "client_credentials",
        scope: "openid",
      })
      .catch(getCredentialsErr)) as TokenSet;
    assert(
      typeof accessToken.access_token === "string",
      "No access token provided by auth server"
    );
    this._accessTokenSet = accessToken;

    return this._accessTokenSet.access_token!;
  }

  public async get<T>(path: string): Promise<TUGRestClientResponse<T>> {
    // TODO: Add error handling
    const client = (await this.getClient().catch(getClientErr)) as BaseClient;
    const accessToken = (await this.getAccessToken().catch(
      getAccessTokenErr
    )) as string;
    const resourceUri = `${this._resourceBaseURI}/${path}`;
    let res: { body?: Buffer } & IncomingMessage;
    try {
      res = await client.requestResource(resourceUri, accessToken);
    } catch (err) {
      requestResourceErr(err, { resourceUri });
    }

    const { headers, method, statusCode, statusMessage, url, body } = res!;
    const textBody = await new TextDecoder().decode(body);

    const outp = {
      headers,
      method,
      statusCode,
      statusMessage,
      url,
      data: textBody,
    };

    // Does client.requestResource throw an error if this evals to true?
    if (statusCode === undefined || statusCode >= 400) {
      throw new UGRestClientError({
        message: textBody,
        type: "UGRestClientResponseError",
        details: {
          resourceUri,
          method,
          headers,
          statusCode,
        },
      });
    }

    try {
      const jsonBody = JSON.parse(textBody);
      return {
        ...outp,
        json: jsonBody,
      };
    } catch (e) {
      return outp;
    }
  }
}

function discoverErr(err: any) {
  Error.captureStackTrace(err, discoverErr);
  throw new UGRestClientError({
    message: "Error during open-id discovery",
    type: "UGRestClientDiscoverError",
    err,
  });
}

function getCredentialsErr(err: any) {
  Error.captureStackTrace(err, discoverErr);
  throw new UGRestClientError({
    message: "Error getting open-id grants",
    type: "UGRestClientCredentialsError",
    err,
  });
}

function getClientErr(err: any) {
  if (err instanceof UGRestClientError) {
    throw err;
  }

  Error.captureStackTrace(err, getClientErr);
  throw new UGRestClientError({
    message: "Error creating open-id client",
    type: "UGRestClientError",
    err,
  });
}

function getAccessTokenErr(err: any) {
  Error.captureStackTrace(err, getAccessTokenErr);
  throw new UGRestClientError({
    message: "Error fetching open-id access token",
    type: "UGRestClientTokenError",
    err,
  });
}

function requestResourceErr(err: any, details: object) {
  Error.captureStackTrace(err, requestResourceErr);
  throw new UGRestClientError({
    message: "Error calling UG REST endpoint",
    type: "UGRestClientRequestError",
    details,
    err,
  });
}
