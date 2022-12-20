import * as React from "react";
import { useNavigate } from "react-router-dom";
import { i18n } from "../i18n/i18n";
import { ApiError } from "../panes/utils";
import "./common.scss";
import { LoginWidget } from "./login";

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

export class AuthError extends Error {
  constructor(props: any) {
    super(props);
  }
}

type TErrorMessageProps = {
  error: ApiError | AuthError;
  compact?: boolean;
};
export function ErrorMessage({
  error,
  compact = false,
}: TErrorMessageProps): JSX.Element {
  const navigate = useNavigate();

  let cls = "kpm-error-message";
  if (compact) {
    cls += " compact";
  }

  const showLogin = error instanceof AuthError;
  const description = (error as ApiError).description;
  return (
    <div className="kpm-error-message">
      <h2>ERROR: {error.message}</h2>
      {description && <p>{description}</p>}
      {showLogin && <p>{i18n("Your session has expired")}</p>}
      {showLogin && (
        <LoginWidget
          onDismiss={() => {
            navigate("/");
          }}
        />
      )}
    </div>
  );
}
