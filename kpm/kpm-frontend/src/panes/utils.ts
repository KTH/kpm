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
