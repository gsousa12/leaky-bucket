import { createClient } from "redis";
import { env } from "../config";

export const redis = createClient({ url: env.REDIS_URL });

await redis.connect();
