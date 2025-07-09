########################
# 1. BASE ─ mesma imagem para todos os estágios
########################
FROM oven/bun:1.1.8-alpine AS base
WORKDIR /app

########################
# 2. INSTALL ─ instala dependências em cache
########################
FROM base AS install
# Bun >=1.0 gera bun.lockb; se no seu repo ainda for bun.lock, troque o nome aqui
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
# Até aqui temos node_modules completos (prod + dev)

########################
# 3. PRUNE ─ mantém só deps de produção
########################
FROM base AS prod_deps
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production
# node_modules agora contém só runtime deps

########################
# 4. RUNTIME ─ imagem final entregue
########################
FROM base AS runtime
ENV NODE_ENV=production
WORKDIR /app

# 4.1 Copia deps de produção já prontos
COPY --from=prod_deps /app/node_modules ./node_modules

# 4.2 Copia seu código
COPY tsconfig.json .
COPY src ./src

# 4.3 Expõe porta e comando
EXPOSE 3000/tcp
CMD ["bun", "src/index.ts"]