const unmockedFetch = global.fetch;

// I wrote this because all the examples I found where complicated
// and required one or several external packages.
// Perhaps we could to this using jest.spyOn, but I still think
// we need to mock fetch so here goes.

let response: any = {
  body: undefined,
  headers: undefined,
  status: undefined,
}

// TODO: Extend this if needed
class Response {
  status: number = 500;
  ok: boolean = false;
  body: any;
  headers?: Headers;

  constructor(body: any, status: number, headers?: Headers) {
    this.body = body;
    this.status = status;
    this.headers = headers;
    if (status < 300) {
      this.ok = true;
    }
  }
  async json() {
    return this.body
  }

  get statusText() {
    if (this.status < 200) {
      return "Continue";
    } else if (this.status < 300) {
      return "Ok";
    } else if (this.status < 400) {
      return "Cached";
    } else if (this.status < 500) {
      return "NotFound";
    } else {
      return "Error";
    }
  }
}

export function mockFetchJson<TApiData>(body: TApiData | undefined, status = 200, headers?: Headers): void {
  response = {
    body,
    status,
    headers
  }

  const fetch = async (input: RequestInfo | URL, init?: RequestInit | undefined): Promise<globalThis.Response> => {
    const res = new Response(
      response.body,
      response.status,
      response.headers,
    )
    return res as globalThis.Response;
  }

  global.fetch = fetch;
}

export function resetMockedFetch() {
  global.fetch = unmockedFetch;
}