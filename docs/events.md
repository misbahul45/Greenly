# Event-Driven Architecture — Dokumentasi Lengkap

## Infrastruktur

| Item | Detail |
|------|--------|
| **Exchange** | `greenly_events` (topic, durable, persistent) |
| **Messaging** | JSON via RabbitMQ, semua pesan persistent |
| **core-service** | `MessaggingService` → `ClientRMQ` (`@nestjs/microservices`). `emit(event, payload)` langsung ke exchange. Queue: random (auto-delete) |
| **catalog-service** | `amqp091-go` langsung. Queue: `catalog_service_queue` (durable). QoS: 10 prefetch. Manual ack (`noAck: false`) |
| **ml-engine** | Belum ada event consumer/publisher |

---

## 1. Publishers — core-service

### Auth Module
`services/core-service/src/modules/auth/publisher/`

| Publisher | Event | Payload |
|-----------|-------|---------|
| `user_registered.publisher.ts` | `auth.user.registered` | `{ action, email, name, otp }` |
| `user_forgot_password.publisher.ts` | `auth.user.password.reset.requested` | `{ action, email, name, otp }` |
| `user_resend_token.publisher.ts` | `auth.user.resend.token` | `{ action, email, name, otp }` |
| `user_login.publisher.ts` | **stub** (`publishML() {}`) | — |

### Users Module (Identity)
`services/core-service/src/modules/identity/users/publisher/`

| Publisher | Event | Payload |
|-----------|-------|---------|
| `deleted.user.publisher.ts` | `auth.user.deleted` | `{ action, email, name, otp }` |

### Commerce — Cart
`services/core-service/src/modules/commerce/cart/publishers/`

| Publisher | Event | Payload |
|-----------|-------|---------|
| `cart-updated.publisher.ts` | `cart.updated` | `{ userId, cartId, timestamp }` |
| `cart-cleared.publisher.ts` | `cart.cleared` | `{ userId, cartId, timestamp }` |

### Commerce — Checkout
`services/core-service/src/modules/commerce/checkout/`

| Publisher | Event | Payload |
|-----------|-------|---------|
| `checkout-initiated.publisher.ts` | `checkout.initiated` | `{ userId, orderId, totalAmount, timestamp }` |

### Commerce — Order
`services/core-service/src/modules/commerce/order/publishers/`

| Publisher | Event | Payload |
|-----------|-------|---------|
| `order-created.publisher.ts` | `order.created` | `{ orderId, userId, shopId, totalAmount, timestamp, source, version }` |
| `order-status-changed.publisher.ts` | `order.status.changed` | `{ orderId, previousStatus, newStatus, timestamp, source, version }` |
| `payment.publisher.ts` (PaymentCompleted) | `payment.completed` | `{ paymentId, orderId, grossAmount, netAmount, method, timestamp, source, version }` |
| `payment.publisher.ts` (PaymentFailed) | `payment.failed` | `{ paymentId, orderId, reason, timestamp, source, version }` |
| `refund-processed.publisher.ts` | `refund.processed` | `{ refundId, paymentId, amount, status, timestamp, source, version }` |

### Finance — Payment
`services/core-service/src/modules/finance/payment/publishers/`

| Publisher | Event | Payload |
|-----------|-------|---------|
| `payment-publishers.ts` (PaymentCompleted) | `payment.completed` | `any` + `{ source, version }` |
| `payment-publishers.ts` (PaymentFailed) | `payment.failed` | `any` + `{ source, version }` |

### Finance — Payout
`services/core-service/src/modules/finance/payout/publishers/`

| Publisher | Event | Payload |
|-----------|-------|---------|
| `payout-status-changed.publisher.ts` | `payout.status.changed` | `{ payoutId, shopId, amount, status, approvedBy?, paidAt?, source, version }` |

### Finance — Refund
`services/core-service/src/modules/finance/refund/publishers/`

| Publisher | Event | Payload |
|-----------|-------|---------|
| `refund-processed.publisher.ts` | `refund.processed` | `{ refundId, orderId?, amount, reason, source, version }` |

### Finance — Ledger
`services/core-service/src/modules/finance/ledger/publishers/`

| Publisher | Event | Payload |
|-----------|-------|---------|
| `ledger-created.publisher.ts` | `ledger.created` | `{ shopId, type, amount, reference, description?, timestamp, source, version }` |

### Promotion
`services/core-service/src/modules/promotion/publishers/`

| Publisher | Event | Payload |
|-----------|-------|---------|
| `promotion-created.publisher.ts` | `promotion.created` | `{ promotionId, code, type, discountVal, createdBy, timestamp }` |
| `promotion-expired.publisher.ts` | `promotion.expired` | `{ promotionId, code, endedAt, timestamp }` |
| `promotion-used.publisher.ts` | `promotion.used` | `{ promotionId, code, userId, orderId, discountAmount, timestamp }` |

### Shops
`services/core-service/src/modules/shops/publisher/`

| Publisher | Event | Payload |
|-----------|-------|---------|
| `shop.created.publisher.ts` | `shop.created` | `{ shopId, ownerId, name, status, timestamp, correlationId, source, version }` |
| `shop.application.publisher.ts` (submit) | `shop.application.submitted` | `{ shopId, timestamp, correlationId, source, version }` |
| `shop.application.publisher.ts` (approve) | `shop.approved` | `{ shopId, ownerId, applicationId, timestamp, correlationId, source, version }` |
| `shop.member.publisher.ts` (added) | `shop.member.added` | `{ shopId, userId, role, addedBy, timestamp, source, version }` |
| `shop.member.publisher.ts` (removed) | `shop.member.removed` | `{ shopId, userId, removedBy, timestamp, source, version }` |
| `shop.follower.publisher.ts` (added) | `shop.follower.added` | `{ userId, shopId, timestamp, correlationId, source, version }` |
| `shop.follower.publisher.ts` (removed) | `shop.follower.removed` | `{ userId, shopId, timestamp, source, version }` |
| `shop.follower.added.publisher.ts` | `shop.follower.added` | `{ userId, shopId, timestamp, correlationId?, source, version }` |
| `shop.balance.updated.publisher.ts` | `shop.balance.updated` | `{ shopId, newBalance, changeAmount, changeType, reference, timestamp, correlationId?, source, version }` |
| `shop.finance.publisher.ts` | `shop.payout.requested` | `{ shopId, payoutId, amount, timestamp, correlationId, source, version }` |
| `shop.order.publisher.ts` (status) | `shop.order.status_changed` | `{ orderId, shopId, previousStatus, newStatus, timestamp, correlationId, source, version }` |
| `shop.order.publisher.ts` (refund) | `shop.order.refund_processed` | `{ refundId, orderId, amount, status, timestamp, source, version }` |
| `shop.order.status_changed.publisher.ts` | `shop.order.status_changed` | `{ orderId, shopId, previousStatus, newStatus, timestamp, correlationId?, source, version }` |

### Empty Publisher Stubs
File-file berikut terdaftar sebagai `@Injectable()` tapi **tidak memiliki method publish**:

| File | Module |
|------|--------|
| `shop.application.created.publisher.ts` | Shops |
| `shop.application.updated.publisher.ts` | Shops |
| `shop.Verfied.publisher.ts` | Shops |

---

## 2. Consumers — core-service

### Auth — EmailConsume
`services/core-service/src/modules/auth/consumer/email.consume.ts`

| Event | Method | Action |
|-------|--------|--------|
| `auth.user.registered` | `sendVerificationOtp` | Kirim email verifikasi via EmailJS + Circuit Breaker |
| `auth.user.password.reset.requested` | `sendVerificationForgotPassword` | Kirim OTP reset password |
| `auth.user.resend.token` | `resendToken` | Kirim ulang OTP |
| `auth.user.deleted` | `sendDeletedOtp` | Kirim konfirmasi delete akun |

### Shops — EmailConsume
`services/core-service/src/modules/shops/consumer/email.consume.ts`

| Event | Method | Action |
|-------|--------|--------|
| `email.send` | `handleSendEmail` | Generic email sender (EmailJS + Circuit Breaker) |

### Shops — PaymentEventsConsumer
`services/core-service/src/modules/shops/consumer/payment-events.consumer.ts`

| Event | Method | Action |
|-------|--------|--------|
| `payment.success` | `handlePaymentSuccess` | `updateOrderStatus → PAID` |
| `payment.failed` | `handlePaymentFailed` | `updateOrderStatus → CANCELLED` |

### Shops — PayoutEventsConsumer
`services/core-service/src/modules/shops/consumer/payout-events.consumer.ts`

| Event | Method | Action |
|-------|--------|--------|
| `shop.payout.processed` | `handlePayoutProcessed` | Update status payout; jika FAILED → refund balance via transaction |

### Shops — PromotionEventsConsumer
`services/core-service/src/modules/shops/consumer/promotion-events.consumer.ts`

| Event | Method | Action |
|-------|--------|--------|
| `promotion.activated` | `handlePromotionActivated` | Cache eligible shops di Redis (future) |

### Shops — UserEventsConsumer
`services/core-service/src/modules/shops/consumer/user-events.consumer.ts`

| Event | Method | Action |
|-------|--------|--------|
| `user.deleted` | `handleUserDeleted` | Future: anonimisasi data shop untuk user terhapus |

### Shops — OrderEventsConsumer
`services/core-service/src/modules/shops/consumer/order-events.consumer.ts`

| Event | Method | Action |
|-------|--------|--------|
| `order.cancelled` | `handleOrderCancelled` | Future: inisiasi refund |

---

## 3. Catalog-service Events

### Consumer (queue: `catalog_service_queue`)
`services/catalog-service/internal/rabbitmq/consumer.go`

**Routing keys yang di-bind ke queue:**

```
order.created        → HandleOrderCreated    → ReserveStock(productId, quantity)
order.cancelled      → HandleOrderCancelled  → ReleaseStock(productId, quantity)
promotion.created    → HandlePromotionCreated → Log only
promotion.activated  → HandlePromotionActivated → RecalculateForAllProducts()
promotion.expired    → HandlePromotionExpired   → RecalculateForAllProducts()
shop.approved        → HandleShopApproved    → EnableProductsByShop(shopId)
```

**Routing keys yang di-bind tapi TIDAK punya handler** → akan `Nack(false, false)` (drop):

```
order.status.changed
promotion.updated
shop.created
payment.completed
payment.failed
```

### Publisher (catalog → exchange)
`services/catalog-service/internal/rabbitmq/publisher.go`

| Method | Routing Key | Payload Fields |
|--------|------------|----------------|
| `PublishProductCreated` | `product.created` | `productId, name, shopId, categoryId, description, sku, isActive, timestamp, source, version` |
| `PublishProductUpdated` | `product.updated` | (sama) |
| `PublishProductDeleted` | `product.deleted` | (sama) |
| `PublishInventoryUpdated` | `inventory.updated` | `productId, stock, reservedStock, timestamp, source, version` |
| `PublishPriceUpdated` | `price.updated` | `productId, amount, currency, timestamp, source, version` |
| `PublishDiscountApplied` | `discount.applied` | `productId, discountId, percentage?, fixedAmount?, validFrom, validTo, isActive, timestamp, source, version` |
| `PublishMLProductCreated` | `ml.product.created` | `productId, name, description, categoryId, shopId, sku, features (map), timestamp, source, version` |
| `PublishMLProductUpdated` | `ml.product.updated` | (sama) |
| `PublishMLInventoryUpdated` | `ml.inventory.updated` | `productId, stock, timestamp, source, version` |
| `PublishMLPriceUpdated` | `ml.price.updated` | `productId, price, timestamp, source, version` |
| `PublishMLDiscountApplied` | `ml.discount.applied` | `productId, discount, timestamp, source, version` |

Semua publisher catalog menambahkan `timestamp` (RFC3339 UTC), `source: "catalog-service"`, `version: "1.0"`.

---

## 4. ML Engine

- Hanya `GET /` → `{"message": "Hello World"}`
- Tidak ada event publishing atau consuming
- Direktori `app/api/`, `app/core/`, `app/clients/`, `app/workers/` hanya berisi `__pycache__/` (scaffolding kosong)

---

## 5. Event Flow Diagram (text)

```
core-service                          catalog-service
┌─────────────────────┐               ┌──────────────────────┐
│  Auth Email Pub     │               │  catalog_service_queue│
│  → auth.user.*      │               │  ────────────────    │
│  Commerce Pub       │               │  order.created  → Handler (ReserveStock)
│  → order.*, cart.*  │               │  order.cancelled → Handler (ReleaseStock)
│  → payment.*        │      greenly_events (topic exchange)
│  → checkout.*       │◄──────────────►  shop.approved  → Handler (EnableProducts)
│  Promotion Pub      │               │  promotion.*   → Handlers (Recalculate)
│  → promotion.*      │               │                   
│  Shops Pub          │               │  Publisher:
│  → shop.*           │               │  → product.*, inventory.*
│  Finance Pub        │               │  → price.*, discount.*
│  → ledger.*, payout.*│              │  → ml.* (untuk ML engine)
└─────────────────────┘               └──────────────────────┘
        │                                     │
        │  consumed by                         │  (ml.* events intended for ML engine,
        │  core-service itself                 │   but no consumer exists)
        ▼                                     ▼
  auth/email.consume                    (no internal consumer)
  → auth.user.registered                ml.* events = dead letters
  → auth.user.password.reset.requested
  → auth.user.resend.token
  → auth.user.deleted

  shops/payment-events.consumer
  → payment.success (⚠ berbeda dari published)
  → payment.failed

  shops/payout-events.consumer
  → shop.payout.processed

  shops/promotion-events.consumer
  → promotion.activated

  shops/user-events.consumer
  → user.deleted

  shops/order-events.consumer
  → order.cancelled
```

---

## 6. Payload Types Reference

### PayloadEmail (`common/types/event.ts`)
```typescript
{ action: string, email: string, name: string, otp: string }
```

### Commerce Payloads (`commerce/shared/interfaces/commerce.interface.ts`)
```typescript
CartUpdatedPayload:         { userId, cartId, timestamp }
CartClearedPayload:         { userId, cartId, timestamp }
CheckoutInitiatedPayload:   { userId, orderId, totalAmount, timestamp }
OrderCreatedPayload:        { orderId, userId, shopId, totalAmount, timestamp }
OrderStatusChangedPayload:  { orderId, previousStatus, newStatus, timestamp }
PaymentCompletedPayload:    { paymentId, orderId, grossAmount, netAmount, method, timestamp }
PaymentFailedPayload:       { paymentId, orderId, reason, timestamp }
RefundProcessedPayload:     { refundId, paymentId, amount, status, timestamp }
```

### Finance Payloads (`finance/shared/interfaces/finance-transaction.interface.ts`)
```typescript
FinanceTransactionPayload:      { shopId, type: CREDIT|DEBIT, amount, reference, description?, timestamp }
PayoutStatusChangedPayload:     { payoutId, shopId, amount, status: PENDING|PROCESSING|COMPLETED|FAILED, approvedBy?, paidAt? }
RefundProcessedPayload:         { refundId, orderId?, amount, reason }
```

### Catalog Event Payloads (`catalog-service/internal/rabbitmq/consumer.go`, `publisher.go`)
```go
OrderCreatedEvent:      { orderId, userId, shopId, productId, quantity, totalAmount, timestamp }
OrderCancelledEvent:    { orderId, shopId, productId, quantity, reason, timestamp }
PromotionCreatedEvent:  { promotionId, code, type, discountVal, eligibleProductIds, startDate, endDate, timestamp }
PromotionActivatedEvent:{ promotionId, code, type, discountVal, eligibleProductIds, startDate, endDate, timestamp }
PromotionExpiredEvent:  { promotionId, code, timestamp }
ShopApprovedEvent:      { shopId, shopName, approvedBy, timestamp }
PaymentCompletedEvent:  { paymentId, orderId, amount, method, timestamp }
ProductEventPayload:    { productId, name, shopId, categoryId, description, sku, isActive, timestamp, source, version }
InventoryEventPayload:  { productId, stock, reservedStock, timestamp, source, version }
PriceEventPayload:      { productId, amount, currency, timestamp, source, version }
DiscountEventPayload:   { productId, discountId, percentage?, fixedAmount?, validFrom, validTo, isActive, timestamp, source, version }
MLProductEventPayload:  { productId, name, description, categoryId, shopId, sku, features (map), timestamp, source, version }
MLInventoryEventPayload:{ productId, stock, timestamp, source, version }
MLPriceEventPayload:    { productId, price, timestamp, source, version }
MLDiscountEventPayload: { productId, discount, timestamp, source, version }
```

### Shop Event Payloads (`shops/publisher/*.ts`, `shops/types.ts`)
```typescript
ShopCreatedEvent:           { shopId, ownerId, name, status, timestamp, correlationId }
ShopApprovedEvent:          { shopId, ownerId, applicationId, timestamp, correlationId }
ShopApplicationSubmittedEvent: { shopId, timestamp, correlationId }
ShopMemberAddedEvent:       { shopId, userId, role, addedBy, timestamp }
ShopMemberRemovedEvent:     { shopId, userId, removedBy, timestamp }
ShopFollowerAddedEvent:     { userId, shopId, timestamp, correlationId? }
ShopFollowerRemovedEvent:   { userId, shopId, timestamp }
ShopBalanceUpdatedEvent:    { shopId, newBalance, changeAmount, changeType (CREDIT|DEBIT), reference, timestamp, correlationId? }
ShopPayoutRequestedEvent:   { shopId, payoutId, amount, timestamp, correlationId }
ShopOrderStatusChangedEvent:{ orderId, shopId, previousStatus, newStatus, timestamp, correlationId? }
RefundProcessedEvent:       { refundId, orderId, amount, status, timestamp }
```

---

## 7. Catatan / Anomalies

| # | Issue | Detail |
|---|-------|--------|
| 1 | **Duplicate publisher events** | `shop.follower.added` diterbitkan oleh `shop.follower.publisher.ts` dan `shop.follower.added.publisher.ts` secara independen → risiko duplikasi event |
| 2 | **Duplicate publisher events** | `shop.order.status_changed` diterbitkan oleh `shop.order.publisher.ts` dan `shop.order.status_changed.publisher.ts` |
| 3 | **Duplicate publisher events** | `payment.completed` / `payment.failed` diterbitkan oleh `commerce/order/payment.publisher.ts` DAN `finance/payment/payment-publishers.ts` |
| 4 | **Duplicate publisher events** | `refund.processed` diterbitkan oleh `commerce/order`, `finance/refund`, DAN `shops` → triple! |
| 5 | **Consumer-publisher mismatch** | `payment.success` (underscore) dikonsumsi di `payment-events.consumer.ts`, tapi publisher mengirim `payment.completed` (dot) — **tidak akan match** |
| 6 | **Orphan consumer** | `user.deleted` dikonsumsi oleh `user-events.consumer.ts` tapi publisher mengirim `auth.user.deleted` (prefix `auth.`) — **tidak akan match** |
| 7 | **Orphan consumer** | `shop.payout.processed` dikonsumsi oleh `payout-events.consumer.ts` tapi tidak ada publisher yang mengirim event ini |
| 8 | **Catalog stale bindings** | 5 routing keys di-bind ke `catalog_service_queue` tanpa handler → drop (Nack no-retry) |
| 9 | **ML events tanpa consumer** | `ml.product.*`, `ml.inventory.*`, `ml.price.*`, `ml.discount.*` diterbitkan catalog-service tapi tidak ada consumer (ml-engine masih scaffold) |
| 10 | **Empty stubs** | `UserLoginPublisher.publishML() {}` — tidak mengirim event apa pun |
| 11 | **Empty stubs** | `ShopApplicationCreatedPublisher`, `ShopApplicationVerifiedPublisher`, `ShopUpdatedPublisher` — `@Injectable()` tanpa method |
| 12 | **Typo filename** | `shop.Verfied.publisher.ts` → typo "Verfied" |
| 13 | **Zod validation** | `PromotionActivatedEventSchema` di core-service menggunakan `source: z.literal('promotion-service')`, tapi publisher promotion-created tidak menyertakan `source` → validasi akan gagal |
| 14 | **Zod validation** | `PaymentSuccessEventSchema` menggunakan `source: z.literal('payment-service')`, tapi publisher `payment.completed` dari commerce menggunakan `source: 'core-service'` → validasi akan gagal |
| 15 | **Catalog payload mismatch** | Catalog consumer `order.created` menggunakan `ProductID + Quantity`, tapi core-service publisher `order.created` hanya mengirim `orderId, userId, shopId, totalAmount` — **tidak ada productId atau quantity** → stock tidak akan ter-reserve |
| 16 | **No DLQ** | Tidak ada Dead Letter Queue yang terkonfigurasi. Pesan yang gagal diproses akan di-Nack dan tetap di queue (re-queue: true di catalog) |
