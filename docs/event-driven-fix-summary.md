# Event-Driven Architecture Fix Summary

## Changed Files

- `services/core-service/src/infrastructure/messaging/*`: RabbitMQ topic event bus for `greenly_events`.
- `services/core-service/src/infrastructure/outbox/*`: transactional outbox service and publisher processor.
- `services/core-service/prisma/schema.prisma`: added `OutboxEvent`.
- `services/core-service/prisma/migrations/20260613000100_add_outbox_events/migration.sql`: creates `outbox_events`.
- `services/core-service/src/modules/commerce/checkout/*`: catalog-backed pricing and `order.created` outbox write.
- `services/core-service/src/modules/finance/payment/payment.service.ts`: `payment.completed` and `payment.refunded` outbox writes.
- `services/catalog-service/internal/rabbitmq/*`: `order.created` envelope/root parsing and `items[]` stock reservation.
- `services/ml-engine/app/workers/event_consumer.py`: envelope payload support.
- `docs/event-contracts.md`: canonical event contracts.

## Manual Verification

1. Run migration:
   `cd services/core-service && pnpm prisma migrate deploy && pnpm prisma generate`
2. Start stack:
   `docker compose up --build`
3. RabbitMQ:
   confirm durable topic exchange `greenly_events`.
4. Checkout:
   submit checkout with manipulated client price `1`; order and Stripe amount must use catalog price.
5. Outbox:
   create checkout while RabbitMQ is down; `outbox_events` should remain `PENDING` or `FAILED`, then become `PUBLISHED` after RabbitMQ returns.
6. Catalog consumer:
   publish `order.created` with `items[]`; stock reservation should run per item.
7. Payment:
   simulate Stripe success; `payment.completed` should be stored in outbox and order/payment remain `PAID`/`SUCCESS`.
8. Refund:
   simulate `charge.refunded`; `payment.refunded` should be stored in outbox.

## Remaining Limitations

- Catalog stock reservation idempotency is documented as a TODO; it still needs a persisted `processed_events` collection for full at-least-once safety.
- Some legacy internal Nest consumers still use Nest RMQ transport for local patterns. Cross-service publishing now goes through `greenly_events`.
