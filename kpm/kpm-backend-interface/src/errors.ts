/**
 * General Error Types
 */

export type TGotErrType = "NotAvailable" | "BadResponse" | "TimeoutError";

export type TCorsError = "InvalidOrigin";

export type APIAuthErrType = "ClientResponseError" | "TypeError";

export type APIMutedAuthErrType =
  | "LoginRequired"
  | "SessionExpired"
  | "SessionStoreError"
  | "AuthServiceMiscError"
  | "NoSessionUser";

/**
 * API Error Payload Type
 */
export type TApiError = {
  statusCode: number;
  name?: string;
  type?: string;
  message: string;
  details?: string;
};
