import { useEffect, useState } from "react";
import { i18n } from "../i18n/i18n";

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
