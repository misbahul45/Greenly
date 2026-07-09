# Greenly API — Dokumentasi & Index untuk AI Agent

## Arsitektur

Base URL produksi: `https://greenly-api.duckdns.org/api`

### Daftar Service

| Service | Framework | Database | Prefix Produksi | Strip Prefix | Port Internal |
|---------|-----------|----------|----------------|--------------|---------------|
| core-service | NestJS (Express) | MySQL, Redis, RabbitMQ | `/api/core` | `/api/core` | 3000 |
| catalog-service | Go / Gin | MongoDB, RabbitMQ | `/api/catalog` | `/api/catalog` | 8081 |
| ml-engine | FastAPI + Celery | Redis, RabbitMQ | `/api/ml` | `/api/ml` | 8000 |

### Routing Traefik

Traefik menggunakan konfigurasi via Docker labels (`traefik.http.routers.*`):
- Semua router menggunakan `PathPrefix` matching rule.
- Semua router memiliki middleware `stripprefix` untuk menghapus prefix sebelum diteruskan ke service.
- Entrypoint: `web` (port 80).

### Response Interceptor (core-service)

Semua response dari core-service dibungkus oleh `ResponseInterceptor` (`src/libs/interceptors/respon.interceptor.ts`):

```json
{
  "status": "success",
  "statusCode": 200,
  "path": "/path/asli",
  "message": "success",
  "data": { ... },
  "metaData": { ... },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Global Exception Filter (core-service)

Semua error dari core-service dibungkus oleh `GlobalExceptionFilter` (`src/libs/filters/global-exception.filter.ts`):

```json
{
  "status": false,
  "statusCode": 400,
  "path": "/path/asli",
  "message": "Error message",
  "errors": null,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Catalog Service Error Response

Catalog service menggunakan middleware `ErrorHandler()` (`middleware/error_middleware.go`):

```json
{
  "status": false,
  "statusCode": 400,
  "path": "/path/asli",
  "message": "Error message",
  "errors": null,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Autentikasi

### core-service
- **Global guard**: `JwtAccessGuard` (Passport JWT strategy `jwt-access`) + `RolesGuard` diterapkan di `AppModule` level.
- Endpoint yang **tidak** membutuhkan auth diberi decorator `@Public()`.
- Endpoint dengan pembatasan role menggunakan decorator `@Roles('ADMIN', 'SUPER_ADMIN')` atau `@RequireFinanceAccess(...)`.
- Token dikirim via header `Authorization: Bearer <accessToken>`.
- Refresh token dikirim via header `Authorization: Bearer <refreshToken>` dan guard `JwtRefreshGuard`.

### catalog-service
- Beberapa endpoint publik (tanpa auth).
- Endpoint protected menggunakan `AuthMiddleware()` atau `JWTAuthMiddleware()` — membaca `Authorization: Bearer <token>`.
- Role check via `RequireRole()`, `RequireShopRole()`, `SellerOnly()`, `AdminOnly()`.
- Shop membership diverifikasi via HTTP call ke core-service.

### ml-engine
- Belum ada implementasi autentikasi.

## Peta Dokumentasi API

| File | Domain | Service |
|------|--------|---------|
| `docs/api/auth.md` | Autentikasi (register, login, logout, refresh token, email verification, password reset) | core-service |
| `docs/api/me.md` | Profile pengguna saat ini | core-service |
| `docs/api/shops.md` | Manajemen toko (CRUD) | core-service |
| `docs/api/users.md` | Manajemen pengguna (admin) | core-service |
| `docs/api/roles.md` | Manajemen roles & permissions | core-service |
| `docs/api/cart.md` | Keranjang belanja | core-service |
| `docs/api/checkout.md` | Checkout | core-service |
| `docs/api/orders.md` | Pesanan | core-service |
| `docs/api/promotions.md` | Promosi & voucher | core-service |
| `docs/api/finance/overview.md` | Overview keuangan (admin) | core-service |
| `docs/api/finance/payments.md` | Manajemen pembayaran (admin) | core-service |
| `docs/api/finance/ledgers.md` | Ledger toko | core-service |
| `docs/api/finance/payouts.md` | Pencairan dana | core-service |
| `docs/api/finance/refunds.md` | Refund | core-service |
| `docs/api/shops-application.md` | Aplikasi/verifikasi toko | core-service |
| `docs/api/shops-members.md` | Manajemen member toko | core-service |
| `docs/api/shops-followers.md` | Follow/unfollow toko | core-service |
| `docs/api/shops-dashboard.md` | Dashboard & revenue toko | core-service |
| `docs/api/shops-finance.md` | Finance internal toko (balance, ledger, payout) | core-service |
| `docs/api/shops-orders.md` | Order internal toko | core-service |
| `docs/api/catalog/categories.md` | Kategori produk | catalog-service |
| `docs/api/catalog/products.md` | Produk | catalog-service |
| `docs/api/catalog/prices.md` | Harga produk | catalog-service |
| `docs/api/catalog/inventory.md` | Stok/inventory | catalog-service |
| `docs/api/catalog/active-prices.md` | Harga aktif (setelah diskon) | catalog-service |
| `docs/api/catalog/discounts.md` | Diskon produk | catalog-service |
| `docs/events.md` | Event-driven architecture (RabbitMQ, publisher, consumer, payload) | All |

## Catatan / Ambiguitas

1. **ml-engine** — Hanya berisi 1 route `GET /` root. Seluruh direktori `app/api/`, `app/core/`, `app/clients/`, `app/workers/` tidak berisi file `.py` (hanya `__pycache__`). Module ini masih dalam tahap scaffolding.
2. **core-service modules kosong**: `AdminModule`, `AnalyticsModule`, `EventsModule`, `NotificationModule` tidak memiliki controller/route — hanya deklarasi module kosong.
3. **catalog-service modules kosong**: `product_image` dan `eco_attribute` berisi file stubs tanpa implementasi — tidak didaftarkan di `routes.go`.
4. **User controller** memiliki rute `DELETE /delete` (untuk user hapus diri sendiri) dan `DELETE /delete/verify` (verifikasi delete) — tidak ada path parameter, menggunakan token dari body. Ini tidak standar REST.
5. **Catalog-service** menggunakan dua middleware auth berbeda: `AuthMiddleware()` (di categories) dan `JWTAuthMiddleware()` (di modules lain). Keduanya membaca token yang sama tapi `JWTAuthMiddleware` juga mengekstrak `shopMemberships` dari JWT claims.
6. **Promotion controller** — `PromotionAdminController` dan `PromotionPublicController` ada di file yang sama. Admin controller pathnya `/admin/promotions` dan public controller pathnya `/promotions`.
7. **Finance controller** — `FinanceController` di path `/admin/finance`, sementara `PaymentController` juga di path `/admin/finance`. NestJS menggabungkan keduanya, menghasilkan rute `/admin/finance/overview` dan `/admin/finance/payments`, `/admin/finance/payments/:id/status`.
8. **Event-anomalies** — Lihat `docs/events.md#7-catatan--anomalies` untuk 16 isu event-driven system, termasuk: consumer-publisher mismatch (`payment.success` vs `payment.completed`, `user.deleted` vs `auth.user.deleted`), duplicate publishers (shop.follower.added dari 2 file, payment.completed dari 2 module), catalog payload mismatch (order.created tanpa productId/quantity), dan stale queue bindings.

## Aturan Update

1. Setiap perubahan controller/route/DTO/guard WAJIB diikuti update file dokumentasi terkait.
2. Baca ulang source code (controller, DTO, guard) — jangan edit dari ingatan.
3. Verifikasi routing Traefik jika ada perubahan prefix/path.
4. Ikuti template per endpoint di bawah.
5. Jika ada ambiguitas, catat di bagian "Catatan" file terkait — jangan isi tebakan.
