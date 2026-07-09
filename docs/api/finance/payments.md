# Payments API (Admin)

Base path: `https://greenly-api.duckdns.org/api/core`

---

### GET /api/core/admin/finance/payments

**Deskripsi:** Mendapatkan daftar pembayaran (admin).

**Autentikasi:** Bearer JWT — Decorator: `@RequireFinanceAccess('PLATFORM_ADMIN')`

**Query Parameters:**
| Nama | Tipe | Wajib | Default | Keterangan |
|------|------|-------|---------|------------|
| status | enum | Tidak | - | `PENDING`, `SUCCESS`, `FAILED`, `EXPIRED` |
| page | number | Tidak | 1 | Halaman |
| limit | number | Tidak | 20 | Maks 100 |

**Response — Success (200)**
```json
{
  "status": "success",
  "statusCode": 200,
  "message": "success",
  "data": [
    {
      "id": "string",
      "orderId": "string",
      "grossAmount": 0,
      "gatewayFee": 0,
      "marketplaceFee": 0,
      "netAmount": 0,
      "method": "string",
      "status": "PENDING|SUCCESS|FAILED|EXPIRED",
      "transactionId": "string|null",
      "createdAt": "datetime",
      "paidAt": "datetime|null",
      "updatedAt": "datetime"
    }
  ],
  "metaData": {
    "page": 1,
    "limit": 20,
    "total": 0,
    "totalPages": 0
  }
}
```

**Sumber kode:** `src/modules/finance/payment/payment.controller.ts:17`, `src/modules/finance/payment/payment.dto.ts:3`

---

### PATCH /api/core/admin/finance/payments/:id/status

**Deskripsi:** Mengupdate status pembayaran (admin).

**Autentikasi:** Bearer JWT — Decorator: `@RequireFinanceAccess('PLATFORM_ADMIN')`

**Path Parameters:**
| Nama | Tipe | Wajib | Keterangan |
|------|------|-------|------------|
| id | string | Ya | ID pembayaran |

**Request Body:**
```json
{
  "status": "PENDING|SUCCESS|FAILED|EXPIRED — required",
  "transactionId": "string — optional"
}
```

**Response — Success (200)**
```json
{
  "status": "success",
  "statusCode": 200,
  "message": "success",
  "data": { }
}
```

**Sumber kode:** `src/modules/finance/payment/payment.controller.ts:25`, `src/modules/finance/payment/payment.dto.ts:11`
