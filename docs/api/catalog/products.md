# Products API (Catalog Service)

Base path: `https://greenly-api.duckdns.org/api/catalog`

---

### GET /api/catalog/products

**Deskripsi:** Mendapatkan daftar produk.

**Autentikasi:** Tidak ada (public)

**Query Parameters:**
| Nama | Tipe | Wajib | Keterangan |
|------|------|-------|------------|
| page | int | Tidak | Halaman |
| limit | int | Tidak | Batas per halaman |
| search | string | Tidak | Pencarian |
| shop_id | string | Tidak | Filter toko |
| category_id | string | Tidak | Filter kategori |
| min_price | float | Tidak | Harga minimal |
| max_price | float | Tidak | Harga maksimal |
| min_rating | float | Tidak | Rating minimal |
| is_active | bool | Tidak | Status aktif |
| sort_by | string | Tidak | Field sorting |
| sort_order | string | Tidak | `asc` / `desc` |

**Response — Success (200)**
```json
{
  "data": [
    {
      "id": "string",
      "shopId": "string",
      "categoryId": "string",
      "name": "string",
      "slug": "string",
      "description": "string",
      "sku": "string",
      "favoriteCount": 0,
      "reviewCount": 0,
      "ratingAverage": 0,
      "isActive": true,
      "price": 0,
      "currency": "string",
      "stock": 0,
      "imageUrls": ["string"],
      "categoryName": "string",
      "shopName": "string",
      "createdAt": "datetime",
      "updatedAt": "datetime"
    }
  ],
  "meta": { }
}
```

**Sumber kode:** `modules/products/`

---

### GET /api/catalog/products/search

**Deskripsi:** Mencari produk dengan keyword.

**Autentikasi:** Tidak ada (public)

**Query Parameters:**
| Nama | Tipe | Wajib | Keterangan |
|------|------|-------|------------|
| q | string | Tidak | Keyword pencarian |
| page | int | Tidak | Halaman |
| limit | int | Tidak | Batas per halaman |
| shop_ids | []string | Tidak | Filter toko (multiple) |
| category_id | string | Tidak | Filter kategori |
| min_price | float | Tidak | Harga minimal |
| max_price | float | Tidak | Harga maksimal |
| min_rating | float | Tidak | Rating minimal |
| sort_by | string | Tidak | Field sorting |
| sort_order | string | Tidak | `asc` / `desc` |

**Response — Success (200)**
```json
{
  "data": [
    {
      "id": "string",
      "name": "string",
      "price": 0,
      "ratingAverage": 0,
      "imageUrls": ["string"]
    }
  ],
  "meta": { }
}
```

**Sumber kode:** `modules/products/`

---

### GET /api/catalog/products/:id

**Deskripsi:** Mendapatkan detail produk by ID.

**Autentikasi:** Tidak ada (public)

**Path Parameters:**
| Nama | Tipe | Wajib | Keterangan |
|------|------|-------|------------|
| id | string | Ya | ID produk (MongoDB ObjectId) |

**Response — Success (200)**
```json
{
  "data": {
    "id": "string",
    "shopId": "string",
    "categoryId": "string",
    "name": "string",
    "slug": "string",
    "description": "string",
    "sku": "string",
    "favoriteCount": 0,
    "reviewCount": 0,
    "ratingAverage": 0,
    "isActive": true,
    "price": 0,
    "currency": "string",
    "stock": 0,
    "imageUrls": ["string"],
    "categoryName": "string",
    "shopName": "string",
    "createdAt": "datetime",
    "updatedAt": "datetime"
  }
}
```

**Sumber kode:** `modules/products/`

---

### GET /api/catalog/products/slug/:slug

**Deskripsi:** Mendapatkan detail produk by slug.

**Autentikasi:** Tidak ada (public)

**Path Parameters:**
| Nama | Tipe | Wajib | Keterangan |
|------|------|-------|------------|
| slug | string | Ya | Slug produk |

**Response — Success (200)** — Sama seperti `GET /products/:id`

**Sumber kode:** `modules/products/`

---

### POST /api/catalog/products

**Deskripsi:** Membuat produk baru.

**Autentikasi:** Bearer JWT — SellerOnly

**Request Body:**
```json
{
  "shopId": "string — required",
  "categoryId": "string — required",
  "name": "string — required",
  "slug": "string — optional",
  "description": "string — optional",
  "sku": "string — required",
  "price": "number — required",
  "currency": "string — required",
  "stock": "integer — required",
  "imageUrls": ["string"] — optional",
  "isActive": "boolean — optional"
}
```

**Response — Success (201)**
```json
{
  "data": {
    "id": "string",
    "shopId": "string",
    "name": "string",
    "slug": "string",
    "createdAt": "datetime",
    "updatedAt": "datetime"
  }
}
```

**Sumber kode:** `modules/products/`, `middleware/jwt.go` (`JWTAuthMiddleware`, `SellerOnly`)

---

### PUT /api/catalog/products/:id

**Deskripsi:** Mengupdate produk.

**Autentikasi:** Bearer JWT — SellerOnly

**Path Parameters:**
| Nama | Tipe | Wajib | Keterangan |
|------|------|-------|------------|
| id | string | Ya | ID produk |

**Request Body:**
```json
{
  "name": "string — optional",
  "slug": "string — optional",
  "description": "string — optional",
  "sku": "string — optional",
  "price": "number — optional",
  "currency": "string — optional",
  "stock": "integer — optional",
  "imageUrls": ["string"] — optional",
  "categoryId": "string — optional",
  "isActive": "boolean — optional"
}
```

**Response — Success (200)**
```json
{
  "data": { }
}
```

**Sumber kode:** `modules/products/`

---

### PATCH /api/catalog/products/:id/toggle

**Deskripsi:** Mengaktifkan/menonaktifkan produk (toggle isActive).

**Autentikasi:** Bearer JWT — SellerOnly

**Path Parameters:**
| Nama | Tipe | Wajib | Keterangan |
|------|------|-------|------------|
| id | string | Ya | ID produk |

**Response — Success (200)**
```json
{
  "message": "Product toggled"
}
```

**Sumber kode:** `modules/products/`

---

### PATCH /api/catalog/products/bulk

**Deskripsi:** Update massal produk.

**Autentikasi:** Bearer JWT — SellerOnly

**Request Body:**
```json
{
  "productIds": ["string — required"],
  "updates": {
    "price": "number — optional",
    "stock": "integer — optional",
    "isActive": "boolean — optional",
    "categoryId": "string — optional"
  }
}
```

**Response — Success (200)**
```json
{
  "data": {
    "updatedCount": 0,
    "failedIds": ["string"],
    "errors": ["string"]
  }
}
```

**Sumber kode:** `modules/products/`

---

### DELETE /api/catalog/products/:id

**Deskripsi:** Menghapus produk.

**Autentikasi:** Bearer JWT — SellerOnly

**Path Parameters:**
| Nama | Tipe | Wajib | Keterangan |
|------|------|-------|------------|
| id | string | Ya | ID produk |

**Response — Success (200)**
```json
{
  "message": "Product deleted"
}
```

**Sumber kode:** `modules/products/`
