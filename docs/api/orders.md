# Orders API

Base path: `https://greenly-api.duckdns.org/api/core`

---

### GET /api/core/orders

**Deskripsi:** Mendapatkan daftar pesanan user yang sedang login.

**Autentikasi:** Bearer JWT

**Query Parameters:**
| Nama | Tipe | Wajib | Default | Keterangan |
|------|------|-------|---------|------------|
| page | number | Tidak | 1 | Halaman |
| limit | number | Tidak | 20 | Maks 100 |
| status | enum | Tidak | - | `PENDING`, `PAID`, `PROCESSING`, `SHIPPED`, `COMPLETED`, `CANCELLED` |
| shopId | string | Tidak | - | Filter toko |

**Response — Success (200)**
```json
{
  "status": "success",
  "message": "success",
  "data": [
    {
      "id": "string",
      "userId": "string",
      "shopId": "string",
      "shopName": "string",
      "totalAmount": 0,
      "status": "PENDING|PAID|PROCESSING|SHIPPED|COMPLETED|CANCELLED",
      "promotionId": "string|null",
      "discountAmount": 0,
      "createdAt": "datetime",
      "items": [
        {
          "id": "string",
          "productId": "string",
          "productName": "string",
          "price": 0,
          "quantity": 0
        }
      ],
      "payment": {
        "id": "string",
        "status": "PENDING|SUCCESS|FAILED|EXPIRED",
        "method": "string",
        "grossAmount": 0
      }
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

**Sumber kode:** `src/modules/commerce/order/order.controller.ts:32`, `src/modules/commerce/order/dto/order.dto.ts:3`

---

### GET /api/core/orders/shop/:shopId

**Deskripsi:** Mendapatkan daftar pesanan milik toko tertentu (seller).

**Autentikasi:** Bearer JWT — Role: SELLER

**Path Parameters:**
| Nama | Tipe | Wajib | Keterangan |
|------|------|-------|------------|
| shopId | string | Ya | ID toko |

**Query Parameters:** Sama seperti `GET /orders`

**Response — Success (200)** — Sama seperti `GET /orders`

**Sumber kode:** `src/modules/commerce/order/order.controller.ts:40`

---

### GET /api/core/orders/:orderId

**Deskripsi:** Mendapatkan detail pesanan.

**Autentikasi:** Bearer JWT

**Path Parameters:**
| Nama | Tipe | Wajib | Keterangan |
|------|------|-------|------------|
| orderId | string | Ya | ID pesanan |

**Response — Success (200)**
```json
{
  "status": "success",
  "message": "success",
  "data": {
    "id": "string",
    "userId": "string",
    "shopId": "string",
    "shopName": "string",
    "totalAmount": 0,
    "status": "string",
    "items": [],
    "payment": {}
  }
}
```

**Sumber kode:** `src/modules/commerce/order/order.controller.ts:49`

---

### PATCH /api/core/orders/:orderId/status

**Deskripsi:** Mengupdate status pesanan (seller).

**Autentikasi:** Bearer JWT — Role: SELLER

**Path Parameters:**
| Nama | Tipe | Wajib | Keterangan |
|------|------|-------|------------|
| orderId | string | Ya | ID pesanan |

**Request Body:**
```json
{
  "status": "PROCESSING|SHIPPED|COMPLETED|CANCELLED — required"
}
```

**Response — Success (200)**
```json
{
  "status": "success",
  "message": "success",
  "data": { }
}
```

**Sumber kode:** `src/modules/commerce/order/order.controller.ts:56`, `src/modules/commerce/order/dto/order.dto.ts:18`

---

### POST /api/core/orders/payment-callback

**Deskripsi:** Callback dari payment gateway. Endpoint publik (tanpa guard role).

**Autentikasi:** Bearer JWT

**Request Body:**
```json
{
  "orderId": "string — required",
  "transactionId": "string — required",
  "status": "SUCCESS|FAILED|EXPIRED — required",
  "grossAmount": "string — required",
  "method": "string — required",
  "paidAt": "string (datetime) — optional"
}
```

**Response — Success (200)**
```json
{
  "status": "success",
  "message": "success",
  "data": { }
}
```

**Sumber kode:** `src/modules/commerce/order/order.controller.ts:67`, `src/modules/commerce/order/dto/order.dto.ts:24`

---

### POST /api/core/orders/refund

**Deskripsi:** Membuat refund untuk pesanan (admin).

**Autentikasi:** Bearer JWT — Role: ADMIN

**Request Body:**
```json
{
  "paymentId": "string — required",
  "amount": "string — required (decimal)",
  "reason": "string — required"
}
```

**Response — Success (201)**
```json
{
  "status": "success",
  "message": "success",
  "data": { }
}
```

**Sumber kode:** `src/modules/commerce/order/order.controller.ts:74`, `src/modules/commerce/order/dto/order.dto.ts:35`
