// src/middlewares/rateLimit.ts
import { Elysia, type Context } from "elysia";
import { Configuration } from "../plugins/rate-limiter/types";
import { getApiKey } from "../plugins/api-key/api-key";
import { createLeakyBucket } from "../plugins/rate-limiter/leakyBucket";

/* ---------- cache global por configuração ---------- */
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

/* ---------- plugin factory ---------- */
export const createRateLimit =
  // Higher-order function -> função que recebe ou devolve função.

    (
      configuration: Configuration,
      extractKey: (ctx: Context) => string | null = (c) => getApiKey(c.request)
    ) =>
    (app: Elysia) => {
      /*
      Elysia trata “plugin” como uma função que recebe a instância atual do app
      e devolve essa mesma instância.
      Queremos configurar o rate-limit antes de aplicá-lo na rota, então usamos
      o padrão:

      createRateLimit(config)  →  devolve plugin
                               ↘
                        plugin(app)  →  adiciona hooks no app
      */
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
