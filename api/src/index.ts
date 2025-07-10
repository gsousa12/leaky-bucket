import { Elysia } from "elysia";
import { createRateLimit } from "./middlewares/rate-limit";
import { env } from "./config";

const app = new Elysia();
const port = env.PORT || 3000;
const rateLimitCapacity = env.RATE_LIMIT_CAPACITY || 10;
const rateLimitWindowSec = env.RATE_LIMIT_WINDOW_SEC || 60;

app
  .use(
    createRateLimit({
      capacity: rateLimitCapacity,
      windowSec: rateLimitWindowSec,
    })
  )
  .get("/secure", () => "Rota Limitada");

app.listen(port);
console.log(`🦊  API on ${port}`);
