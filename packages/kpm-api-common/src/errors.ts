import { v4 as uuid } from "uuid";
/**
 * Common ancestor of all operational errors allowing
 * for more catch all checks.
 *
 * Use generic T to define the different error types you have. This helps enforcing complete error handling.
 */
type TErrorName = "EndpointError" | "AuthError" | "CorsError";
type TOperationalError<ErrType> = {
  name: TErrorName;
  statusCode: number;
  type: ErrType;
  message: string;
  details: any | undefined;
  err?: Error;
};
export abstract class OperationalError<ErrType> extends Error {
  name; // Set by subclass
  statusCode;
  type;
  details;
  err;
  errId: string;

  constructor({
    name,
    statusCode,
    type,
    message,
    details,
    err,
  }: TOperationalError<ErrType>) {
    super(message);
    this.name = name;
    this.statusCode = statusCode;
    this.type = type;
    this.details = details;
    this.err = err;
    this.errId = uuid();
  }
}

// Log MutedOperationalError as a warning to avoid alerts
export abstract class MutedOperationalError<
  ErrType
> extends OperationalError<ErrType> {
  constructor({
    name,
    statusCode,
    type,
    message,
    details,
    err,
  }: TOperationalError<ErrType>) {
    super({
      name,
      statusCode,
      type,
      message,
      details,
      err,
    });
  }
}

/**
 * Use for asserts to check values passed to endpoint handlers.
 */
export class InputGuardError extends OperationalError<"InputGuardError"> {
  // Errors that must be handled by frontend
  constructor(message: string, details?: any) {
    super({
      name: "EndpointError",
      statusCode: 400,
      type: "InputGuardError",
      message,
      details,
    });
  }
}

/**
 * All errors of type EndpointError must be handled by the API-consumer.
 * These include data validation and failing calls to external APIs.
 * a 3rd party API.
 *
 * Use generic T to define the different error types you have. This helps enforcing complete
 * error handling. The T type should be defined in kpm-backend-interface to allow it to be
 * imported in both backend and frontend.
 */
type TEndpointError<ErrType> = {
  type: ErrType;
  statusCode: number;
  message: string;
  details: any | undefined;
  err: Error;
};
export class EndpointError<ErrType> extends OperationalError<ErrType> {
  // Errors that must be handled by frontend
  constructor({
    type,
    statusCode,
    message,
    details,
    err,
  }: TEndpointError<ErrType>) {
    super({ name: "EndpointError", statusCode, type, message, details, err });
  }
}

/**
 * AuthError should be handled by the API-consumer. Used for local authentication issues.
 * If you get an auth error calling an external API you should return an EndpointError.
 *
 * Use generic T to define the different error types you have. This helps enforcing complete error handling.
 * The T type should be defined in kpm-backend-interface to allow it to be imported in both backend and frontend.
 */
type TAuthError<ErrType> = {
  type: ErrType;
  message: string;
  details?: any | undefined;
  err?: Error | undefined;
};
export class AuthError<ErrType> extends OperationalError<ErrType> {
  constructor({ type, message, details, err }: TAuthError<ErrType>) {
    super({ name: "AuthError", statusCode: 401, type, message, details, err });
  }
}

type TMutedAuthError<ErrType> = {
  type: ErrType;
  message: string;
  details?: any | undefined;
  err?: Error | undefined;
};
export class MutedAuthError<ErrType> extends MutedOperationalError<ErrType> {
  constructor({ type, message, details, err }: TMutedAuthError<ErrType>) {
    super({ name: "AuthError", statusCode: 401, type, message, details, err });
  }
}

/**
 * Error for recoverable programmer errors IN OUR CODE. This shouldn't crash the application.
 */
type TRecoverableError<ErrType> = {
  type: ErrType;
  message: string;
  err: Error;
};
export class RecoverableError<ErrType> extends Error {
  name = "RecoverableError";
  type: ErrType;
  err;
  errId: string;

  constructor({
    message = "We encountered an error in our code.",
    type,
    err,
  }: TRecoverableError<ErrType>) {
    super(message);
    this.type = type;
    this.err = err;
    this.errId = uuid();
  }
}
