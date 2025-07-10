import { Elysia, type Context } from "elysia";
import { Configuration } from "../plugins/rate-limiter/types";
import { getApiKey } from "../plugins/api-key/api-key";
import { createLeakyBucket } from "../plugins/rate-limiter/leakyBucket";

type AttemptFn = (key: string) => Promise<{
  allowed: boolean;
  remaining: number;
  retryAfterMs: number;
}>;

const bucketCache = new Map<string, AttemptFn>();

const getAttemptFn = (configuration: Configuration): AttemptFn => {
  const key = `${configuration.capacity}:${configuration.windowSec}`;
  let fn = bucketCache.get(key);
  if (!fn) {
    fn = createLeakyBucket(configuration);
    bucketCache.set(key, fn);
  }
  return fn;
};

export const createRateLimit =
  (
    configuration: Configuration,
    extractKey: (ctx: Context) => string | null = (c) => getApiKey(c.request)
  ) =>
  (app: Elysia) => {
    const attempt = getAttemptFn(configuration);

    app.onBeforeHandle(async (ctx) => {
      const apiKey = extractKey(ctx);
      if (!apiKey) {
        ctx.set.status = 401;
        return { error: "Missing x-api-key header" };
      }

      const redisKey = `apiKey:${apiKey}`;
      const { allowed, retryAfterMs, remaining } = await attempt(redisKey);

      if (!allowed) {
        ctx.set.status = 429;
        ctx.set.headers["Retry-After"] = Math.ceil(
          retryAfterMs / 1000
        ).toString();
        return { error: "Rate limit exceeded, try later" };
      }

      ctx.set.headers["X-RateLimit-Remaining"] = remaining.toString();
    });

    return app;
  };
