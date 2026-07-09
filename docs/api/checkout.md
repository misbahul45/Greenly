# Checkout API

Base path: `https://greenly-api.duckdns.org/api/core`

---

### POST /api/core/checkout

**Deskripsi:** Melakukan checkout (membuat pesanan dari item keranjang).

**Autentikasi:** Bearer JWT

**Request Body:**
```json
{
  "shopId": "string — required",
  "shopName": "string — required",
  "itemIds": ["string — required, min 1 item"],
  "paymentMethod": "string — required",
  "promoCode": "string — optional"
}
```

**Response — Success (201)**
```json
{
  "status": "success",
  "message": "success",
  "data": {
    "orderId": "string",
    "status": "PENDING",
    "totalAmount": 0
  }
}
```

**Sumber kode:** `src/modules/commerce/checkout/checkout.controller.ts:12`, `src/modules/commerce/checkout/checkout.dto.ts:3`
