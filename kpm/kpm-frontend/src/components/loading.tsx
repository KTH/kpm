import * as React from "react";

export function LoadingIndicator({ isLoading }: any) {
  let cls = "kpm-loading-indicator";
  if (isLoading) {
    cls += " loading";
  }

  return <div className={cls}></div>;
}
