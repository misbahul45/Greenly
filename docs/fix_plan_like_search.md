# Rencana Perbaikan: Like Product & Search/Filter Product

**Dokumen ini disusun berdasarkan hasil code review** dari `/docs/analysis_like_search.md`.  
**Tujuan:** Memberikan langkah-langkah konkret, file-per-file, untuk memperbaiki seluruh temuan bug, inkonsistensi, dan bottleneck.

---

## Executive Summary

| Kategori | Jumlah | Prioritas Tertinggi |
|----------|--------|---------------------|
| Critical Backend Bugs | 4 | Collection mismatch, unique index partial, price filter broken, toggle race condition |
| High Performance/UX | 3 | N+1 query, FE state desync, eco filter E2E |
| Medium Quality | 5 | Validation, refresh list, HTTP batching, text sanitasi |
| Quick Wins | 4 | Bisa dikerjakan dalam 1–2 hari tanpa refactor besar |

**Estimasi Total Effort:** 5–8 hari kerja (1 engineer)  
**Rekomendasi Urutan:** Quick Wins → Critical Backend → High Performance → Medium Quality

---

## 1. Daftar Temuan & Perbaikan konkret

---

### 🔴 PRIORITAS 1 — CRITICAL (Data Integrity / Core Functionality)

#### 1.1 Collection Name Mismatch: `favorites` vs `favorite_products`

**Root Cause:**
- `modules/favorites/repository.go:28` → `db.Collection("favorites")`
- `databases/init.go:145` → membuat index pada collection `"favorite_products"`
- `cmd/seed/seeds/favorite.go` → insert ke collection `"favorite_products"`

**Impact:**
- Seed data tidak terbaca oleh aplikasi runtime.
- Unique index tidak pernah diterapkan pada data aktif.
- Potensi data duplikat karena tidak ada constraint.

**Fix — Langkah-langkah:**

1. **Pilih satu nama collection yang konsisten.**  
   Rekomendasi: gunakan **`favorite_products`** (nama lebih deskriptif, sudah dipakai seed & init).

2. **Edit file:**
   ```go
   // File: services/catalog-service/modules/favorites/repository.go
   // Line: 28
   
   // SEBELUM:
   collection:    db.Collection("favorites"),
   
   // SESUDAH:
   collection:    db.Collection("favorite_products"),
   ```

3. **Pastikan seed & init sudah pakai nama yang sama.**  
   Cek `databases/init.go:145` dan `cmd/seed/seeds/favorite.go:12` — sudah benar pakai `"favorite_products"`, jadi **hanya perlu edit repository.go**.

4. **Migration Script (opsional tapi sangat direkomendasikan):**
   Jika environment staging/production sudah punya data di collection `favorites` (runtime) dan `favorite_products` (seed), jalankan shell script/mongo script untuk merge:
   ```bash
   # One-time migration command
   mongosh "mongodb://localhost:27017/greenly" --eval '
     db.favorites.aggregate([
       { $merge: { into: "favorite_products", on: ["user_id", "product_id"], whenMatched: "keepExisting", whenNotMatched: "insert" }}
     ]);
   '
   ```

5. **Verifikasi:**
   ```bash
   # Cek index di collection favorite_products
   mongosh "mongodb://localhost:27017/greenly" --eval 'db.favorite_products.getIndexes()'
   ```
   Pastikan `uniq_favorite_user_product`, `idx_favorite_user`, `idx_favorite_product` muncul.

---

#### 1.2 Unique Index Tidak Partial pada Soft-Deleted Favorites

**Root Cause:**
- `databases/init.go:145` membuat unique index tanpa partial filter expression.
- `repository.Create` melakukan `InsertOne` dokumen baru saat like.
- `repository.Delete` hanya melakukan soft delete (`$set: { deleted_at: now }`).
- Dokumen lama masih ada di DB → insert baru dengan (user_id, product_id) yang sama akan gagal (duplicate key).

**Impact:**
- User **tidak bisa like ulang** produk yang pernah di-unlike.

**Fix — Langkah-langkah:**

1. **Edit `databases/init.go:145`** (ubah dari `namedUniqueIndex` ke `namedUniquePartialIndex`):
   ```go
   // File: services/catalog-service/databases/init.go
   // Sekitar line 145–149
   
   // SEBELUM:
   "favorite_products": {
       namedUniqueIndex("uniq_favorite_user_product", bson.D{{Key: "user_id", Value: 1}, {Key: "product_id", Value: 1}}),
       namedIndex("idx_favorite_user", bson.D{{Key: "user_id", Value: 1}}),
       namedIndex("idx_favorite_product", bson.D{{Key: "product_id", Value: 1}}),
   },
   
   // SESUDAH:
   "favorite_products": {
       namedUniquePartialIndex("uniq_favorite_user_product", bson.D{{Key: "user_id", Value: 1}, {Key: "product_id", Value: 1}}),
       namedIndex("idx_favorite_user", bson.D{{Key: "user_id", Value: 1}}),
       namedIndex("idx_favorite_product", bson.D{{Key: "product_id", Value: 1}}),
   },
   ```

   > `namedUniquePartialIndex` sudah didefinisikan di `init.go:377–384` dan akan otomatis menambahkan `partialFilterExpression: { deleted_at: nil }`.

2. **Verifikasi:**
   Setelah aplikasi restart, cek index:
   ```js
   db.favorite_products.getIndexes()
   ```
   Pastikan `uniq_favorite_user_product` memiliki `partialFilterExpression: { deleted_at: null }`.

3. **Test manual:**
   - Like produk A → sukses.
   - Unlike produk A → sukses.
   - Like produk A lagi → **harus sukses** (sebelumnya akan Gagal dengan E11000 duplicate key).

---

#### 1.3 Price Filter Broken di Search

**Root Cause:**
- `databases/models.go:45–68` → struct `Product` **tidak memiliki field `price`**.
- `modules/products/service.go:94–102` & `service.go:174–183` memfilter `filter["price"] = priceFilter` pada collection `products`.
- Data harga tersimpan di collection terpisah (`prices`) dengan `product_id` reference.

**Impact:**
- Search dengan filter harga (min/max) **selalu mengembalikan 0 hasil**.

**Fix — Ada 2 strategi, pilih salah satu:**

##### **Strategi A: Denormalisasi (Rekomendasi — lebih sederhana & cepat)**
**Idea:** Tambahkan field `price float64` ke struct `Product` dan selalu update saat harga berubah.

1. **Edit `databases/models.go`**:
   ```go
   type Product struct {
       Base `bson:",inline"`
       // ... field lain ...
       
       Price       float64 `bson:"price" json:"price"`           // ← TAMBAH
       Currency    string  `bson:"currency" json:"currency"`     // ← TAMBAH (opsional)
       
       FavoriteCount int     `bson:"favorite_count" json:"favoriteCount"`
       // ...
   }
   ```

2. **Edit `modules/products/service.go` — Create** (line 231–280):
   Saat membuat produk, copy price ke product:
   ```go
   product := databases.Product{
       ShopID:      dto.ShopID,
       CategoryID:  dto.CategoryID,
       Name:        dto.Name,
       Slug:        slug,
       Description: dto.Description,
       SKU:         dto.SKU,
       IsActive:    dto.IsActive,
       Price:       dto.Price,         // ← TAMBAH
       Currency:    dto.Currency,      // ← TAMBAH
   }
   ```

3. **Edit `modules/products/service.go` — Update** (line 283–344):
   Jika price di-update, update juga field di product:
   ```go
   if dto.Price != nil {
       existing.Price = *dto.Price
   }
   if dto.Currency != nil {
       existing.Currency = *dto.Currency
   }
   ```

4. **Pastikan `enrichProductResponse` tetap mengambil dari `prices` collection** (sebagai sumber truth), tapi `service.FindMany` dan `service.Search` sekarang bisa filter langsung.

5. **Migration untuk data existing:**
   ```js
   // MongoDB one-time migration
   db.prices.find().forEach(function(p) {
     db.products.updateOne(
       { _id: p.product_id },
       { $set: { price: p.amount, currency: p.currency } }
     );
   });
   ```

##### **Strategi B: Aggregation Pipeline ($lookup)**
**Idea:** Gunakan MongoDB aggregation dengan `$lookup` untuk join ke `prices`, lalu `$match` harga.

- Lebih pure normalisasi tapi lebih kompleks.
- Perlu refactor `repository.FindMany` untuk menerima pipeline stages.
- Direkomendasikan jika **tidak ingin menambah field `price`** ke `Product` karena alasan arsitektur.

**Rekomendasi:** Gunakan **Strategi A** (denormalisasi) karena:
- Produk read-heavy (search/listing jauh lebih sering daripada update harga).
- Sudah ada pola denormalisasi lain di `Product` (favorite_count, shop_name, rating_average).

---

#### 1.4 Race Condition Non-Atomic Favorite Toggle

**Root Cause:**
- `modules/favorites/service.go:47–73`:
  ```go
  existing, err := s.repository.FindByUserAndProduct(ctx, userID, productID)
  if err == nil && existing.ID != "" {
      // delete
  } else {
      // create
  }
  ```
- Ini adalah **read-then-write** non-transactional. Dua goroutine/request bisa membaca "tidak ada" bersamaan, lalu keduanya insert.

**Fix — Gunakan MongoDB Transaction atau Atomic Upsert:**

##### **Opsi 1: MongoDB Transaction (Rekomendasi — paling robust)**

1. **Edit `modules/favorites/repository.go`**: Tambahkan method baru:
   ```go
   func (r *repository) ToggleWithTransaction(ctx context.Context, userID, productID string) (bool, error) {
       session, err := r.collection.Database().Client().StartSession()
       if err != nil {
           return false, err
       }
       defer session.EndSession(ctx)

       result, err := session.WithTransaction(ctx, func(sessCtx mongo.SessionContext) (interface{}, error) {
           // Cek existing
           var existing Favorite
           err := r.collection.FindOne(sessCtx, bson.M{
               "user_id":    userID,
               "product_id": productID,
               "deleted_at": nil,
           }).Decode(&existing)

           if err == nil && existing.ID != "" {
               // Unlike: soft delete
               _, err := r.collection.UpdateOne(sessCtx,
                   bson.M{"_id": existing.ID},
                   bson.M{"$set": bson.M{"deleted_at": time.Now()}},
               )
               if err != nil {
                   return false, err
               }
               // Decrement count
               _, err = r.productCollection.UpdateOne(sessCtx,
                   bson.M{"_id": productID},
                   bson.M{"$inc": bson.M{"favorite_count": -1}},
               )
               return false, err
           }

           // Like: create new
           fav := Favorite{
               UserID:    userID,
               ProductID: productID,
           }
           fav.BeforeCreate()
           _, err = r.collection.InsertOne(sessCtx, fav)
           if err != nil {
               return false, err
           }
           // Increment count
           _, err = r.productCollection.UpdateOne(sessCtx,
               bson.M{"_id": productID},
               bson.M{"$inc": bson.M{"favorite_count": 1}},
           )
           return true, err
       })

       if err != nil {
           return false, err
       }
       return result.(bool), nil
   }
   ```

2. **Edit `modules/favorites/service.go`**: Ubah `Toggle`:
   ```go
   func (s *service) Toggle(ctx context.Context, userID string, productID string) (ToggleFavoriteResponse, error) {
       // Verifikasi produk ada (opsional, tapi baik untuk validasi)
       product, err := s.getProductByID(ctx, productID)
       if err != nil {
           return ToggleFavoriteResponse{}, ErrProductNotFound
       }

       isFav, err := s.repository.ToggleWithTransaction(ctx, userID, productID)
       if err != nil {
           if mongo.IsDuplicateKeyError(err) {
               // Handle race condition: retry once
               isFav, err = s.repository.ToggleWithTransaction(ctx, userID, productID)
           }
           if err != nil {
               return ToggleFavoriteResponse{}, err
           }
       }

       return ToggleFavoriteResponse{IsFavorite: isFav, ProductID: productID}, nil
   }
   ```

3. **Update `Repository` interface** di `repository.go` untuk menambahkan `ToggleWithTransaction`.

---

### 🟠 PRIORITAS 2 — HIGH (Performance / UX)

#### 2.1 N+1 Query di `enrichProductResponse`

**Root Cause:**
- `modules/products/service.go:477–622` melakukan 6 query per produk: price, discount, inventory, images, category, eco.
- Untuk 20 produk = 120+ query.

**Fix — Batch Aggregation Approach:**

**Langkah 1: Denormalisasi (jika belum)**  
Jika sudah menjalankan **1.3 Strategi A (denormalisasi price)**, price sudah tersedia di product document.

**Langkah 2: Buat Batch Enrich Service**  
Refactor `FindMany` & `Search` di `service.go` untuk melakukan batch enrichment seperti yang sudah dilakukan di `favorites/service.go:100–225` (batchEnrich).

**Implementasi detail:**

1. **Hapus/sekat `enrichProductResponse` lama** dari loop di `FindMany` (line 132–136):
   ```go
   // SEBELUM:
   responses := make([]ProductResponse, len(products))
   for i, p := range products {
       responses[i] = s.enrichProductResponse(ctx, p)  // N+1 di sini
   }
   ```

2. **Buat method baru `batchEnrichProducts`**:
   ```go
   func (s *service) batchEnrichProducts(ctx context.Context, products []databases.Product) ([]ProductResponse, error) {
       if len(products) == 0 {
           return []ProductResponse{}, nil
       }

       productIDs := make([]string, len(products))
       for i, p := range products {
           productIDs[i] = p.ID
       }

       // 1. Batch prices
       priceMap := make(map[string]databases.Price)
       if cur, err := s.repository.(*repository).priceCollection.Find(ctx, bson.M{"product_id": bson.M{"$in": productIDs}}); err == nil {
           // ... decode ke priceMap
       }

       // 2. Batch inventories
       // 3. Batch images
       // 4. Batch discounts
       // 5. Batch eco attributes
       // 6. Batch categories

       // Build response
       responses := make([]ProductResponse, len(products))
       for i, p := range products {
           resp := ProductResponse{ /* ... basic fields ... */ }
           if pr, ok := priceMap[p.ID]; ok {
               resp.Price = pr.Amount
               resp.Currency = pr.Currency
           }
           // ... assign dari batch maps lainnya ...
           responses[i] = resp
       }
       return responses, nil
   }
   ```

3. **Namun**, ini memerlukan exposure koleksi lain ke `product` module, yang melanggar encapsulation. Lebih baik:
   - **Tambahkan method ke `Repository` interface** seperti `GetPricesByProductIDs`, `GetInventoriesByProductIDs`, dll.
   - Atau **buatlah enrichment service tersendiri** yang mengakses koleksi terkait.

**Alternatif lebih cepat:**  
Tambahkan field denormalized berikut ke `Product`:
- `price`, `currency`
- `stock`
- `image_urls []string` (first image atau semua, embedded)
- `category_name`
- `eco_score`, `eco_label`
- `shop_name` (sudah ada tapi mungkin perlu auto-update)

Dengan denormalisasi lengkap, `enrichProductResponse` hanya perlu 0–1 query (untuk data dinamis seperti diskon aktif).

**Rekomendasi cepat:**
- Untuk search/listing **public**: denormalisasi semua field di atas.
- Untuk detail product (1 produk saja): biarkan `enrichProductResponse` melakukan query per koleksi (karena hanya 1 produk, impact minimal).

---

#### 2.2 State Like Tidak Terpusat di Flutter

**Root Cause:**
- `favorite_button_widget.dart:22–24` membuat `FavoriteBloc` baru untuk setiap instance widget.
- `product_detail_screen.dart:62` juga membuat `FavoriteBloc` baru.
- State `isFavorite` tidak dishare antar widget.

**Fix — Shared/Global FavoriteBloc:**

1. **Buat provider di atas MaterialApp** (atau di MainScreen):  
   Di `main.dart` atau screen tertinggi yang relevan:
   ```dart
   BlocProvider(
     create: (_) => FavoriteBloc(FavoriteService()),
     child: MaterialApp(...),
   )
   ```

2. **Edit `favorite_button_widget.dart`**:
   ```dart
   // SEBELUM:
   return BlocProvider(
     create: (_) => FavoriteBloc(FavoriteService())..add(FavoriteCheckRequested(productId: productId)),
     child: BlocConsumer<FavoriteBloc, FavoriteState>(...)
   );

   // SESUDAH:
   // Gunakan BlocBuilder yang membaca dari ancestor provider
   return BlocBuilder<FavoriteBloc, FavoriteState>(
     builder: (context, state) {
       // Cek apakah state punya data untuk productId ini
       final isFav = state.favorites.any((f) => f.productId == productId) || 
                     (state.productId == productId && state.isFavorite);
       
       return IconButton(
         onPressed: state.isToggling && state.productId == productId
             ? null
             : () => context.read<FavoriteBloc>().add(
                 FavoriteToggleRequested(productId: productId),
               ),
         icon: Icon(
           isFav ? Icons.favorite : Icons.favorite_border,
           ...
         ),
       );
     },
   );
   ```

3. **Edit `FavoriteBloc`** untuk mendukung multi-product state:
   ```dart
   // favorite_state.dart
   class FavoriteState {
     final Map<String, bool> favoriteMap;  // productId -> isFavorite
     final Set<String> togglingSet;        // productId yang sedang toggle
     // ... field lainnya
   }
   ```

   > Jika refactor state terlalu besar, alternatif sederhana:  
   > Gunakan `BlocProvider.value` atau `RepositoryProvider` untuk share 1 instance `FavoriteBloc` ke seluruh subtree.

---

#### 2.3 Eco Score Filter Tidak Berfungsi End-to-End

**Root Cause:**
- `ProductSearchQuery` (backend) tidak punya field `MinEcoScore`.
- `SearchProductFilter.toJson()` (frontend) mengirim `min_eco_score`.

**Fix:**

1. **Backend DTO** (`modules/products/dto.go`):
   ```go
   type ProductSearchQuery struct {
       Page        int      `form:"page"`
       Limit       int      `form:"limit"`
       Keyword     string   `form:"q"`
       ShopIDs     []string `form:"shop_ids"`
       CategoryID  string   `form:"category_id"`
       MinPrice    float64  `form:"min_price"`
       MaxPrice    float64  `form:"max_price"`
       MinRating   float64  `form:"min_rating"`
       MinEcoScore float64  `form:"min_eco_score"`  // ← TAMBAH
       SortBy      string   `form:"sort_by"`
       SortOrder   string   `form:"sort_order"`
   }
   ```

2. **Backend Service** (`modules/products/service.go:156–214`):
   Tambahkan filter:
   ```go
   if query.MinEcoScore > 0 {
       filter["eco_score"] = bson.M{"$gte": query.MinEcoScore}
   }
   ```

3. **Jika `eco_score` tidak tersimpan di collection `products`** (harus dicek schema):
   - Jika ada: fix di atas cukup.
   - Jika tidak ada (hanya di `eco_attributes`): denormalisasi `eco_score` ke `Product`, atau gunakan aggregation `$lookup` ke `eco_attributes`.

4. **Frontend tidak perlu diubah** (sudah kirim `min_eco_score` dengan benar).

---

### 🟡 PRIORITAS 3 — MEDIUM (Code Quality / Edge Cases)

#### 3.1 Validasi `minPrice > maxPrice` di Frontend & Backend

**Frontend** (`apps/app/lib/features/search-product/widgets/search_filter_sheet.dart:49–59`):
```dart
void _apply() {
    final minPrice = double.tryParse(_minPriceCtrl.text.trim());
    final maxPrice = double.tryParse(_maxPriceCtrl.text.trim());

    // TAMBAH VALIDASI:
    if (minPrice != null && maxPrice != null && minPrice > maxPrice) {
        ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Harga minimum tidak boleh lebih besar dari harga maksimum')),
        );
        return;
    }

    Navigator.of(context).pop(
        SearchProductFilter(
            categoryId: _selectedCategoryId,
            minPrice: minPrice,
            maxPrice: maxPrice,
            minEcoScore: _ecoScoreEnabled ? _ecoScore : null,
        ),
    );
}
```

**Backend** (`modules/products/handler.go:88–110`):
```go
func (h *handler) Search(c *gin.Context) {
    var query ProductSearchQuery
    if err := c.ShouldBindQuery(&query); err != nil {
        c.Error(middleware.NewAppError(400, "Invalid query params", nil))
        return
    }

    // TAMBAH VALIDASI:
    if query.MinPrice > 0 && query.MaxPrice > 0 && query.MinPrice > query.MaxPrice {
        c.Error(middleware.NewAppError(400, "min_price cannot be greater than max_price", nil))
        return
    }
    if query.MinRating < 0 || query.MinRating > 5 {
        c.Error(middleware.NewAppError(400, "min_rating must be between 0 and 5", nil))
        return
    }

    // ... lanjutkan existing logic
}
```

---

#### 3.2 FavoriteScreen Refresh Seluruh List Setelah Unlike

**Root Cause:**
- `favorite_screen.dart:172–177` memanggil `FavoriteListRequested()` setelah toggle.
- Ini me-reset list ke page 1, membuat scroll jump dan tidak efisien.

**Fix:**
```dart
// SEBELUM (favorite_screen.dart:172-177):
onFavoriteTap: () {
    context.read<FavoriteBloc>().add(
        FavoriteToggleRequested(productId: product.productId),
    );
    context.read<FavoriteBloc>().add(FavoriteListRequested());  // ← HAPUS
},

// SESUDAH:
// Di FavoriteBloc._onToggle, setelah toggle sukses (unlike), langsung hapus dari list:
Future<void> _onToggle(...) async {
    // ... existing toggle logic ...
    if (res.isSuccess && res.data != null) {
        emit(state.copyWith(
            isFavorite: res.data!.isFavorite,
            isToggling: false,
        ));
        
        // Jika ini unlike (isFavorite = false), hapus dari favorites list
        if (!res.data!.isFavorite) {
            final newFavorites = state.favorites
                .where((f) => f.productId != event.productId)
                .toList();
            emit(state.copyWith(
                favorites: newFavorites,
                totalFavorites: state.totalFavorites - 1,
            ));
        }
    } else {
        // rollback...
    }
}
```

---

#### 3.3 Batch Shop Name Fetch di core-service

**Root Cause:**
- `service.go:483` memanggil `coreSvc.GetShop(ctx, product.ShopID)` satu per satu di loop.

**Fix:**
1. **Tambahkan endpoint batch di core-service** (jika belum ada):
   `POST /shops/batch` dengan body `{ "shopIds": ["id1", "id2", ...] }`.

2. **Di catalog-service**, sebelum loop enrichment, kumpulkan unique shopIDs:
   ```go
   shopIDSet := make(map[string]struct{})
   for _, p := range products {
       shopIDSet[p.ShopID] = struct{}{}
   }
   shopIDs := make([]string, 0, len(shopIDSet))
   for id := range shopIDSet { shopIDs = append(shopIDs, id) }
   
   // Batch fetch sekali
   shopMap, _ := s.coreSvc.GetShopsBatch(ctx, shopIDs)
   ```

> Jika mengubah core-service tidak memungkinkan, gunakan cache `sync.Map` yang sudah ada dan pertimbangkan TTL cache.

---

#### 3.4 `$text` Search Sanitasi

**Root Cause:**
- `modules/products/service.go:163` memasukkan `query.Keyword` mentah ke `$text`.
- Karakter spesial MongoDB text search (`"`, `-`, `\`) bisa memicu syntax error.

**Fix:**
```go
import "strings"

func sanitizeMongoTextSearch(keyword string) string {
    // Escape karakter yang bisa bermasalah
    keyword = strings.ReplaceAll(keyword, `"`, `\"`)
    keyword = strings.ReplaceAll(keyword, `\\`, `\\\\`)
    // Hapus karakter yang tidak didukung text search
    return keyword
}

// di service.go:163:
if query.Keyword != "" {
    sanitized := sanitizeMongoTextSearch(query.Keyword)
    filter["$text"] = bson.M{"$search": sanitized}
}
```

---

## 2. Roadmap / Timeline

| Sprint | Item | Estimasi | Dependencies |
|--------|------|----------|--------------|
| **Day 1** | 1.1 Fix collection name mismatch | 1 jam | - |
| **Day 1** | 1.2 Fix unique index partial | 30 menit | 1.1 |
| **Day 1** | 4.1 Migration data (jika perlu) | 1–2 jam | 1.1 |
| **Day 1** | 5.1 Test manual favorite toggle | 1 jam | 1.2 |
| **Day 2** | 1.4 Atomic favorite toggle (transaction) | 4–6 jam | 1.1, 1.2 |
| **Day 2** | 5.2 Unit test toggle | 2 jam | 1.4 |
| **Day 3** | 1.3 Denormalisasi price ke Product | 3–4 jam | - |
| **Day 3** | 1.3 Migration script price data | 1 jam | 1.3 |
| **Day 4** | 2.1 Batch Enrich / Aggregation | 6–8 jam | 1.3 |
| **Day 4** | 2.3 Eco score filter E2E | 1–2 jam | - |
| **Day 5** | 2.2 Shared FavoriteBloc (FE) | 4–6 jam | - |
| **Day 5** | 3.2 Optimistic list update (FE) | 2 jam | 2.2 |
| **Day 6** | 3.1 Validasi min/max price (FE+BE) | 2 jam | - |
| **Day 6** | 3.3 Batch shop fetch | 2–4 jam | Perlu diskusi core-service |
| **Day 6** | 3.4 Text search sanitasi | 30 menit | - |
| **Day 7** | Integration testing & regression | 1 hari | Semua di atas |

---

## 3. Testing Plan

### Backend — Unit & Integration

1. **Favorite Toggle Test Cases:**
   - Like produk baru → `isFavorite: true`, `favorite_count +1`.
   - Unlike produk → `isFavorite: false`, `favorite_count -1`.
   - Like → Unlike → Like lagi → harus sukses (test unique index partial).
   - Race condition: concurrent toggle request dari user yang sama → hasil akhir konsisten, count akurat.

2. **Search Filter Test Cases:**
   - Search dengan `min_price` & `max_price` → hasil sesuai range.
   - Search dengan `min_price > max_price` → 400 Bad Request.
   - Search dengan `min_eco_score` → hanya produk dengan eco_score >= value.
   - Search keyword dengan karakter spesial `"test"` → tidak error.

3. **Performance Test:**
   - Benchmark `GET /products/search?q=a&limit=20` sebelum dan sesudah batch enrichment.
   - Target: < 100ms untuk 20 produk (lokal), < 300ms (staging).

### Frontend — Unit & Widget Test

1. **FavoriteButtonWidget:**
   - Tap like → icon berubah ke filled.
   - Tap lagi → icon berubah ke outlined.
   - Loading state → menampilkan `CircularProgressIndicator`.
   - Error state → SnackBar muncul.

2. **SearchProductScreen:**
   - Submit query → skeleton loading muncul.
   - Hasil loaded → list result render.
   - Empty state → `_EmptyView` muncul.
   - Error state → `_ErrorView` + retry button.
   - Hapus filter dari chip → search di-reload dengan filter baru.
   - `minPrice > maxPrice` → SnackBar error, tidak memanggil API.

3. **FavoriteScreen:**
   - Unlike dari list → item dihapus dari grid tanpa full reload.
   - Scroll ke bawah → load more produk favorite.

---

## 4. Risiko & Mitigasi

| Risiko | Probabilitas | Impact | Mitigasi |
|--------|-------------|--------|----------|
| MongoDB transaction error di replica set tunggal | Medium | High | Pastikan MongoDB versi >= 4.2 dan running sebagai replica set (walaupun single node). Deploy lokal menggunakan `rs.initiate()`. |
| Migration denormalisasi price meng-overwrite data | Rendah | High | Backup collection `products` sebelum migration. Test migration di staging dulu. |
| Stateless FavoriteBloc refactor mengubah behavior existing | Medium | Medium | Gradual rollout: share Bloc hanya untuk screen yang saling terkait (detail ↔ home). Pertahankan Bloc lokal untuk widget yang independen. |
| Aggregation pipeline performance tidak lebih baik | Rendah | Medium | Benchmark sebelum deploy. Jika tetap lambat, lanjutkan ke full denormalization. |

---

## 5. Quick Wins (Bisa Dikerjakan Hari Ini)

1. **Fix collection name** (`repository.go:28`) → 5 menit, impact besar.
2. **Fix unique index partial** (`init.go:145`) → 5 menit.
3. **Tambahkan validasi min/max price** (FE & BE) → 30 menit.
4. **Sanitasi `$text` keyword** (`service.go:163`) → 15 menit.
5. **Hapus `FavoriteListRequested()` setelah unlike** di `favorite_screen.dart` → 15 menit.

---

*Dokumen ini harus di-update jika ada perubahan requirement atau temuan baru selama implementasi.*
