import { Type, Static } from "@sinclair/typebox";
import { Value } from "@sinclair/typebox/value";

const EnvSchema = Type.Object({
  PORT: Type.String({ default: "3000" }),
  REDIS_URL: Type.String({ default: "redis://localhost:6379" }),
  RATE_LIMIT_CAPACITY: Type.Number({ default: 10 }),
  RATE_LIMIT_WINDOW_SEC: Type.Number({ default: 60 }),
});

export type Env = Static<typeof EnvSchema>;
export const env: Env = Value.Cast(EnvSchema, process.env);
