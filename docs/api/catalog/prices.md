# Prices API (Catalog Service)

Base path: `https://greenly-api.duckdns.org/api/catalog`

---

### GET /api/catalog/prices/:productId

**Deskripsi:** Mendapatkan harga produk.

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
    "amount": 0,
    "currency": "string",
    "createdAt": "datetime (ISO 8601)",
    "updatedAt": "datetime (ISO 8601)"
  }
}
```

**Sumber kode:** `modules/price/`

---

### POST /api/catalog/prices

**Deskripsi:** Membuat harga produk.

**Autentikasi:** Bearer JWT — SellerOnly

**Request Body:**
```json
{
  "productId": "string — required",
  "amount": "number — required, >= 0",
  "currency": "string — optional"
}
```

**Response — Success (201)**
```json
{
  "data": {
    "id": "string",
    "productId": "string",
    "amount": 0,
    "currency": "string",
    "createdAt": "datetime",
    "updatedAt": "datetime"
  }
}
```

**Sumber kode:** `modules/price/`

---

### PUT /api/catalog/prices/:productId

**Deskripsi:** Mengupdate harga produk.

**Autentikasi:** Bearer JWT — SellerOnly

**Path Parameters:**
| Nama | Tipe | Wajib | Keterangan |
|------|------|-------|------------|
| productId | string | Ya | ID produk |

**Request Body:**
```json
{
  "amount": "number — optional, >= 0",
  "currency": "string — optional"
}
```

**Response — Success (200)**
```json
{
  "data": { }
}
```

**Sumber kode:** `modules/price/`
