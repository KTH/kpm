import React from "react";
import { AuthError } from "../components/common";

// This type definition filters out impossible states
type FetchData<T> =
  | { state: "loading"; loading: true; res: undefined; error: undefined }
  | { state: "success"; loading: false; res: T; error: undefined }
  | { state: "error"; loading: false; res: undefined; error: Error };

export class ApiError extends Error {
  description?: string;

  constructor(title: string, { description }: { description?: string } = {}) {
    super(title);

    this.description = description;
  }
}

/** Perform a fetch */
export function useDataFecther<T>(loader: () => Promise<T>): FetchData<T> {
  const [state, setState] = React.useState<FetchData<T>["state"]>("loading");
  const [error, setError] = React.useState<Error>(new Error());
  const [res, setRes] = React.useState<T>();

  React.useEffect(() => {
    loader()
      .then((res) => {
        setRes(res);
        setState("success");
      })
      .catch((e) => {
        setError(beautifyError(e));
        setState("error");
      });
  }, []);

  if (state === "loading") {
    return {
      state: "loading",
      loading: true,
      res: undefined,
      error: undefined,
    };
  }

  if (state === "success" && res) {
    return {
      state: "success",
      loading: false,
      res,
      error: undefined,
    };
  }

  return {
    state: "error",
    loading: false,
    res: undefined,
    error,
  };
}

function beautifyError(e: unknown): Error {
  if (e instanceof AuthError) return e;

  if (!(e instanceof Error)) {
    return new Error("The function threw an object that is not an error");
  }

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
