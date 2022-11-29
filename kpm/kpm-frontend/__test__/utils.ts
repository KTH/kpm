import { Readable } from "stream";
import { TextEncoder } from "util";

const unmockedFetch = global.fetch;

let response: any = {
  body: undefined,
  headers: undefined,
  status: undefined,
}

export function mockFetchJson<TApiData>(body: TApiData | string | undefined, status = 200, headers?: Headers): void {
  response = {
    body,
    status,
    headers
  }

  global.fetch = async (input: RequestInfo | URL, init?: RequestInit | undefined): Promise<Response> => {
    const bodyStr = typeof response.body === "object" ? JSON.stringify(response.body) : response.body;
    const readableStream = Readable.from(new TextEncoder().encode(bodyStr));
    // const readableStream = new ReadableStream({
    const res = new Response(
      readableStream as any,
      {
        headers: response.headers,
        status: response.status,
      }
    )
    // Clear the response object so we only consume it once.
    response = {};
    return res;
  }
}

export function resetMockedFetch() {
  global.fetch = unmockedFetch;
}