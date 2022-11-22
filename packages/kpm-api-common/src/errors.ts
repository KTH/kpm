/**
* Common ancestor of all operational errors allowing
* for more catch all checks.
*
* Use generic T to define the different error types you have. This helps enforcing complete error handling.
*/
type TErrorName = "EndpointError" | "AuthError";

export abstract class OperationalError<T = string> extends Error {
  name: TErrorName;
  statusCode;
  type;
  details;
  err;

  constructor({ name, statusCode, type, message, details, err }: { name: TErrorName, statusCode: number, type: T, message: string, details: string | null, err: Error }) {
    super(message);
    this.name = name;
    this.statusCode = statusCode;
    this.type = type;
    this.details = details;
    this.err = err;
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
export class EndpointError<T> extends OperationalError<T> {
  // Errors that must be handled by frontend
  constructor({ type, statusCode, message, details, err }: Pick<OperationalError<T>, "type" | "statusCode" | "message" | "details" | "err">) {
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
export class AuthError<T> extends OperationalError<T> {
  constructor({ type, message, details, err }: Pick<OperationalError<T>, "type" | "message" | "details" | "err">) {
    super({ name: "AuthError", statusCode: 401, type, message, details, err });
  }
}

/**
* Error for recoverable programmer errors IN OUR CODE. This shouldn't crash the application. 
*/
export class RecoverableError extends Error {
  name = "RecoverableError";
  err: Error;

  constructor({ message = "We encountered an error in our code.", err }: { message: string, err: Error }) {
    super(message);
    this.err = err;
  }
}
