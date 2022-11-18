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
    try {
      loaderFunc().then((res: T) => {
        setRes(res);
        setLoading(false);
      });
    } catch (e) {
      setError(e as Error);
      setLoading(false);
    }
  }, []);

  return { res, loading, error };
}

export function formatTerm(startTerm: string) {
  const shortYear = startTerm.slice(2, 4);
  const termNr = startTerm.slice(4, 5);
  const termStr = { 1: "VT", 2: "HT" }[termNr];
  return `${termStr && i18n(termStr)}${shortYear}`;
}
