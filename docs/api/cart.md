# Cart API

Base path: `https://greenly-api.duckdns.org/api/core`

---

### GET /api/core/cart

**Deskripsi:** Mendapatkan keranjang user saat ini.

**Autentikasi:** Bearer JWT

**Response — Success (200)**
```json
{
  "status": "success",
  "message": "success",
  "data": {
    "id": "string",
    "userId": "string",
    "items": [
      {
        "id": "string",
        "productId": "string",
        "quantity": 0,
        "createdAt": "datetime"
      }
    ],
    "updatedAt": "datetime"
  }
}
```

**Sumber kode:** `src/modules/commerce/cart/cart.controller.ts:27`

---

### POST /api/core/cart/items

**Deskripsi:** Menambahkan item ke keranjang.

**Autentikasi:** Bearer JWT

**Request Body:**
```json
{
  "productId": "string — required, min 1",
  "quantity": "number — required, integer, positif"
}
```

**Response — Success (201)**
```json
{
  "status": "success",
  "message": "success",
  "data": {
    "id": "string",
    "cartId": "string",
    "productId": "string",
    "quantity": 0,
    "createdAt": "datetime"
  }
}
```

**Sumber kode:** `src/modules/commerce/cart/cart.controller.ts:32`, `src/modules/commerce/cart/cart.dto.ts:3`

---

### PUT /api/core/cart/items/:productId

**Deskripsi:** Mengupdate quantity item di keranjang.

**Autentikasi:** Bearer JWT

**Path Parameters:**
| Nama | Tipe | Wajib | Keterangan |
|------|------|-------|------------|
| productId | string | Ya | ID produk |

**Request Body:**
```json
{
  "quantity": "number — required, integer, positif"
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

**Sumber kode:** `src/modules/commerce/cart/cart.controller.ts:40`, `src/modules/commerce/cart/cart.dto.ts:10`

---

### DELETE /api/core/cart/items/:productId

**Deskripsi:** Menghapus item dari keranjang.

**Autentikasi:** Bearer JWT

**Path Parameters:**
| Nama | Tipe | Wajib | Keterangan |
|------|------|-------|------------|
| productId | string | Ya | ID produk |

**Response — Success (200)**
```json
{
  "status": "success",
  "message": "success",
  "data": null
}
```

**Sumber kode:** `src/modules/commerce/cart/cart.controller.ts:51`

---

### DELETE /api/core/cart

**Deskripsi:** Mengosongkan keranjang.

**Autentikasi:** Bearer JWT

**Response — Success (200)**
```json
{
  "status": "success",
  "message": "success",
  "data": null
}
```

**Sumber kode:** `src/modules/commerce/cart/cart.controller.ts:61`
