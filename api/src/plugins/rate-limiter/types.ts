export interface Configuration {
  capacity: number;
  windowSec: number;
}

export interface AttemptResult {
  allowed: boolean;
  remaining: number;
  retryAfterMs: number;
}
