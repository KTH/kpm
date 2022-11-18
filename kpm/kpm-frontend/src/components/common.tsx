import * as React from "react";
import "./common.scss";

export function LoadingPlaceholder(): JSX.Element {
  return (
    <div className="kpm-loading-placeholder">
      <div className="kpm-loader" />
    </div>
  );
}

type TEmptyPlaceholderProps = {
  children: any;
};

export function EmptyPlaceholder({
  children,
}: TEmptyPlaceholderProps): JSX.Element {
  // TODO: Perhaps add an image/icon when only text like they do on Github?
  // TODO: Perhaps add an explanation on what you are expected to do.
  return <div className="kpm-empty-placeholder">{children}</div>;
}

type TErrorMessageProps = {
  error: Error;
};
export function ErrorMessage({ error }: TErrorMessageProps): JSX.Element {
  return (
    <div className="kpm-error-message">
      <h2>There was an error</h2>
      <p>{error.message}</p>
    </div>
  );
}
