# Product Discounts API (Catalog Service)

Base path: `https://greenly-api.duckdns.org/api/catalog`

---

### GET /api/catalog/discounts/:productId

**Deskripsi:** Mendapatkan diskon yang aktif untuk suatu produk.

**Autentikasi:** Tidak ada (public)

**Path Parameters:**
| Nama | Tipe | Wajib | Keterangan |
|------|------|-------|------------|
| productId | string | Ya | ID produk |

**Response — Success (200)**
```json
{
  "data": [
    {
      "id": "string",
      "productId": "string",
      "name": "string",
      "percentage": 0,
      "fixedAmount": 0,
      "validFrom": "datetime (ISO 8601)",
      "validTo": "datetime (ISO 8601)",
      "isActive": true,
      "createdAt": "datetime",
      "updatedAt": "datetime"
    }
  ]
}
```

**Sumber kode:** `modules/product_discount/`

---

### POST /api/catalog/discounts

**Deskripsi:** Membuat diskon baru untuk produk.

**Autentikasi:** Bearer JWT — SellerOnly

**Request Body:**
```json
{
  "productId": "string — required",
  "name": "string — required",
  "percentage": "number — optional",
  "fixedAmount": "number — optional",
  "validFrom": "datetime (ISO 8601) — required",
  "validTo": "datetime (ISO 8601) — required"
}
```

**Response — Success (201)**
```json
{
  "data": {
    "id": "string",
    "productId": "string",
    "name": "string",
    "percentage": 0,
    "fixedAmount": 0,
    "validFrom": "datetime",
    "validTo": "datetime",
    "isActive": true,
    "createdAt": "datetime",
    "updatedAt": "datetime"
  }
}
```

**Sumber kode:** `modules/product_discount/`

---

### PUT /api/catalog/discounts/:id

**Deskripsi:** Mengupdate diskon.

**Autentikasi:** Bearer JWT — SellerOnly

**Path Parameters:**
| Nama | Tipe | Wajib | Keterangan |
|------|------|-------|------------|
| id | string | Ya | ID diskon |

**Request Body:**
```json
{
  "name": "string — optional",
  "percentage": "number — optional",
  "fixedAmount": "number — optional",
  "validFrom": "datetime — optional",
  "validTo": "datetime — optional",
  "isActive": "boolean — optional"
}
```

**Response — Success (200)**
```json
{
  "data": { }
}
```

**Sumber kode:** `modules/product_discount/`

---

### DELETE /api/catalog/discounts/:id

**Deskripsi:** Menghapus diskon.

**Autentikasi:** Bearer JWT — SellerOnly

**Path Parameters:**
| Nama | Tipe | Wajib | Keterangan |
|------|------|-------|------------|
| id | string | Ya | ID diskon |

**Response — Success (200)**
```json
{
  "message": "Discount deleted"
}
```

**Sumber kode:** `modules/product_discount/`
