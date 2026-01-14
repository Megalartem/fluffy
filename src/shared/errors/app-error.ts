export type AppErrorCode =
  | "VALIDATION_ERROR"
  | "NOT_FOUND"
  | "CONFLICT"
  | "STORAGE_ERROR"
  | "UNAUTHORIZED";

export class AppError extends Error {
  public readonly code: AppErrorCode;
  public readonly meta?: Record<string, unknown>;
  public readonly details?: Record<string, unknown>;

  constructor(code: AppErrorCode, message: string, meta?: Record<string, unknown>, details?: Record<string, unknown>) {
    super(message);
    this.code = code;
    this.details = details;
    this.meta = meta;
  }
}