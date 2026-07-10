# Code Review: Like Product & Search/Filter Product (Flutter → Backend)

**Project:** Greenly  
**Analyzed:** Flutter App (`apps/app`) + Catalog Service (`services/catalog-service`)  
**Date:** 2026-07-10  
**Scope:** End-to-end review of Like/Favorite and Search/Filter flows.

---

## Tahap 1 — Pemetaan Struktur Project

### Struktur Repo
Monorepo dengan 3 layanan utama:
- `apps/app/` — Flutter mobile app (iOS/Android)
- `services/catalog-service/` — Go (Gin + MongoDB), menangani produk, favorit, review, harga, inventori
- `services/core-service/` — Node.js/NestJS (Prisma + PostgreSQL), menangani identitas, order, chat, notifikasi, finance

### Arsitektur Flutter
Feature-first + layer-first hybrid:
```
lib/features/<feature>/
  ├── bloc/              # Flutter BLoC (state management)
  ├── service/           # API client / repository layer
  ├── domain/data/       # Model / DTO
  ├── widgets/           # UI components
  └── <feature>_screen.dart
```
State management: **Flutter BLoC** (`flutter_bloc` + `equatable`).

### Arsitektur Backend (catalog-service)
Modular Go (Handler → Service → Repository):
```
modules/<module>/
  ├── handler.go   # HTTP handler (Gin)
  ├── service.go   # Business logic
  ├── repository.go # DB access (MongoDB driver)
  ├── model.go     # Domain model (alias ke databases)
  ├── dto.go       # Request/Response structs
  └── router.go    # Route registration
```

---

### Daftar File Yang Terlibat

#### Fitur: Like / Favorite

| Layer | File |
|-------|------|
| **UI** | `apps/app/lib/shared/widgets/favorite_button_widget.dart` |
| **UI** | `apps/app/lib/features/favorite/favorite_screen.dart` |
| **UI** | `apps/app/lib/features/product-detail/product_detail_screen.dart` |
| **State** | `apps/app/lib/features/favorite/bloc/favorite_bloc.dart` |
| **State** | `apps/app/lib/features/favorite/bloc/favorite_event.dart` |
| **State** | `apps/app/lib/features/favorite/bloc/favorite_state.dart` |
| **Model/DTO** | `apps/app/lib/features/favorite/domain/data/favorite_data.dart` |
| **Service** | `apps/app/lib/features/favorite/service/favorite_service.dart` |
| **Router** | `services/catalog-service/modules/favorites/router.go` |
| **Handler** | `services/catalog-service/modules/favorites/handler.go` |
| **Service** | `services/catalog-service/modules/favorites/service.go` |
| **Repository** | `services/catalog-service/modules/favorites/repository.go` |
| **Model/DTO** | `services/catalog-service/modules/favorites/dto.go` / `model.go` |
| **DB Init** | `services/catalog-service/databases/init.go` |
| **DB Model** | `services/catalog-service/databases/models.go` |

#### Fitur: Search & Filter Product

| Layer | File |
|-------|------|
| **UI** | `apps/app/lib/features/search-product/search_product_screen.dart` |
| **UI** | `apps/app/lib/features/search-product/widgets/search_bar_widget.dart` |
| **UI** | `apps/app/lib/features/search-product/widgets/search_filter_sheet.dart` |
| **State** | `apps/app/lib/features/search-product/bloc/search_product_bloc.dart` |
| **State** | `apps/app/lib/features/search-product/bloc/search_product_event.dart` |
| **State** | `apps/app/lib/features/search-product/bloc/search_product_state.dart` |
| **Model/DTO** | `apps/app/lib/features/search-product/domain/dto/search_product_filter.dart` |
| **Model/DTO** | `apps/app/lib/features/search-product/domain/data/search_product_result.dart` |
| **Service** | `apps/app/lib/features/search-product/service/search_product_service.dart` |
| **Router** | `services/catalog-service/modules/products/router.go` |
| **Handler** | `services/catalog-service/modules/products/handler.go` |
| **Service** | `services/catalog-service/modules/products/service.go` |
| **Repository** | `services/catalog-service/modules/products/repository.go` |
| **Model/DTO** | `services/catalog-service/modules/products/dto.go` |
| **DB Init** | `services/catalog-service/databases/init.go` |
| **DB Model** | `services/catalog-service/databases/models.go` |

---

## Fitur: Like Product

### Frontend

#### File Terkait
- `apps/app/lib/shared/widgets/favorite_button_widget.dart`
- `apps/app/lib/features/favorite/bloc/favorite_bloc.dart`
- `apps/app/lib/features/favorite/service/favorite_service.dart`
- `apps/app/lib/features/favorite/favorite_screen.dart`
- `apps/app/lib/features/product-detail/product_detail_screen.dart`

#### A. UI Layer
- **Tombol Like** dirender oleh `FavoriteButtonWidget` ( dipakai di product card & product detail gallery).
- **Favorite Screen** (`favorite_screen.dart`) menampilkan grid favorit dengan infinite scroll via `ScrollController` listener (threshold 300px dari bawah).
- **Interaksi**: `onPressed` → `FavoriteToggleRequested`. Di favorite screen, setelah toggle langsung memicu `FavoriteListRequested()` untuk refresh list.
- **Loading/Empty/Error**:
  - `ProductCardSkeleton` ditampilkan saat `isListLoading`.
  - `_EmptyFavorite` ditampilkan saat `favorites.isEmpty`.
  - Error di-list hanya ditangani implisit (service mengembalikan `items: []` jika gagal, tidak ada SnackBar khusus untuk list error).

#### B. State Management (BLoC)
- **FavoriteBloc** mengelola state per-widget / per-screen.
- `_onToggle` (line 32–50) menggunakan **optimistic update**: `isFavorite` di-flip sebelum API call; jika gagal, di-rollback (`!optimistic`) dan `error` di-emit.
- `isToggling` flag menonaktifkan tombol saat request berjalan (mencegah double-tap).
- **MASALAH KRITIS**: Setiap `FavoriteButtonWidget` membuat instance `FavoriteBloc` sendiri (`BlocProvider(create: (_) => FavoriteBloc(...))`). Ini berarti:
  - Jika produk yang sama muncul di 2 tempat (home grid & detail), masing-masing punya state `isFavorite` yang independen.
  - State bisa tidak sinkron antar widget.
- Di `ProductDetailScreen` (line 62), `FavoriteBloc` juga di-instantiate baru. Setiap kali rebuild, `BlocBuilder` memicu `FavoriteCheckRequested` jika `productId == null && !isLoading` (line 211–215), yang bisa menimbulkan flood check request saat rebuild.

#### C. Model / DTO
- `ToggleFavoriteData` & `CheckFavoriteData` hanya punya `isFavorite` + `productId`.
- `FavoriteProductData` memiliki field lengkap (name, slug, price, imageUrl, rating, stock, favoriteCount, dll).
- **Potensi mismatch**: `favorite_data.dart` line 84 membaca `favoriteCount` dari `product['favoriteCount']`, namun di BE `FavoriteProductSnapshot` menggunakan `camelCase` (`favoriteCount`). Gin default JSON tag sudah sesuai (`json:"favoriteCount"`), jika encoding-nya standard tidak ada masalah.

#### D. Repository / Service Layer
- `FavoriteService.toggle` → `POST /favorites/toggle` (`productId` di body).
- `FavoriteService.check` → `GET /favorites/check/{productId}`.
- `FavoriteService.getUserFavorites` → `GET /favorites?page=&limit=`.
- **Pagination**: Menggunakan `page` + `limit` (offset-based). FE menentukan `hasMore` dari `page < lastPage`.

#### E. Error & Edge Case Handling di FE
- **Network error / toggle gagal**: Rollback optimistic update + SnackBar dari `BlocConsumer.listener`.
- **Double-tap**: Ditangani oleh `isToggling` flag yang membuat `onPressed` null selama request.
- **Favorite list setelah unlike**: Di `favorite_screen.dart` line 172–177, setelah `FavoriteToggleRequested`, langsung dikirim `FavoriteListRequested()`. Ini akan **refresh seluruh list** dari page 1, yang tidak efisien dan menyebabkan jump scroll.

---

### Backend

#### Endpoint Terkait
- `POST /favorites/toggle` — auth required
- `GET /favorites` — auth required
- `GET /favorites/check/:productId` — auth required
- `GET /favorites/product/:productId` — public

#### A. Endpoint & Routing
- Routing di `modules/favorites/router.go` lines 26–32. Middleware JWT diterapkan pada endpoint yang memerlukan auth.
- Endpoint `toggle` **tidak idempotent secara logika bisnis**: ia adalah "toggle" (switch on/off), bukan operation idempotent seperti `PUT /favorites/{productId}`.

#### B. Controller / Handler
- `handler.Toggle` (line 26–49): Bind JSON body, ambil `user_id` dari context JWT.
- `handler.GetUserFavorites` (line 51–79): Bind query params, default page=1 & limit=20 jika tidak valid. Tidak ada rate limiting.
- **Tidak ada rate limiting / throttling** pada toggle. User bisa spam tombol like secara teori (meskipun FE punya `isToggling`).

#### C. Business Logic / Service Layer
- `service.Toggle` (line 47–73) menggunakan pola **read-then-write**:
  1. `FindByUserAndProduct` → cek existing.
  2. Jika ada → `Delete` (soft delete).
  3. Jika tidak ada → `getProductByID` → `Create`.
- **Race condition**: Dua request konkuren bisa lolos step 1 bersamaan, lalu keduanya melakukan `Create`. MongoDB unique index seharusnya menangkap ini, **NAMUN**:
- **BUG KRITIS — Collection Name Mismatch**: `repository.go` line 28 menggunakan `db.Collection("favorites")`, sedangkan `init.go` line 145 membuat index pada `"favorite_products"`, dan seed juga menulis ke `"favorite_products"`. Hal ini berarti:
  - Runtime code menulis ke collection `favorites` (tanpa index sama sekali).
  - Seed data masuk ke `favorite_products`.
  - Unique constraint **tidak pernah diterapkan** pada collection yang aktif dipakai aplikasi.
- **BUG KRITIS — Soft Delete + Unique Index**: Unique index `uniq_favorite_user_product` (jika diterapkan pada collection yang benar) **tidak menggunakan partial filter** (`deleted_at: nil`). Artinya, setelah user unlike (soft delete), record masih ada di DB. Saat user like lagi, insert akan gagal karena duplicate key error. Ini membuat toggle menjadi **permanen off setelah pertama kali unlike**.

#### D. Database Layer
- **MongoDB**.
- Collections yang relevan: `favorites` (runtime) vs `favorite_products` (seed/index). `products`.
- **Index**:
  - `idx_product_search_text` (text search) — ada.
  - `idx_favorite_user`, `idx_favorite_product` — didefinisikan di init tapi pada collection yang salah.
- **N+1 Query**:
  - `service.GetUserFavorites` → `batchEnrich` melakukan 5 query batch terpisah (products, prices, inventories, images, categories). Meskipun "batch", tetap 5 round-trip MongoDB per page. Untuk latency tinggi, ini akan terasa lambat.

#### E. Keamanan
- Autentikasi: JWT middleware (`middleware.JWTAuthMiddleware`) menjamin `user_id` di-context.
- **User isolation**: `Toggle`, `GetUserFavorites`, `CheckFavorite` selalu menggunakan `user_id` dari token. User tidak bisa mengubah favorit user lain.
- SQL Injection: Tidak relevan (MongoDB + bson.M driver), namun `$text` query langsung menggunakan `query.Keyword` tanpa sanitasi karakter spesial MongoDB text search (misalnya `"` atau `-`). Ini bisa memicu syntax error atau behavior search yang unexpected.

---

### Alur Data End-to-End (Like)

```
[User tap tombol like]
   ↓
[FavoriteButtonWidget.onPressed]
   ↓
FavoriteBloc.add(FavoriteToggleRequested)
   ↓
_onToggle: optimistic = !state.isFavorite
emit(isFavorite: optimistic, isToggling: true)          ← UI langsung berubah
   ↓
FavoriteService.toggle() → POST /favorites/toggle
   ↓
[Gin Handler Toggle] → service.Toggle()
   ↓
repository.FindByUserAndProduct(userID, productID)       ← RACE CONDITION POINT
   ↓
(if exists) repository.Delete()  → soft delete + $inc favorite_count -1
(if not)    repository.Create()  → insert + $inc favorite_count +1
   ↓
Return ToggleFavoriteResponse { isFavorite }
   ↓
Bloc: emit(isFavorite: res.data.isFavorite, isToggling: false)
   ↓
[UI reflect perubahan]
```

**Potensi Bottleneck / Race Condition / Inkonsistensi:**
1. **Race condition di Toggle service**: Non-atomic read-then-write. Dua request konkuren bisa insert ganda (jika tidak ada unique index). Karena collection mismatch, unique index tidak aktif.
2. **Soft delete + non-partial unique index**: User tidak bisa like lagi setelah unlike.
3. **Collection name mismatch (`favorites` vs `favorite_products`)**: Data seeded tidak terbaca oleh aplikasi; index tidak diterapkan.
4. **Inkonsistensi count**: Jika `Create` berhasil tapi `$inc` pada product gagal (atau sebaliknya), `favorite_count` pada produk akan tidak akurat.
5. **Frontend state desync**: Setiap widget punya Bloc sendiri; like di detail tidak otomatis update card di home.

---

### Rekomendasi (Like)

1. **Perbaiki nama collection** agar konsisten antara runtime (`repository.go`) dan init/seed (`init.go`, `seed/seeds/favorite.go`). Gunakan satu nama: `favorite_products`.
2. **Buat unique index menjadi partial** agar hanya berlaku pada dokumen aktif (`deleted_at: nil`), sehingga user bisa like kembali setelah unlike:
   ```go
   namedUniquePartialIndex("uniq_favorite_user_product", bson.D{{Key: "user_id", Value: 1}, {Key: "product_id", Value: 1}})
   ```
3. **Buat Toggle menjadi idempotent & atomic** menggunakan transaksi MongoDB atau pattern `findOneAndUpdate` dengan upsert. Hindari read-then-write manual.
4. **Sinkronisasi state like di FE**: Gunakan shared BLoC (singleton/global provider) atau event bus, sehingga like di satu widget langsung memperbarui widget lain untuk produk yang sama.
5. **Di FavoriteScreen, jangan refresh seluruh list setelah unlike**. Gunakan optimistic removal dari list lokal atau patch state, bukan `FavoriteListRequested()`.
6. **Tambahkan rate limiting** (misalnya 10 toggle/minute per user) di backend untuk mencegah abuse.

---

## Fitur: Search & Filter Product

### Frontend

#### File Terkait
- `apps/app/lib/features/search-product/search_product_screen.dart`
- `apps/app/lib/features/search-product/widgets/search_bar_widget.dart`
- `apps/app/lib/features/search-product/widgets/search_filter_sheet.dart`
- `apps/app/lib/features/search-product/bloc/search_product_bloc.dart`
- `apps/app/lib/features/search-product/service/search_product_service.dart`
- `apps/app/lib/features/search-product/domain/dto/search_product_filter.dart`
- `apps/app/lib/features/Main/features/home/domains/data/product_data.dart`

#### A. UI Layer
- **SearchBarWidget** (`search_bar_widget.dart`): `TextField` dengan `onSubmitted`. Tidak ada debounce karena search tidak real-time-as-you-type (user harus tekan tombol search keyboard).
- **Filter Sheet** (`search_filter_sheet.dart`): Modal bottom sheet untuk memilih kategori, rentang harga (min/max), dan eco score minimum (slider + switch).
- **Active Filter Chips**: Ditampilkan di bawah search bar; user bisa hapus salah satu filter secara individual.
- **Loading/Empty/Error**:
  - `SearchResultSkeletonList` saat `loading`.
  - `_EmptyView` dengan pesan `"Tidak ada produk untuk \"{query}\"` saat loaded & results empty.
  - `_ErrorView` dengan tombol retry saat `error`.

#### B. State Management (BLoC)
- **SearchProductBloc** mengelola:
  - `lastQuery`: string query terakhir
  - `filter`: `SearchProductFilter` (categoryId, minPrice, maxPrice, minEcoScore)
  - `history`: daftar riwayat pencarian (persisted ke SharedPreferences)
  - `status`: initial / loading / loaded / error
- **Debounce/throttle**: Tidak ada. Karena menggunakan `onSubmitted`, ini tidak menjadi masalah. Namun, tidak ada cancellation request in-flight jika user submit berkali-kali.
- **State reset**: Filter bisa di-reset di modal (`_reset` → `const SearchProductFilter()`). Saat screen ditutup, state tidak di-reset (Bloc masih hidup selama screen ada). Jika ingin bersih saat keluar, perlu `BlocProvider` cleanup.
- **MASALAH**: Setelah filter diubah dari chips (misal hapus filter harga), jika `lastQuery` kosong, hanya state filter yang berubah tanpa auto-search. Ini sudah ditangani di `_openFilter` (line 86–93).

#### C. Model / DTO
- `SearchProductFilter` (line 3–33):
  - `categoryId: String?`
  - `minPrice: double?`
  - `maxPrice: double?`
  - `minEcoScore: double?`
  - Method `toJson()` mengeluarkan snake_case keys: `category_id`, `min_price`, `max_price`, `min_eco_score`.
- `SearchProductResult` (line 3–201): Model union yang bisa di-parse dari response ML (`fromMl`) maupun response Catalog (`fromCatalog`). Field yang di-parse secara defensif (accepts multiple key aliases).
- **Mismatch**: `SearchProductFilter.toJson()` mengirim `min_eco_score`, namun backend tidak memiliki binding untuk field ini (tidak ada di `ProductSearchQuery`). Efeknya: filter eco score **diterima FE tapi diabaikan BE**.

#### D. Repository / Service Layer
- `SearchProductService.search()` (line 17–51):
  1. Coba `POST {mlApiUrl}/search` (semantic search).
  2. Jika gagal / kosong → fallback ke `GET {catalogApiUrl}/products/search` dengan query params dari `buildCatalogFallbackQuery`.
- `buildCatalogFallbackQuery` hanya mengirimkan `q`, `page=1`, `limit=20`, plus filter jika tidak kosong.
- **Pagination**: Search FE hanya mengambil **page 1** (hardcoded). Tidak ada infinite scroll / load more untuk hasil search.
- **Optimistic update**: Tidak relevan untuk search.

#### E. Error & Edge Case Handling di FE
- **Empty state**: Ditangani dengan `_EmptyView` (saran hapus filter).
- **Error network**: Ditangani dengan `_ErrorView` + retry.
- **Validasi filter harga**: Tidak ada validasi `minPrice > maxPrice`. Filter akan dikirim apa adanya ke BE. Di Go, karena filter menggunakan `$gte` dan `$lte` terpisah, jika `min > max`, query akan menghasilkan 0 produk (logika MongoDB tidak saling validasi).

---

### Backend

#### Endpoint Terkait
- `GET /products/search` — public
- `GET /products` — public (FindMany, digunakan listing produk)

#### A. Endpoint & Routing
- `products.GET("/search", handler.Search)` (`modules/products/router.go` line 22).
- `handler.Search` (line 88–110) bind ke struct `ProductSearchQuery`.

#### B. Controller / Handler
- Validasi pagination: `page <= 0 → 1`, `limit <= 0 || > 100 → 20`. Baik.
- **Tidak ada validasi** untuk `min_price > max_price` atau `min_rating` negatif/ > 5. Gin `ShouldBindQuery` hanya melakukan type coercion, tidak validasi business rule.

#### C. Business Logic / Service Layer
- `service.Search` (line 156–214) membangun `bson.M` filter secara dinamis:
  - `Keyword` → `$text` search (`filter["$text"] = bson.M{"$search": query.Keyword}`).
  - `ShopIDs` → `$in`.
  - `CategoryID` → exact match.
  - `MinPrice / MaxPrice` → `filter["price"] = priceFilter` dengan `$gte` / `$lte`.
  - `MinRating` → `rating_average $gte`.
- **Search Engine**: Menggunakan MongoDB `$text` search (full-text index). Bukan Elasticsearch/Algolia.
- **BUG KRITIS — Price Filter pada Collection Tanpa Field Price**:
  - Struct `databases.Product` (`models.go` line 45–68) **tidak memiliki field `price`**; hanya memiliki `PriceID` (referensi ke collection `prices`).
  - Namun `service.Search` dan `service.FindMany` (line 94–102) memfilter `filter["price"]` langsung pada collection `products`.
  - Karena dokumen produk tidak menyimpan `price`, filter harga akan selalu menghasilkan **0 produc**t jika `min_price` atau `max_price` disupply.
  - Ini berarti **filter harga di search/filter sama sekali tidak bekerja**.
- **BUG — Eco Score Filter Diabaikan**: `ProductSearchQuery` tidak memiliki field `MinEcoScore`, sehingga filter eco score dari FE tidak diproses.

#### D. Database Layer
- **MongoDB** dengan collections: `products`, `prices`, `inventories`, `product_images`, `categories`, `eco_attributes`, `product_discounts`.
- **Indexes** (`init.go`):
  - `idx_product_search_text` (name, description, sku) → mendukung `$text` search. ✅
  - `idx_product_category_active`, `idx_product_shop_active_created`, `idx_product_rating`, `idx_product_price_active`. ✅
  - Namun, karena field `price` tidak ada di dokumen produk (jika schema sesuai `Product` struct), index `idx_product_price_active` tidak berguna.
- **N+1 Query (Performance Bottleneck)**:
  - `service.Search` (dan `FindMany`) setelah mendapat list produk, melakukan loop:
    ```go
    for i, p := range products {
        responses[i] = s.enrichProductResponse(ctx, p)
    }
    ```
  - `enrichProductResponse` (`service.go` line 477–622) untuk **setiap produk** melakukan:
    1. `GetActivePrice` (query ke `prices`)
    2. `GetActiveDiscount` (query ke `product_discounts`)
    3. `GetInventory` (query ke `inventories`)
    4. `GetImages` (query ke `product_images`)
    5. `FindCategoryById` (query ke `categories`)
    6. `GetEcoAttribute` (query ke `eco_attributes`)
    7. Potentially `coreSvc.GetShop` (HTTP call ke core-service)
  - Untuk 20 produk per page = **120+ queries ke MongoDB** + **20 HTTP call** ke core-service. Ini adalah **N+1 yang sangat berat**.
- **CountDocuments tanpa limit**: `FindMany` di `repository.go` line 76 melakukan `CountDocuments` dengan filter yang sama. Untuk koleksi besar, ini bisa lambat jika filter tidak selektif.

#### E. Keamanan
- NoSQL Injection: Karena menggunakan `bson.M` dan struct binding, injection langsung tidak mungkin. Namun `$text` search menerima string mentah. Sebaiknya dilakukan `regexp.QuoteMeta` atau sanitasi spesial character `$text` sebelum dipassing.
- **Tidak ada rate limiting** pada endpoint search. User bisa melakukan scraping dengan brute-force keyword & filter.

---

### Alur Data End-to-End (Search & Filter)

```
[User mengetik query & tekan submit / ubah filter]
   ↓
SearchBarWidget.onSubmitted / _openFilter result
   ↓
SearchProductBloc.add(SearchProductSubmitted(query, filter))
   ↓
emit(status: loading)
   ↓
SearchProductService.search()
   ├─→ POST ML /search  (semantic search)
   │      Jika sukses & tidak kosong → return results
   └─→ Fallback: GET /products/search?q=...&category_id=...&min_price=...
          ↓
       [Gin Handler Search]
          ↓
       service.Search(ctx, query)
          ↓
       Bangun bson.M filter:
         - $text: Keyword
         - category_id, shop_id $in
         - price $gte/$lte         ← BROKEN (field tidak ada)
         - rating_average $gte
          ↓
       repository.FindMany(filter, opts)
          ↓
       Loop products → enrichProductResponse (per produk)
         → 6 DB queries + 1 HTTP call ke core-service per produk   ← N+1 BOTTLENECK
          ↓
       Return []ProductResponse + meta pagination
          ↓
   Parse JSON → List<SearchProductResult>
   ↓
emit(status: loaded, results: [...])
   ↓
[UI render _ResultList]
```

**Potensi Bottleneck / Race Condition / Inkonsistensi:**
1. **N+1 di enrichProductResponse**: Botleneck performa paling besar. 20 produk = 120+ query MongoDB.
2. **Price filter broken**: Field `price` tidak terdapat pada schema `Product`, menyebabkan hasil search kosong jika filter harga aktif.
3. **Eco score filter diabaikan**: Backend tidak membaca `min_eco_score` dari query params.
4. **ML → Catalog fallback tanpa cancellation**: Jika ML API lambat, FE menunggu timeout baru fallback. Tidak ada mekanisme abort jika user mengganti query saat request berjalan.
5. **Phantom read pada pagination**: `CountDocuments` dan `Find` adalah dua operasi terpisah; data bisa berubah di antaranya (meta pagination mungkin sedikit tidak akurat).

---

### Rekomendasi (Search & Filter)

1. **Perbaiki N+1 dengan Aggregation Pipeline**:
   - Gunakan MongoDB `$lookup` (join) dalam single aggregation untuk mengambil price, inventory, image, category, eco, dan discount sekaligus.
   - Atau, denormalisasi field-field yang sering dibaca (price, stock, first image URL, categoryName, ecoScore) ke dalam dokumen `products` agar `enrichProductResponse` tidak perlu query eksternal.
2. **Perbaiki Price Filter**:
   - Jika tetap pakai referensi (normalisasi), gunakan aggregation pipeline dengan `$lookup` ke `prices`, lalu `$match` stage untuk filter harga setelah join.
   - Atau, denormalisasi `price` ke collection `products` (update setiap kali harga berubah).
3. **Tambahkan `MinEcoScore` ke DTO Backend**:
   - `ProductSearchQuery` perlu field `MinEcoScore float64`.
   - `service.Search` perlu menambahkan filter ke `eco_attributes` (via aggregation $lookup atau field denormalized `eco_score` pada products).
4. **Tambahkan Validasi Business Rule di Handler**:
   - Jika `min_price > max_price`, return 400 Bad Request.
   - Jika `min_rating < 0 || > 5`, return 400.
5. **Tambahkan Debounce & Request Cancellation di FE**:
   - Meskipun saat ini pakai `onSubmitted`, tambahkan `CancelToken`/`dio.CancelToken` (jika API client mendukung) dan batalkan request sebelumnya sebelum memulai yang baru.
6. **Load More / Pagination untuk Search**:
   - Tambahkan infinite scroll atau pagination control di search screen (saat ini hardcoded page=1).
7. **Rate Limiting di Search Endpoint**:
   - Batasi misalnya 30 request/minute per IP untuk mencegah scraping.
8. **Gunakan `$search` (Atlas Search) jika memungkinkan**:
   - `$text` search MongoDB terbatas (tidak mendukung typo tolerance, relevance tuning). Jika menggunakan MongoDB Atlas, pertimbangkan `$search` stage.

---

## Ringkasan Prioritas

### Prioritas 1 — Critical (Data Integrity / Security / Core Functionality)
1. **Backend: Collection name mismatch `favorites` vs `favorite_products`**  
   (`services/catalog-service/modules/favorites/repository.go:28` vs `services/catalog-service/databases/init.go:145`). Index & seed tidak berlaku pada collection runtime.
2. **Backend: Unique index tidak partial pada soft-deleted favorites**  
   (`services/catalog-service/databases/init.go:145`). User tidak bisa like ulang setelah unlike.
3. **Backend: Price filter broken karena field `price` tidak ada di schema `Product`**  
   (`services/catalog-service/modules/products/service.go:94-102`, `databases/models.go:45-68`). Search dengan filter harga selalu kosong.
4. **Backend: Race condition non-atomic favorite toggle**  
   (`services/catalog-service/modules/favorites/service.go:47-73`). Dua request konkuren bisa menyebabkan data duplikat atau count tidak konsisten.

### Prioritas 2 — High (Performance / UX)
5. **Backend: N+1 query di enrichProductResponse**  
   (`services/catalog-service/modules/products/service.go:477-622`). 120+ query per halaman produk; harus di-aggregate atau denormalisasi.
6. **Frontend: Favorite state tidak terpusat**  
   (`apps/app/lib/shared/widgets/favorite_button_widget.dart:22-24`). Setiap widget `FavoriteButtonWidget` membuat Bloc instance baru; state like tidak sinkron antar screen.
7. **Backend: Eco score filter di-FE tapi tidak diproses di-BE**  
   (`apps/app/lib/features/search-product/domain/dto/search_product_filter.dart:27` vs `services/catalog-service/modules/products/dto.go:19-30`). Filter eco tidak berfungsi end-to-end.

### Prioritas 3 — Medium (Code Quality / Edge Cases)
8. **Frontend: FavoriteScreen refresh seluruh list setelah unlike**  
   (`apps/app/lib/features/favorite/favorite_screen.dart:172-177`). Sebaiknya gunakan optimistic list update, bukan full refresh.
9. **Frontend & Backend: Tidak ada validasi minPrice > maxPrice**  
   (`apps/app/lib/features/search-product/widgets/search_filter_sheet.dart:49-59`, `services/catalog-service/modules/products/handler.go:88-110`).
10. **Backend: Shop name fetch di-loop (HTTP call per produk)**  
   (`services/catalog-service/modules/products/service.go:483`). Cache `sync.Map` sudah ada, tapi cold cache tetap melakukan 20 HTTP call. Gunakan batch get shops (satu call dengan list shopIDs) jika core-service mendukung.
11. **Backend: `$text` keyword tidak di-escape/sanitasi**  
   (`services/catalog-service/modules/products/service.go:163`). Karakter khusus MongoDB text search bisa memicu syntax error.

### Quick Wins
- **FE**: Nonaktifkan filter harga di UI sementara jika BE belum diperbaiki, atau tampilkan pesan bahwa filter harga sedang dalam perbaikan.
- **BE**: Ubah `db.Collection("favorites")` menjadi `db.Collection("favorite_products")` di `repository.go` agar sejalan dengan seed & index.
- **BE**: Tambahkan partial filter expression pada unique index favorit.
- **FE**: Ganti `FavoriteListRequested()` setelah toggle di `favorite_screen.dart` dengan menghapus item dari list state lokal (`state.favorites.removeWhere(...)`).
- **FE**: Di `product_detail_screen.dart`, jangan memicu `FavoriteCheckRequested` di dalam `BlocBuilder.builder` (line 211–215); pindahkan ke `initState` atau gunakan `BlocListener`/`useEffect`-style initialization.

---

**Catatan Akhir:** Dua fitur ini sudah memiliki fondasi arsitektur yang baik (BLoC, modular Go, MongoDB indexing infrastructure), namun terdapat beberapa bug fundamen di backend (schema mismatch, filter broken, collection name mismatch) yang harus diperbaiki sebelum fitur dapat dianggap production-stable.
