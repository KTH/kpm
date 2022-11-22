export type TAuthErrorType = "bla" | "bli";

export type TApiError = {
  statusCode: number;
  name?: string;
  type?: string;
  message: string;
  details?: string;
}