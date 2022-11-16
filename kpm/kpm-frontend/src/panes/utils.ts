import { useEffect, useState } from "react";

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
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error>();
  const [res, setRes] = useState<T>();
  useEffect(() => {
    setLoading(true);
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
