greenly-monorepo/
├── docs/
│   └── messaging/
│       ├── events.md           # Dokumentasi event (AsyncAPI style)
│       ├── queues.md           # Definisi queue & routing key
│       └── schemas/            # JSON Schema / Protobuf untuk payload
│           ├── user-created.json
│           └── order-created.json
│
├── services/
│   ├── core-service/ (NestJS)
│   │   ├── src/
│   │   │   ├── libs/
│   │   │   │   └── messaging/    # Implementasi RabbitMQ khusus NestJS
│   │   │   │       ├── rabbitmq.client.ts
│   │   │   │       ├── rabbitmq.module.ts
│   │   │   │       └── events/   # Handler untuk event yang DIDENGAR service ini
│   │   │   │           ├── user-created.handler.ts
│   │   │   │           └── order-created.handler.ts
│   │   │   ├── modules/
│   │   │   │   ├── user/
│   │   │   │   │   └── user.producer.ts  # Producer untuk event yang DIKIRIM
│   │   │   │   └── order/
│   │   │   └── app.module.ts
│   │
│   ├── catalog-service/ (Go Gin)
│   │   ├── internal/
│   │   │   ├── messaging/        # Implementasi RabbitMQ khusus Go
│   │   │   │   ├── client.go
│   │   │   │   └── events/       # Handler untuk event yang DIDENGAR
│   │   │   └── handlers/         # Producer untuk event yang DIKIRIM
│   │
│   └── ml-engine/ (FastAPI)
│       ├── app/
│       │   ├── core/
│       │   │   └── messaging/    # Implementasi RabbitMQ khusus Python
│       │   │       ├── rabbitmq.py
│       │   │       └── consumers/ # Handler untuk event yang DIDENGAR
│       │   ├── api/
│       │   │   └── endpoints/    # Producer untuk event yang DIKIRIM