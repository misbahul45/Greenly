# ---- Stage 1: deps + build ----
FROM node:22-alpine AS builder

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.12.4 --activate

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

ARG DATABASE_URL="mysql://user:pass@localhost:3306/db"
ENV DATABASE_URL=$DATABASE_URL

# Paksa V8 pakai heap lebih besar dari default (yang auto-detect dari RAM fisik VPS
# yang kecil), supaya build bisa "meluber" ke swap saat RAM fisik habis.
ENV NODE_OPTIONS="--max-old-space-size=2560"

RUN pnpm run build

RUN pnpm prune --prod

# ---- Stage 2: runtime ----
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000

CMD ["node", "dist/src/main"]