# Refunds API

Base path: `https://greenly-api.duckdns.org/api/core`

---

## Shop Owner Endpoints

### GET /api/core/shops/:shopId/finance/refunds

**Deskripsi:** Mendapatkan daftar refund toko (shop owner).

**Autentikasi:** Bearer JWT — Decorator: `@RequireFinanceAccess('SHOP_OWNER')`

**Path Parameters:**
| Nama | Tipe | Wajib | Keterangan |
|------|------|-------|------------|
| shopId | string | Ya | ID toko |

**Query Parameters:**
| Nama | Tipe | Wajib | Default | Keterangan |
|------|------|-------|---------|------------|
| status | enum | Tidak | - | `PENDING`, `APPROVED`, `REJECTED`, `COMPLETED` |
| page | number | Tidak | 1 | Halaman |
| limit | number | Tidak | 20 | Maks 100 |

**Response — Success (200)**
```json
{
  "status": "success",
  "data": [
    {
      "id": "string",
      "paymentId": "string",
      "amount": 0,
      "reason": "string",
      "status": "PENDING|APPROVED|REJECTED|COMPLETED",
      "createdAt": "datetime"
    }
  ]
}
```

**Sumber kode:** `src/modules/finance/refund/refund.controller.ts:21`, `src/modules/finance/refund/refund.dto.ts:3`

---

### POST /api/core/shops/:shopId/finance/refunds

**Deskripsi:** Mengajukan refund oleh toko.

**Autentikasi:** Bearer JWT — Decorator: `@RequireFinanceAccess('SHOP_OWNER')`

**Path Parameters:**
| Nama | Tipe | Wajib | Keterangan |
|------|------|-------|------------|
| shopId | string | Ya | ID toko |

**Request Body:**
```json
{
  "paymentId": "string (UUID) — required",
  "amount": "number — required, positif",
  "reason": "string — required, min 5"
}
```

**Response — Success (201)**
```json
{
  "status": "success",
  "data": { }
}
```

**Sumber kode:** `src/modules/finance/refund/refund.controller.ts:29`, `src/modules/finance/refund/refund.dto.ts:10`

---

## Admin Endpoints

### GET /api/core/admin/finance/refunds

**Deskripsi:** Mendapatkan daftar semua refund (admin).

**Autentikasi:** Bearer JWT — Decorator: `@RequireFinanceAccess('PLATFORM_ADMIN')`

**Query Parameters:** Sama seperti shop refunds

**Response — Success (200)** — Sama seperti shop refunds

**Sumber kode:** `src/modules/finance/refund/refund.controller.ts:40`

---

### POST /api/core/admin/finance/refunds

**Deskripsi:** Membuat refund dari sisi admin.

**Autentikasi:** Bearer JWT — Decorator: `@RequireFinanceAccess('PLATFORM_ADMIN')`

**Request Body:**
```json
{
  "paymentId": "string (UUID) — required",
  "amount": "number — required, positif",
  "reason": "string — required, min 5"
}
```

**Response — Success (201)**
```json
{
  "status": "success",
  "data": { }
}
```

**Sumber kode:** `src/modules/finance/refund/refund.controller.ts:47`, `src/modules/finance/refund/refund.dto.ts:10`

---

### PATCH /api/core/admin/finance/refunds/:id/approve

**Deskripsi:** Menyetujui refund (admin).

**Autentikasi:** Bearer JWT — Decorator: `@RequireFinanceAccess('PLATFORM_ADMIN')`

**Path Parameters:**
| Nama | Tipe | Wajib | Keterangan |
|------|------|-------|------------|
| id | string | Ya | ID refund |

**Request Body:**
```json
{
  "notes": "string — optional"
}
```

**Response — Success (200)**
```json
{
  "status": "success",
  "data": { }
}
```

**Sumber kode:** `src/modules/finance/refund/refund.controller.ts:56`, `src/modules/finance/refund/refund.dto.ts:17`

---

### PATCH /api/core/admin/finance/refunds/:id/reject

**Deskripsi:** Menolak refund (admin). Menggunakan schema yang sama seperti approve.

**Autentikasi:** Bearer JWT — Decorator: `@RequireFinanceAccess('PLATFORM_ADMIN')`

**Path Parameters:**
| Nama | Tipe | Wajib | Keterangan |
|------|------|-------|------------|
| id | string | Ya | ID refund |

**Request Body:**
```json
{
  "notes": "string — optional"
}
```

**Response — Success (200)**
```json
{
  "status": "success",
  "data": { }
}
```

**Sumber kode:** `src/modules/finance/refund/refund.controller.ts:65`, `src/modules/finance/refund/refund.dto.ts:17`

---

### POST /api/core/admin/finance/refunds/:id/force-approve

**Deskripsi:** Memaksa approve refund (admin bypass).

**Autentikasi:** Bearer JWT — Decorator: `@RequireFinanceAccess('PLATFORM_ADMIN')`

**Path Parameters:**
| Nama | Tipe | Wajib | Keterangan |
|------|------|-------|------------|
| id | string | Ya | ID refund |

**Request Body:**
```json
{
  "reason": "string — required, min 5"
}
```

**Response — Success (200)**
```json
{
  "status": "success",
  "data": { }
}
```

**Sumber kode:** `src/modules/finance/refund/refund.controller.ts:74`, `src/modules/finance/refund/refund.dto.ts:22`
