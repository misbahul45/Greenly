# Shop Orders API (Internal)

Base path: `https://greenly-api.duckdns.org/api/core`

Path prefix dari `RouterModule`: `shops/:shopId/orders`

Semua endpoint dilindungi oleh `ShopMemberGuard` + `MinRole`.

---

### GET /api/core/shops/:shopId/orders

**Deskripsi:** Mendapatkan daftar pesanan toko.

**Autentikasi:** Bearer JWT — MinRole: STAFF

**Path Parameters:**
| Nama | Tipe | Wajib | Keterangan |
|------|------|-------|------------|
| shopId | string | Ya | ID toko |

**Query Parameters:**
| Nama | Tipe | Wajib | Default | Keterangan |
|------|------|-------|---------|------------|
| page | number | Tidak | 1 | Halaman |
| limit | number | Tidak | 10 | Maks 100 |
| status | enum | Tidak | - | `PENDING`, `PAID`, `PROCESSING`, `SHIPPED`, `COMPLETED`, `CANCELLED` |
| search | string | Tidak | - | Pencarian |
| createdFrom | date | Tidak | - | Filter tanggal awal |
| createdTo | date | Tidak | - | Filter tanggal akhir |
| sortBy | enum | Tidak | createdAt | `createdAt`, `totalAmount`, `status` |
| sortOrder | enum | Tidak | desc | `asc` / `desc` |

**Response — Success (200)**
```json
{
  "status": "success",
  "data": [],
  "metaData": {
    "page": 1,
    "limit": 10,
    "total": 0,
    "totalPages": 0
  }
}
```

**Sumber kode:** `src/modules/shops/order/order.controller.ts:27`, `src/modules/shops/order/order.dto.ts:38`

---

### GET /api/core/shops/:shopId/orders/:id

**Deskripsi:** Mendapatkan detail pesanan toko.

**Autentikasi:** Bearer JWT — MinRole: STAFF

**Path Parameters:**
| Nama | Tipe | Wajib | Keterangan |
|------|------|-------|------------|
| shopId | string | Ya | ID toko |
| id | string | Ya | ID pesanan |

**Response — Success (200)**
```json
{
  "status": "success",
  "data": { }
}
```

**Sumber kode:** `src/modules/shops/order/order.controller.ts:41`

---

### PATCH /api/core/shops/:shopId/orders/:id/status

**Deskripsi:** Mengupdate status pesanan toko.

**Autentikasi:** Bearer JWT — MinRole: ADMIN

**Path Parameters:**
| Nama | Tipe | Wajib | Keterangan |
|------|------|-------|------------|
| shopId | string | Ya | ID toko |
| id | string | Ya | ID pesanan |

**Request Body:**
```json
{
  "status": "PENDING|PAID|PROCESSING|SHIPPED|COMPLETED|CANCELLED — required"
}
```

**Response — Success (200)**
```json
{
  "status": "success",
  "data": { }
}
```

**Sumber kode:** `src/modules/shops/order/order.controller.ts:57`, `src/modules/shops/order/order.dto.ts:74`

---

### PATCH /api/core/shops/:shopId/orders/:id/refund/:refundId

**Deskripsi:** Mengupdate status refund pada pesanan.

**Autentikasi:** Bearer JWT — MinRole: OWNER

**Path Parameters:**
| Nama | Tipe | Wajib | Keterangan |
|------|------|-------|------------|
| shopId | string | Ya | ID toko |
| id | string | Ya | ID pesanan |
| refundId | string | Ya | ID refund |

**Response — Success (200)**
```json
{
  "status": "success",
  "data": { }
}
```

**Sumber kode:** `src/modules/shops/order/order.controller.ts:79`
