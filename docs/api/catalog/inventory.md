# Inventory API (Catalog Service)

Base path: `https://greenly-api.duckdns.org/api/catalog`

---

### GET /api/catalog/inventory/:productId

**Deskripsi:** Mendapatkan stok produk.

**Autentikasi:** Tidak ada (public)

**Path Parameters:**
| Nama | Tipe | Wajib | Keterangan |
|------|------|-------|------------|
| productId | string | Ya | ID produk |

**Response — Success (200)**
```json
{
  "data": {
    "id": "string",
    "productId": "string",
    "stock": 0,
    "reservedStock": 0,
    "availableStock": 0,
    "lowStockThreshold": 0,
    "isLowStock": false,
    "createdAt": "datetime (ISO 8601)",
    "updatedAt": "datetime (ISO 8601)"
  }
}
```

**Sumber kode:** `modules/inventory/`

---

### POST /api/catalog/inventory

**Deskripsi:** Membuat data inventory untuk produk.

**Autentikasi:** Bearer JWT — SellerOnly

**Request Body:**
```json
{
  "productId": "string — required",
  "stock": "integer — optional, >= 0",
  "lowStockThreshold": "integer — optional"
}
```

**Response — Success (201)**
```json
{
  "data": {
    "id": "string",
    "productId": "string",
    "stock": 0,
    "reservedStock": 0,
    "availableStock": 0,
    "lowStockThreshold": 0,
    "isLowStock": false,
    "createdAt": "datetime",
    "updatedAt": "datetime"
  }
}
```

**Sumber kode:** `modules/inventory/`

---

### PUT /api/catalog/inventory/:productId

**Deskripsi:** Mengupdate stok produk.

**Autentikasi:** Bearer JWT — SellerOnly

**Path Parameters:**
| Nama | Tipe | Wajib | Keterangan |
|------|------|-------|------------|
| productId | string | Ya | ID produk |

**Request Body:**
```json
{
  "stock": "integer — optional",
  "lowStockThreshold": "integer — optional"
}
```

**Response — Success (200)**
```json
{
  "data": { }
}
```

**Sumber kode:** `modules/inventory/`

---

### POST /api/catalog/inventory/:productId/reserve

**Deskripsi:** Mereserve stok (saat checkout). Menggunakan form-data.

**Autentikasi:** Bearer JWT

**Path Parameters:**
| Nama | Tipe | Wajib | Keterangan |
|------|------|-------|------------|
| productId | string | Ya | ID produk |

**Request Body:** `x-www-form-urlencoded`
| Field | Tipe | Wajib | Keterangan |
|-------|------|-------|------------|
| quantity | integer | Ya | Jumlah yang di-reserve (>0) |

**Response — Success (200)**
```json
{
  "message": "Stock reserved"
}
```

**Sumber kode:** `modules/inventory/`

---

### POST /api/catalog/inventory/:productId/release

**Deskripsi:** Melepas reserve stok. Menggunakan form-data.

**Autentikasi:** Bearer JWT

**Path Parameters:**
| Nama | Tipe | Wajib | Keterangan |
|------|------|-------|------------|
| productId | string | Ya | ID produk |

**Request Body:** `x-www-form-urlencoded`
| Field | Tipe | Wajib | Keterangan |
|-------|------|-------|------------|
| quantity | integer | Ya | Jumlah yang di-release (>0) |

**Response — Success (200)**
```json
{
  "message": "Stock released"
}
```

**Sumber kode:** `modules/inventory/`
