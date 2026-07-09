# Payouts API

Base path: `https://greenly-api.duckdns.org/api/core`

---

## Shop Owner Endpoints

### GET /api/core/shops/:shopId/finance/payouts

**Deskripsi:** Mendapatkan daftar pencairan dana toko.

**Autentikasi:** Bearer JWT — Decorator: `@RequireFinanceAccess('SHOP_OWNER', 'PLATFORM_ADMIN')`

**Path Parameters:**
| Nama | Tipe | Wajib | Keterangan |
|------|------|-------|------------|
| shopId | string | Ya | ID toko |

**Query Parameters:**
| Nama | Tipe | Wajib | Default | Keterangan |
|------|------|-------|---------|------------|
| status | enum | Tidak | - | `PENDING`, `PROCESSING`, `COMPLETED`, `FAILED` |
| page | number | Tidak | 1 | Halaman |
| limit | number | Tidak | 20 | Maks 100 |

**Response — Success (200)**
```json
{
  "status": "success",
  "data": [
    {
      "id": "string",
      "shopId": "string",
      "amount": 0,
      "status": "PENDING|PROCESSING|COMPLETED|FAILED",
      "createdAt": "datetime",
      "paidAt": "datetime|null"
    }
  ]
}
```

**Sumber kode:** `src/modules/finance/payout/payout.controller.ts:26`, `src/modules/finance/payout/payout.dto.ts:22`

---

### POST /api/core/shops/:shopId/finance/payouts/request

**Deskripsi:** Mengajukan pencairan dana.

**Autentikasi:** Bearer JWT — Decorator: `@RequireFinanceAccess('SHOP_OWNER')`

**Path Parameters:**
| Nama | Tipe | Wajib | Keterangan |
|------|------|-------|------------|
| shopId | string | Ya | ID toko |

**Request Body:**
```json
{
  "amount": "number — required, positif",
  "idempotencyKey": "string — optional"
}
```

**Response — Success (201)**
```json
{
  "status": "success",
  "data": {
    "id": "string",
    "shopId": "string",
    "amount": 0,
    "status": "PENDING",
    "createdAt": "datetime"
  }
}
```

**Sumber kode:** `src/modules/finance/payout/payout.controller.ts:35`, `src/modules/finance/payout/payout.dto.ts:3`

---

## Admin Endpoints

### PATCH /api/core/admin/finance/payouts/:id/approve

**Deskripsi:** Menyetujui pencairan dana (admin).

**Autentikasi:** Bearer JWT — Decorator: `@RequireFinanceAccess('PLATFORM_ADMIN')`

**Path Parameters:**
| Nama | Tipe | Wajib | Keterangan |
|------|------|-------|------------|
| id | string | Ya | ID payout |

**Request Body:**
```json
{
  "bankReceiptUrl": "string (URL) — optional"
}
```

**Response — Success (200)**
```json
{
  "status": "success",
  "data": { }
}
```

**Sumber kode:** `src/modules/finance/payout/payout.controller.ts:49`, `src/modules/finance/payout/payout.dto.ts:10`

---

### PATCH /api/core/admin/finance/payouts/:id/reject

**Deskripsi:** Menolak pencairan dana (admin).

**Autentikasi:** Bearer JWT — Decorator: `@RequireFinanceAccess('PLATFORM_ADMIN')`

**Path Parameters:**
| Nama | Tipe | Wajib | Keterangan |
|------|------|-------|------------|
| id | string | Ya | ID payout |

**Request Body:**
```json
{
  "reason": "string — required, min 5 karakter"
}
```

**Response — Success (200)**
```json
{
  "status": "success",
  "data": { }
}
```

**Sumber kode:** `src/modules/finance/payout/payout.controller.ts:58`, `src/modules/finance/payout/payout.dto.ts:16`
