export type AppErrorCode =
  | "VALIDATION_ERROR"
  | "NOT_FOUND"
  | "CONFLICT"
  | "STORAGE_ERROR"
  | "UNAUTHORIZED";

export class AppError extends Error {
  public readonly code: AppErrorCode;
  public readonly details?: Record<string, unknown>;

  constructor(code: AppErrorCode, message: string, details?: Record<string, unknown>) {
    super(message);
    this.code = code;
    this.details = details;
  }
}