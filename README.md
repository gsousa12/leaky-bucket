````markdown
# Leaky Bucket API — Elysia + Bun + Redis

Pequeno estudo de **rate-limiting** usando o algoritmo *Leaky Bucket* com:

- [Elysia](https://elysiajs.com/) — micro-framework HTTP para Bun
- [Bun](https://bun.sh/) — runtime JS/TS super-rápido (interpreta TS nativamente)
- **Redis** — contador distribuído (chave por API-Key)
- **TypeScript** — tipagem forte, tudo 100% TS
- **TypeBox** — validação de variáveis de ambiente
- **Docker + docker-compose** — um comando sobe API + Redis

---

## 🚀 Como rodar

### 1. Requisitos

- Docker + docker-compose **ou** Bun ≥ 1.1 local
- Node/PNPM não são necessários

### 2. Local (rápido)

```bash
bun install         # instala dependências
bun run src/index.ts
# API em http://localhost:3000
````

Crie um arquivo `.env` com:

```env
PORT=3000
REDIS_URL="redis://localhost:6379"
RATE_LIMIT_CAPACITY=10
RATE_LIMIT_WINDOW_SEC=60
```

### 3. Via Docker (com Redis incluso)

```bash
docker compose up --build -d     # sobe api:3000 + redis:6379
```

---

## ⚙️ Como funciona o **Leaky Bucket**

1. Cada requisição deve enviar `x-api-key: <sua-chave>`.
2. Para cada chave é criada uma entry no Redis:
   `leaky:apiKey:<chave>` com TTL = janela.
3. O contador é incrementado com `INCR`; a primeira chamada define `EXPIRE`.
4. Se o valor passar da capacidade → middleware responde `429` e header `Retry-After`.
5. Falha de Redis? Middleware faz *graceful fallback* (devolve `200` + `X-RateLimit-Bypass`).

---

## 🛠 Scripts úteis

| Comando                | Descrição                      |
| ---------------------- | ------------------------------ |
| `bun run src/index.ts` | roda API em hot-reload         |
| `bun test`             | tests (a implementar)          |
| `docker compose up`    | sobe API + Redis em containers |

---
> Projeto criado apenas para fins de estudo.
