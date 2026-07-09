# Active Prices API (Catalog Service)

Base path: `https://greenly-api.duckdns.org/api/catalog`

Active price adalah harga final setelah diskon dihitung. Endpoint ini bersifat publik (read-only) dan untuk trigger komputasi ulang.

---

### GET /api/catalog/active-prices/:productId

**Deskripsi:** Mendapatkan harga aktif (final price setelah diskon) suatu produk.

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
    "finalPrice": 0,
    "updatedAt": "datetime (ISO 8601)"
  }
}
```

**Sumber kode:** `modules/active_price/`

---

### POST /api/catalog/active-prices/:productId/recalculate

**Deskripsi:** Menghitung ulang active price untuk satu produk.

**Autentikasi:** Tidak ada (public)

**Path Parameters:**
| Nama | Tipe | Wajib | Keterangan |
|------|------|-------|------------|
| productId | string | Ya | ID produk |

**Response — Success (200)**
```json
{
  "message": "Active price recalculated"
}
```

**Sumber kode:** `modules/active_price/`

---

### POST /api/catalog/active-prices/recalculate-all

**Deskripsi:** Menghitung ulang active price untuk semua produk.

**Autentikasi:** Tidak ada (public)

**Response — Success (200)**
```json
{
  "message": "All active prices recalculated"
}
```

**Sumber kode:** `modules/active_price/`
