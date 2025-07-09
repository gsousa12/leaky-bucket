import { redis } from "../../lib/redis";
import type { Configuration, AttemptResult } from "./types";

/**
 * Gera uma função `attempt(key)` já configurada.
 * – Não usa this/new.
 * – Mantém capacity/windowSec fechados na closure.
 */
export const createLeakyBucket = (configuration: Configuration) => {
  const { capacity, windowSec } = configuration;

  return async (key: string): Promise<AttemptResult> => {
    const redisKey = `leaky:${key}`;
    const current = await redis.incr(redisKey);

    if (current === 1) {
      await redis.expire(redisKey, windowSec);
    }

    const allowed = current <= capacity;
    const remaining = Math.max(capacity - current, 0);
    const ttlSeconds = await redis.ttl(redisKey);
    const retryAfter = (ttlSeconds > 0 ? ttlSeconds : windowSec) * 1000;

    return { allowed, remaining, retryAfterMs: retryAfter };
  };
};
