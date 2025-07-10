FROM oven/bun:1.1.8-alpine AS base
WORKDIR /app

FROM base AS install
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

FROM base AS prod_deps
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production

FROM base AS runtime
ENV NODE_ENV=production
WORKDIR /app

COPY --from=prod_deps /app/node_modules ./node_modules

COPY tsconfig.json .
COPY src ./src

EXPOSE 3000/tcp
CMD ["bun", "src/index.ts"]