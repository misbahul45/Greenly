# 📚 API Documentation Report
**Project:** catalog-service (Golang - Gin Framework)
**Generated Date:** 29 June 2026
**Base URL:** `http://localhost:8081`

## 📑 Table of Contents
- [1. Health](#1-health)
- [2. Categories](#2-categories)
- [3. Products](#3-products)
- [4. Prices](#4-prices)
- [5. Inventory](#5-inventory)
- [6. Discounts](#6-discounts)
- [7. Eco Attributes](#7-eco-attributes)
- [8. Product Images](#8-product-images)
- [9. Active Prices](#9-active-prices)
- [10. Favorites](#10-favorites)
- [11. Reviews](#11-reviews)
- [12. Ratings](#12-ratings)

---

## 1. Health
**Base Path:** `/health`
**Deskripsi:** Health check endpoint untuk memonitor status service

### 1.1 Health Check
- **Endpoint:** `GET /health`
- **Deskripsi:** Mengecek status kesehatan service
- **Authentication:** No
- **Request:** -
- **Response:**
  - `200 OK`: `{ status: "ok", service: "catalog-service" }`

---

## 2. Categories
**Base Path:** `/categories`
**Deskripsi:** Manajemen kategori produk

### 2.1 List Categories
- **Endpoint:** `GET /categories`
- **Deskripsi:** Mendapatkan daftar kategori
- **Authentication:** No
- **Request:** -
- **Response:**
  - `200 OK`: Array kategori

### 2.2 Category Tree
- **Endpoint:** `GET /categories/tree`
- **Deskripsi:** Mendapatkan struktur kategori dalam bentuk tree (parent-child)
- **Authentication:** No
- **Request:** -
- **Response:**
  - `200 OK`: Tree kategori

### 2.3 Get Category by ID
- **Endpoint:** `GET /categories/:id`
- **Deskripsi:** Mendapatkan detail kategori berdasarkan ID
- **Authentication:** No
- **Request:**
  - **Params:** `id` (string)
- **Response:**
  - `200 OK`: Detail kategori

### 2.4 Create Category
- **Endpoint:** `POST /categories`
- **Deskripsi:** Membuat kategori baru
- **Authentication:** Yes (JWT + Role: admin)
- **Request:**
  - **Body:** `CreateCategoryDTO` (name, parentId optional, etc.)
- **Response:**
  - `201 Created`: Kategori baru

### 2.5 Update Category
- **Endpoint:** `PUT /categories/:id`
- **Deskripsi:** Memperbarui kategori
- **Authentication:** Yes (JWT + Role: admin)
- **Request:**
  - **Params:** `id`
  - **Body:** `UpdateCategoryDTO`
- **Response:**
  - `200 OK`: Kategori diperbarui

### 2.6 Delete Category
- **Endpoint:** `DELETE /categories/:id`
- **Deskripsi:** Menghapus kategori
- **Authentication:** Yes (JWT + Role: admin)
- **Request:**
  - **Params:** `id`
- **Response:**
  - `200 OK`: Kategori dihapus

---

## 3. Products
**Base Path:** `/products`
**Deskripsi:** Manajemen produk (CRUD, search, toggle)

### 3.1 List Products
- **Endpoint:** `GET /products`
- **Deskripsi:** Mendapatkan daftar produk (dengan filter, pagination)
- **Authentication:** No
- **Request:**
  - **Query:** `page`, `limit`, `shopId`, `categoryId`, `isActive`, `search`, `minPrice`, `maxPrice`, `sortBy`, `sortOrder`, dll.
- **Response:**
  - `200 OK`: Array produk + pagination meta

### 3.2 Search Products
- **Endpoint:** `GET /products/search`
- **Deskripsi:** Pencarian produk berdasarkan kata kunci
- **Authentication:** No
- **Request:**
  - **Query:** `q` (keyword), `page`, `limit`
- **Response:**
  - `200 OK`: Hasil pencarian

### 3.3 Get Product by Slug
- **Endpoint:** `GET /products/slug/:slug`
- **Deskripsi:** Mendapatkan detail produk berdasarkan slug
- **Authentication:** No
- **Request:**
  - **Params:** `slug` (string)
- **Response:**
  - `200 OK`: Detail produk

### 3.4 Get Product by ID
- **Endpoint:** `GET /products/:id`
- **Deskripsi:** Mendapatkan detail produk berdasarkan ID
- **Authentication:** No
- **Request:**
  - **Params:** `id`
- **Response:**
  - `200 OK`: Detail produk

### 3.5 Create Product
- **Endpoint:** `POST /products`
- **Deskripsi:** Membuat produk baru
- **Authentication:** Yes (JWT + Role: seller/admin)
- **Request:**
  - **Body:** `CreateProductDTO` (name, description, categoryId, shopId, SKU, images, attributes, dll.)
- **Response:**
  - `201 Created`: Produk baru

### 3.6 Update Product
- **Endpoint:** `PUT /products/:id`
- **Deskripsi:** Memperbarui produk
- **Authentication:** Yes (JWT + Role: seller/admin)
- **Request:**
  - **Params:** `id`
  - **Body:** `UpdateProductDTO`
- **Response:**
  - `200 OK`: Produk diperbarui

### 3.7 Toggle Product
- **Endpoint:** `PATCH /products/:id/toggle`
- **Deskripsi:** Mengaktifkan/menonaktifkan produk (isActive toggle)
- **Authentication:** Yes (JWT + Role: seller/admin)
- **Request:**
  - **Params:** `id`
- **Response:**
  - `200 OK`: Status produk diubah

### 3.8 Bulk Update Products
- **Endpoint:** `PATCH /products/bulk`
- **Deskripsi:** Memperbarui banyak produk sekaligus
- **Authentication:** Yes (JWT + Role: seller/admin)
- **Request:**
  - **Body:** `BulkUpdateDTO` (array of product IDs + field to update)
- **Response:**
  - `207 Multi-Status`: Hasil operasi (partial success)

### 3.9 Delete Product
- **Endpoint:** `DELETE /products/:id`
- **Deskripsi:** Menghapus produk (soft delete)
- **Authentication:** Yes (JWT + Role: seller/admin)
- **Request:**
  - **Params:** `id`
- **Response:**
  - `200 OK`: Produk dihapus

---

## 4. Prices
**Base Path:** `/prices`
**Deskripsi:** Manajemen harga produk

### 4.1 Get Price by Product ID
- **Endpoint:** `GET /prices/:productId`
- **Deskripsi:** Mendapatkan harga berdasarkan ID produk
- **Authentication:** No
- **Request:**
  - **Params:** `productId`
- **Response:**
  - `200 OK`: Data harga

### 4.2 Create Price
- **Endpoint:** `POST /prices`
- **Deskripsi:** Membuat harga baru untuk produk
- **Authentication:** Yes (JWT + Role: seller/admin)
- **Request:**
  - **Body:** `CreatePriceDTO` (productId, amount, currency)
- **Response:**
  - `201 Created`: Harga dibuat

### 4.3 Update Price
- **Endpoint:** `PUT /prices/:productId`
- **Deskripsi:** Memperbarui harga produk
- **Authentication:** Yes (JWT + Role: seller/admin)
- **Request:**
  - **Params:** `productId`
  - **Body:** `UpdatePriceDTO` (amount, currency)
- **Response:**
  - `200 OK`: Harga diperbarui

---

## 5. Inventory
**Base Path:** `/inventory`
**Deskripsi:** Manajemen stok/inventory produk

### 5.1 Get Inventory by Product ID
- **Endpoint:** `GET /inventory/:productId`
- **Deskripsi:** Mendapatkan stok produk
- **Authentication:** No
- **Request:**
  - **Params:** `productId`
- **Response:**
  - `200 OK`: Data stok

### 5.2 Create Inventory
- **Endpoint:** `POST /inventory`
- **Deskripsi:** Membuat data stok baru untuk produk
- **Authentication:** Yes (JWT + Role: seller/admin)
- **Request:**
  - **Body:** `CreateInventoryDTO` (productId, stock, lowStockThreshold)
- **Response:**
  - `201 Created`: Stok dibuat

### 5.3 Update Inventory
- **Endpoint:** `PUT /inventory/:productId`
- **Deskripsi:** Memperbarui stok produk
- **Authentication:** Yes (JWT + Role: seller/admin)
- **Request:**
  - **Params:** `productId`
  - **Body:** `UpdateInventoryDTO` (stock, lowStockThreshold)
- **Response:**
  - `200 OK`: Stok diperbarui

### 5.4 Reserve Stock
- **Endpoint:** `POST /inventory/:productId/reserve`
- **Deskripsi:** Mereservasi stok (saat checkout/pembuatan order)
- **Authentication:** Yes (JWT)
- **Request:**
  - **Params:** `productId`
  - **Body:** `{ quantity: number }`
- **Response:**
  - `200 OK`: Stok direservasi

### 5.5 Release Stock
- **Endpoint:** `POST /inventory/:productId/release`
- **Deskripsi:** Melepas reservasi stok (saat order dibatalkan)
- **Authentication:** Yes (JWT)
- **Request:**
  - **Params:** `productId`
  - **Body:** `{ quantity: number }`
- **Response:**
  - `200 OK`: Reservasi stok dilepas

---

## 6. Discounts
**Base Path:** `/discounts`
**Deskripsi:** Manajemen diskon produk

### 6.1 Get Discount by Product ID
- **Endpoint:** `GET /discounts/:productId`
- **Deskripsi:** Mendapatkan diskon produk
- **Authentication:** No
- **Request:**
  - **Params:** `productId`
- **Response:**
  - `200 OK`: Data diskon

### 6.2 Create Discount
- **Endpoint:** `POST /discounts`
- **Deskripsi:** Membuat diskon baru untuk produk
- **Authentication:** Yes (JWT + Role: seller/admin)
- **Request:**
  - **Body:** `CreateDiscountDTO` (productId, percentage, fixedAmount, startDate, endDate)
- **Response:**
  - `201 Created`: Diskon dibuat

### 6.3 Update Discount
- **Endpoint:** `PUT /discounts/:id`
- **Deskripsi:** Memperbarui diskon
- **Authentication:** Yes (JWT + Role: seller/admin)
- **Request:**
  - **Params:** `id`
  - **Body:** `UpdateDiscountDTO`
- **Response:**
  - `200 OK`: Diskon diperbarui

### 6.4 Delete Discount
- **Endpoint:** `DELETE /discounts/:id`
- **Deskripsi:** Menghapus diskon
- **Authentication:** Yes (JWT + Role: seller/admin)
- **Request:**
  - **Params:** `id`
- **Response:**
  - `200 OK`: Diskon dihapus

---

## 7. Eco Attributes
**Base Path:** `/eco-attributes`
**Deskripsi:** Manajemen atribut ramah lingkungan (eco-friendly) produk

### 7.1 Get Eco Attributes by Product ID
- **Endpoint:** `GET /eco-attributes/:productId`
- **Deskripsi:** Mendapatkan atribut eco produk
- **Authentication:** No
- **Request:**
  - **Params:** `productId`
- **Response:**
  - `200 OK`: Data eco attribute

### 7.2 Create Eco Attributes
- **Endpoint:** `POST /eco-attributes`
- **Deskripsi:** Membuat atribut eco untuk produk
- **Authentication:** Yes (JWT + Role: seller/admin)
- **Request:**
  - **Body:** `CreateEcoAttributeDTO` (productId, ecoScore, materialType, recyclable, carbonFootprint)
- **Response:**
  - `201 Created`: Eco attribute dibuat

### 7.3 Update Eco Attributes
- **Endpoint:** `PUT /eco-attributes/:productId`
- **Deskripsi:** Memperbarui atribut eco produk
- **Authentication:** Yes (JWT + Role: seller/admin)
- **Request:**
  - **Params:** `productId`
  - **Body:** `UpdateEcoAttributeDTO`
- **Response:**
  - `200 OK`: Eco attribute diperbarui

### 7.4 Delete Eco Attributes
- **Endpoint:** `DELETE /eco-attributes/:productId`
- **Deskripsi:** Menghapus atribut eco produk
- **Authentication:** Yes (JWT + Role: seller/admin)
- **Request:**
  - **Params:** `productId`
- **Response:**
  - `200 OK`: Eco attribute dihapus

---

## 8. Product Images
**Base Path:** `/product-images`
**Deskripsi:** Manajemen gambar produk (upload via ImageKit)

### 8.1 Get Images by Product ID
- **Endpoint:** `GET /product-images/:productId`
- **Deskripsi:** Mendapatkan daftar gambar produk
- **Authentication:** No
- **Request:**
  - **Params:** `productId`
- **Response:**
  - `200 OK`: Array gambar

### 8.2 Upload Image
- **Endpoint:** `POST /product-images`
- **Deskripsi:** Upload gambar baru untuk produk
- **Authentication:** Yes (JWT + Role: seller/admin)
- **Request:**
  - **Body:** Multipart form (file image, productId, altText, isPrimary)
- **Response:**
  - `201 Created`: Gambar terupload

### 8.3 Set Primary Image
- **Endpoint:** `PATCH /product-images/:productId/primary`
- **Deskripsi:** Menetapkan gambar utama (primary) untuk produk
- **Authentication:** Yes (JWT + Role: seller/admin)
- **Request:**
  - **Params:** `productId`
  - **Body:** `{ imageId: string }`
- **Response:**
  - `200 OK`: Gambar utama ditetapkan

### 8.4 Reorder Images
- **Endpoint:** `PATCH /product-images/:productId/reorder`
- **Deskripsi:** Mengubah urutan gambar produk
- **Authentication:** Yes (JWT + Role: seller/admin)
- **Request:**
  - **Params:** `productId`
  - **Body:** `{ imageIds: string[] }`
- **Response:**
  - `200 OK`: Urutan gambar diubah

### 8.5 Delete Image
- **Endpoint:** `DELETE /product-images/:id`
- **Deskripsi:** Menghapus gambar produk
- **Authentication:** Yes (JWT + Role: seller/admin)
- **Request:**
  - **Params:** `id`
- **Response:**
  - `200 OK`: Gambar dihapus

---

## 9. Active Prices
**Base Path:** `/active-prices`
**Deskripsi:** Harga aktif produk hasil kalkulasi (base price - discount)

### 9.1 Get Active Price by Product ID
- **Endpoint:** `GET /active-prices/:productId`
- **Deskripsi:** Mendapatkan harga aktif produk
- **Authentication:** No
- **Request:**
  - **Params:** `productId`
- **Response:**
  - `200 OK`: Data active price

### 9.2 Recalculate Active Price
- **Endpoint:** `POST /active-prices/:productId/recalculate`
- **Deskripsi:** Menghitung ulang harga aktif untuk satu produk
- **Authentication:** No
- **Request:**
  - **Params:** `productId`
- **Response:**
  - `200 OK`: Active price dihitung ulang

### 9.3 Recalculate All Active Prices
- **Endpoint:** `POST /active-prices/recalculate-all`
- **Deskripsi:** Menghitung ulang harga aktif untuk semua produk
- **Authentication:** No
- **Request:** -
- **Response:**
  - `200 OK`: Semua active price dihitung ulang

---

## 10. Favorites
**Base Path:** `/favorites`
**Deskripsi:** Fitur favorite/menyukai produk

### 10.1 Toggle Favorite
- **Endpoint:** `POST /favorites/toggle`
- **Deskripsi:** Menambahkan/menghapus produk dari favorit user
- **Authentication:** Yes (JWT)
- **Request:**
  - **Body:** `{ productId: string }`
- **Response:**
  - `200 OK`: Status favorite diubah

### 10.2 Get User Favorites
- **Endpoint:** `GET /favorites`
- **Deskripsi:** Mendapatkan daftar produk favorit user yang login
- **Authentication:** Yes (JWT)
- **Request:**
  - **Query:** `page`, `limit`
- **Response:**
  - `200 OK`: Array produk favorit + pagination

### 10.3 Get Product Favorites Count
- **Endpoint:** `GET /favorites/product/:productId`
- **Deskripsi:** Mendapatkan jumlah user yang memfavoritkan produk
- **Authentication:** No
- **Request:**
  - **Params:** `productId`
- **Response:**
  - `200 OK`: `{ count: number }`

### 10.4 Check Favorite Status
- **Endpoint:** `GET /favorites/check/:productId`
- **Deskripsi:** Mengecek apakah user sudah memfavoritkan produk
- **Authentication:** Yes (JWT)
- **Request:**
  - **Params:** `productId`
- **Response:**
  - `200 OK`: `{ isFavorited: boolean }`

---

## 11. Reviews
**Base Path:** `/reviews`
**Deskripsi:** Manajemen review dan rating produk

### 11.1 Get Reviews by Product
- **Endpoint:** `GET /reviews/product/:productId`
- **Deskripsi:** Mendapatkan daftar review untuk suatu produk
- **Authentication:** No
- **Request:**
  - **Params:** `productId`
  - **Query:** `page`, `limit`, `sortBy`
- **Response:**
  - `200 OK`: Array review + pagination

### 11.2 Get My Reviews
- **Endpoint:** `GET /reviews/mine`
- **Deskripsi:** Mendapatkan daftar review milik user yang login
- **Authentication:** Yes (JWT)
- **Request:**
  - **Query:** `page`, `limit`
- **Response:**
  - `200 OK`: Array review user

### 11.3 Get Review by ID
- **Endpoint:** `GET /reviews/:id`
- **Deskripsi:** Mendapatkan detail review berdasarkan ID
- **Authentication:** No
- **Request:**
  - **Params:** `id`
- **Response:**
  - `200 OK`: Detail review

### 11.4 Create Review
- **Endpoint:** `POST /reviews`
- **Deskripsi:** Membuat review baru untuk produk
- **Authentication:** Yes (JWT)
- **Request:**
  - **Body:** `CreateReviewDTO` (productId, rating, title, content, images)
- **Response:**
  - `201 Created`: Review dibuat

### 11.5 Update Review
- **Endpoint:** `PUT /reviews/:id`
- **Deskripsi:** Memperbarui review
- **Authentication:** Yes (JWT)
- **Request:**
  - **Params:** `id`
  - **Body:** `UpdateReviewDTO` (rating, title, content)
- **Response:**
  - `200 OK`: Review diperbarui

### 11.6 Delete Review
- **Endpoint:** `DELETE /reviews/:id`
- **Deskripsi:** Menghapus review
- **Authentication:** Yes (JWT)
- **Request:**
  - **Params:** `id`
- **Response:**
  - `200 OK`: Review dihapus

### 11.7 Mark Helpful
- **Endpoint:** `POST /reviews/:id/helpful`
- **Deskripsi:** Menandai review sebagai helpful (membantu)
- **Authentication:** No
- **Request:**
  - **Params:** `id`
- **Response:**
  - `200 OK`: Review ditandai helpful

---

## 12. Ratings
**Base Path:** `/ratings`
**Deskripsi:** Agregasi rating produk

### 12.1 Get Product Rating
- **Endpoint:** `GET /ratings/product/:productId`
- **Deskripsi:** Mendapatkan ringkasan rating untuk suatu produk
- **Authentication:** No
- **Request:**
  - **Params:** `productId`
- **Response:**
  - `200 OK`: Data rating (average, count, distribution)

### 12.2 Batch Get Ratings
- **Endpoint:** `POST /ratings/batch`
- **Deskripsi:** Mendapatkan rating untuk banyak produk sekaligus
- **Authentication:** No
- **Request:**
  - **Body:** `{ productIds: string[] }`
- **Response:**
  - `200 OK`: Array data rating

### 12.3 Top Rated Products
- **Endpoint:** `GET /ratings/top`
- **Deskripsi:** Mendapatkan produk dengan rating tertinggi
- **Authentication:** No
- **Request:**
  - **Query:** `limit` (default: 10), `minReviews`
- **Response:**
  - `200 OK`: Array produk top rated

---

## 📝 Catatan Tambahan

### Teknologi & Framework
- **Bahasa:** Go 1.24.11
- **HTTP Framework:** Gin (`github.com/gin-gonic/gin`)
- **Database:** MongoDB (database: `catalog`)
- **Cache:** Redis (product, price, inventory, active price, user session caching)
- **Message Broker:** RabbitMQ (topic exchange: `greenly_events`)
- **Image Storage:** ImageKit.io
- **Autentikasi:** JWT (HS256) — divalidasi secara lokal + verifikasi user via core-service HTTP call

### Arsitektur
- **Pattern:** Modular Clean Architecture (Handler → Service → Repository)
- Setiap module memiliki `router.go`, `handler.go`, `service.go`, `repository.go`, `dto.go`
- **Event-driven:** Publikasi event RabbitMQ async untuk product, inventory, price, discount, eco attribute
- **Consumer Events:** `order.created` → reserve stock, `order.cancelled` → release stock, `promotion.created/expired` → recalculate prices, `shop.approved` → enable products

### Middleware Stack (Global)
1. **RequestLoggerMiddleware** — logging request dengan request ID
2. **ErrorHandler** — global error handler, menangkap `AppError`
3. **JWTAuthMiddleware** — (per-module, tidak global) parsing & validasi JWT, cache user ke Redis

### Middleware (Per-Route)
- **SellerOnly()** — Role: `seller` atau `admin`
- **AdminOnly() / RequireRole("admin")** — Role: `admin`
- **ShopMemberRequired** — Validasi membership toko via core-service API
- **RequireShopRole("OWNER", "ADMIN")** — Validasi role spesifik dalam toko

### Authentication Flow
1. Client mengirim `Authorization: Bearer <token>`
2. `JWTAuthMiddleware` mem-parsing JWT, validasi signature dengan `JWT_ACCESS_SECRET_KEY`
3. Cek cache Redis untuk user data (TTL: 5 menit)
4. Jika tidak ada di cache, panggil `core-service /auth/me` untuk validasi user
5. Set data user ke Gin context (`user_id`, `user_roles`, `shop_memberships`)
6. Role middleware (`SellerOnly`, `AdminOnly`) membaca dari context

### Response Format (Standard)
```json
{
  "status": "success",
  "statusCode": 200,
  "path": "/products",
  "message": "success",
  "data": {},
  "metaData": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "lastPage": 10
  },
  "timestamp": "2026-06-29T..."
}
```

### Error Response Format
```json
{
  "status": false,
  "statusCode": 401,
  "path": "/products",
  "message": "Unauthorized",
  "errors": null,
  "requestId": "...",
  "timestamp": "2026-06-29T..."
}
```

### DTO / Request Schemas (per module)
- `modules/categories/dto.go` — CreateCategoryReq, UpdateCategoryReq
- `modules/products/dto.go` — CreateProductReq, UpdateProductReq, ProductFilter, BulkUpdateReq
- `modules/price/dto.go` — CreatePriceReq, UpdatePriceReq
- `modules/inventory/dto.go` — CreateInventoryReq, UpdateInventoryReq, ReserveStockReq
- `modules/product_discount/dto.go` — CreateDiscountReq, UpdateDiscountReq
- `modules/eco_attribute/dto.go` — CreateEcoAttrReq, UpdateEcoAttrReq
- `modules/product_image/dto.go` — UploadImageReq, SetPrimaryReq, ReorderReq
- `modules/favorites/dto.go` — ToggleFavoriteReq
- `modules/reviews/dto.go` — CreateReviewReq, UpdateReviewReq
- `modules/product_rating/dto.go` — BatchRatingReq

### Total Endpoints
**54 endpoint API** tersebar di 12 grup/controller.

### Collection Database (MongoDB: `catalog`)
- `categories`, `products`, `prices`, `inventories`, `product_images`, `product_discounts`
- `eco_attributes`, `active_prices`, `favorite_products`, `product_reviews`, `review_replies`
- `product_ratings`, `product_views`, `product_analytics`
- Semua entity menggunakan soft delete (`deleted_at` field)

### Environment Variables
| Variable | Default | Deskripsi |
|----------|---------|-----------|
| `PORT` | `8081` | Port server |
| `MONGODB_URL` | required | URL MongoDB |
| `CORE_SERVICE_URL` | required | Base URL core-service |
| `JWT_ACCESS_SECRET_KEY` | required | Secret key JWT |
| `REDIS_URL` | `localhost:6379` | URL Redis |
| `RABBITMQ_URL` | `amqp://guest:guest@localhost:5672/` | URL RabbitMQ |
| `IMAGEKIT_PUBLIC_KEY` | required | ImageKit public key |
| `IMAGEKIT_PRIVATE_KEY` | required | ImageKit private key |
| `IMAGEKIT_URL_ENDPOINT` | required | ImageKit URL endpoint |
