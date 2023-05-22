import { useEffect, useState } from "react";
import { AuthError } from "../components/common";
import { i18n } from "../i18n/i18n";
import { authState } from "../state/authState";

declare global {
  interface Window {
    // NOTE: This global variable is set in widget.js.ts
    __kpmPublicUriBase__?: string;
  }
}

export function createApiUri(path: string) {
  if (typeof window.__kpmPublicUriBase__ === "string") {
    return `${window.__kpmPublicUriBase__}${path}`;
  } else {
    return `/kpm${path}`;
  }
}

export function useDataFecther<T>(loaderFunc: () => Promise<T>): {
  res: T | undefined;
  loading: boolean;
  error: Error | undefined;
} {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error>();
  const [res, setRes] = useState<T>();
  useEffect(() => {
    loaderFunc()
      .then((res: T) => {
        setRes(res);
        setLoading(false);
      })
      .catch((e) => {
        setError(beautifyError(e as Error));
        setLoading(false);
      });
  }, []);

  return { res, loading, error };
}

type TApiErrorOpts = {
  description?: string;
};
export class ApiError extends Error {
  description?: string;
  constructor(title: string, { description }: TApiErrorOpts = {}) {
    super(title);
    this.description = description;
  }
}

function beautifyError(e: Error): Error {
  if (e instanceof AuthError) return e;

  switch (e.name) {
    case "SyntaxError":
      return new ApiError("Backend is speaking gibberish!", {
        description: "The backend responded with HTML, but JSON was expected.",
      });
    default:
      return new ApiError("An error occured when talking to server", {
        description: e.message,
      });
  }
}

export function formatTerm(startTerm: string) {
  const shortYear = startTerm.slice(2, 4);
  const termNr = startTerm.slice(4, 5);
  const termStr = { 1: "VT", 2: "HT" }[termNr];
  return `${termStr && i18n(termStr)}${shortYear}`;
}

export async function postApi<T = any>(
  path: string,
  json: T,
  options: RequestInit = {}
): Promise<Response> {
  const { headers, ...otherOptions } = options;
  return await fetchApi(path, {
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    method: "post",
    body: JSON.stringify(json),
    ...otherOptions,
  });
}

export async function fetchApi(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const { headers, ...otherOptions } = options;
  const fetchOptions: RequestInit = {
    credentials: "include",
    headers: {
      Accept: "application/json",
      "Accept-Language": window.__kpmSettings__?.["lang"] || "en",
      ...headers,
    },
    ...otherOptions,
  };
  const res = await fetch(createApiUri(path), fetchOptions);

  if (res.status === 401 /* Unauthorized */) {
    // Trigger login dialog by event or callback
    authState.send({
      name: "CurrentUser",
      value: undefined,
    });
  }

  return res;
}
