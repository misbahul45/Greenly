# Repository Instructions

## Project Context

This is a polyglot full-stack monorepo.

Main areas:
- `apps/app`: Flutter mobile app
- `apps/web`: React/TanStack/Vite web dashboard
- `services/core-service`: NestJS + Prisma + MySQL
- `services/catalog-service`: Go/Gin + MongoDB
- `services/ml-engine`: FastAPI + FAISS / ML search
- `infra`: Traefik and infrastructure config
- shared runtime: Docker Compose, Redis, RabbitMQ, MySQL, MongoDB

## How to Work

Before editing:
1. Read the relevant files.
2. Explain the current flow.
3. Identify the bug or improvement.
4. Propose a minimal plan.
5. Avoid changing business logic unless explicitly requested.

## Commands

Use these commands when relevant:

```bash
docker compose up --build
