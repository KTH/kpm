import * as React from "react";
import "./common.scss";

export function LoadingPlaceholder(): JSX.Element {
  return <div className="kpm-loading-placeholder"><div className="kpm-loader" /></div>
}

type TErrorMessageProps = {
  error: Error;
}
export function ErrorMessage({ error }: TErrorMessageProps): JSX.Element {
  return <div className="kpm-error-message">
    <h2>There was an error</h2>
    <p>{error.message}</p>
  </div>
}