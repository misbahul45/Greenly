# Greenly Event Contracts

All cross-service events use RabbitMQ topic exchange `greenly_events`.

- Exchange type: `topic`
- Durable: `true`
- Content type: `application/json`
- Routing key format: `domain.action` or `domain.entity.action`

New core-service events use this envelope:

```json
{
  "eventId": "uuid",
  "eventType": "order.created",
  "version": "1.0",
  "source": "core-service",
  "occurredAt": "2026-06-13T00:00:00.000Z",
  "correlationId": "optional",
  "payload": {}
}
```

Consumers should read `payload` when present and fall back to the legacy root payload while older publishers still exist.

## Canonical Events

### `order.created`

Source: `core-service`

```json
{
  "orderId": "order-id",
  "userId": "user-id",
  "shopId": "shop-id",
  "totalAmount": 100000,
  "items": [
    {"productId": "product-id", "quantity": 2}
  ],
  "source": "core-service",
  "version": "1.0",
  "timestamp": "2026-06-13T00:00:00.000Z"
}
```

### `payment.completed`

Source: `core-service`

```json
{
  "paymentId": "payment-id",
  "orderId": "order-id",
  "shopId": "shop-id",
  "userId": "user-id",
  "grossAmount": 100000,
  "gatewayFee": 3000,
  "marketplaceFee": 2000,
  "netAmount": 95000,
  "method": "STRIPE",
  "transactionId": "stripe-session-or-intent-id",
  "paidAt": "2026-06-13T00:00:00.000Z",
  "source": "core-service",
  "version": "1.0"
}
```

### `payment.refunded`

Source: `core-service`

```json
{
  "paymentId": "payment-id",
  "orderId": "order-id",
  "shopId": "shop-id",
  "userId": "user-id",
  "refundId": "refund-id",
  "amount": 100000,
  "reason": "Stripe charge refunded",
  "refundedAt": "2026-06-13T00:00:00.000Z",
  "source": "core-service",
  "version": "1.0"
}
```

### Product and Inventory Events

Source: `catalog-service`

- `product.created`
- `product.updated`
- `product.deleted`
- `inventory.updated`
- `price.updated`
- `discount.applied`
- `product.eco_attribute.updated`

Catalog-service currently emits legacy root payloads. ML consumer supports both root payloads and envelope payloads.

### User Events

Canonical key: `auth.user.deleted`

`user.deleted` is deprecated and should not be used for new publishers.

## Deprecated or Inactive Keys

These keys currently have no active publisher and should not be bound by consumers until a real business flow exists:

- `payment.success`
- `promotion.activated`
- `shop.payout.processed`
- `email.send`

`refund.processed` remains an existing finance/admin event. Stripe refund webhook publishes `payment.refunded`.
