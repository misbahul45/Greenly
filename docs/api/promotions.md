# Promotions API

Base path: `https://greenly-api.duckdns.org/api/core`

Terdapat dua controller:
- `PromotionAdminController` — path prefix `/admin/promotions`
- `PromotionPublicController` — path prefix `/promotions`

---

## Admin Endpoints

### GET /api/core/admin/promotions

**Deskripsi:** Mendapatkan daftar promosi.

**Autentikasi:** Bearer JWT — Guard: `JwtAccessGuard` + `PromotionAdminGuard` (memerlukan role `PLATFORM_ADMIN`)

**Query Parameters:**
| Nama | Tipe | Wajib | Default | Keterangan |
|------|------|-------|---------|------------|
| shopId | string | Tidak | - | Filter toko |
| type | enum | Tidak | - | `PERCENTAGE` / `FIXED` |
| isActive | boolean | Tidak | - | Filter status aktif |
| startDateFrom | datetime | Tidak | - | Filte tanggal mulai |
| startDateTo | datetime | Tidak | - | Filter tanggal mulai |
| limit | number | Tidak | 20 | Maks 20 |
| offset | number | Tidak | 0 | Offset |
| sortBy | enum | Tidak | createdAt | `createdAt`, `startDate`, `discountVal` |
| order | enum | Tidak | desc | `asc` / `desc` |

**Response — Success (200)**
```json
{
  "status": "success",
  "message": "success",
  "data": [
    {
      "id": "string",
      "code": "string",
      "name": "string",
      "description": "string|null",
      "discountVal": 0,
      "type": "PERCENTAGE|FIXED",
      "minPurchaseAmount": 0,
      "maxDiscountAmount": 0,
      "usageLimit": 0,
      "userLimit": 0,
      "startDate": "datetime",
      "endDate": "datetime",
      "isActive": true,
      "createdAt": "datetime",
      "updatedAt": "datetime"
    }
  ],
  "meta": {
    "total": 0,
    "limit": 20,
    "offset": 0
  }
}
```

**Sumber kode:** `src/modules/promotion/promotion.controller.ts:37`, `src/modules/promotion/promotion.dto.ts:43`

---

### POST /api/core/admin/promotions

**Deskripsi:** Membuat promosi baru.

**Autentikasi:** Bearer JWT — Guard: `JwtAccessGuard` + `PromotionAdminGuard`

**Request Body:**
```json
{
  "code": "string — required, akan di-UPPERCASE",
  "name": "string — required",
  "description": "string — optional",
  "discountVal": "number — required, min 0",
  "type": "PERCENTAGE|FIXED — required",
  "minPurchaseAmount": "number — optional, min 0",
  "maxDiscountAmount": "number — optional, min 0",
  "usageLimit": "number — optional, integer, min 1",
  "userLimit": "number — optional, integer, min 1",
  "startDate": "datetime (ISO 8601) — required",
  "endDate": "datetime (ISO 8601) — required",
  "isActive": "boolean — optional, default true",
  "applicableShopIds": ["string"] — optional",
  "applicableProductIds": ["string"] — optional"
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

**Sumber kode:** `src/modules/promotion/promotion.controller.ts:31`, `src/modules/promotion/promotion.dto.ts:10`

---

### GET /api/core/admin/promotions/:id

**Deskripsi:** Mendapatkan detail promosi.

**Autentikasi:** Bearer JWT — Guard: `JwtAccessGuard` + `PromotionAdminGuard`

**Path Parameters:**
| Nama | Tipe | Wajib | Keterangan |
|------|------|-------|------------|
| id | string | Ya | ID promosi |

**Response — Success (200)**
```json
{
  "status": "success",
  "message": "success",
  "data": {
    "id": "string",
    "code": "string",
    "name": "string",
    "type": "PERCENTAGE|FIXED",
    "discountVal": 0,
    "startDate": "datetime",
    "endDate": "datetime",
    "isActive": true
  }
}
```

**Sumber kode:** `src/modules/promotion/promotion.controller.ts:42`

---

### PATCH /api/core/admin/promotions/:id

**Deskripsi:** Mengupdate promosi.

**Autentikasi:** Bearer JWT — Guard: `JwtAccessGuard` + `PromotionAdminGuard`

**Path Parameters:**
| Nama | Tipe | Wajib | Keterangan |
|------|------|-------|------------|
| id | string | Ya | ID promosi |

**Request Body:** (semua field optional — partial dari CreatePromotionSchema)
```json
{
  "code": "string — optional",
  "name": "string — optional",
  "discountVal": "number — optional",
  "type": "PERCENTAGE|FIXED — optional",
  "startDate": "datetime — optional",
  "endDate": "datetime — optional",
  "isActive": "boolean — optional"
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

**Sumber kode:** `src/modules/promotion/promotion.controller.ts:47`, `src/modules/promotion/promotion.dto.ts:27`

---

### DELETE /api/core/admin/promotions/:id

**Deskripsi:** Soft-delete promosi.

**Autentikasi:** Bearer JWT — Guard: `JwtAccessGuard` + `PromotionAdminGuard`

**Path Parameters:**
| Nama | Tipe | Wajib | Keterangan |
|------|------|-------|------------|
| id | string | Ya | ID promosi |

**Response — Success (200)**
```json
{
  "status": "success",
  "message": "success",
  "data": null
}
```

**Sumber kode:** `src/modules/promotion/promotion.controller.ts:55`

---

## Public Endpoints

### POST /api/core/promotions/validate

**Deskripsi:** Validasi kode promo sebelum digunakan.

**Autentikasi:** Bearer JWT

**Request Body:**
```json
{
  "code": "string — required",
  "shopId": "string — optional",
  "cartTotal": "number — required, min 0",
  "items": [
    {
      "productId": "string",
      "quantity": "number (integer, min 1)",
      "price": "number (min 0)"
    }
  ] — optional
}
```

**Response — Success (200)**
```json
{
  "status": "success",
  "message": "success",
  "data": {
    "valid": true,
    "discountAmount": 0,
    "finalAmount": 0
  }
}
```

**Sumber kode:** `src/modules/promotion/promotion.controller.ts:65`, `src/modules/promotion/promotion.dto.ts:29`

---

### GET /api/core/promotions/active?shopId=xxx

**Deskripsi:** Mendapatkan daftar promosi yang aktif (publik).

**Autentikasi:** Tidak ada (public)

**Query Parameters:**
| Nama | Tipe | Wajib | Keterangan |
|------|------|-------|------------|
| shopId | string | Tidak | Filter toko |

**Response — Success (200)**
```json
{
  "status": "success",
  "message": "success",
  "data": [
    {
      "id": "string",
      "code": "string",
      "name": "string",
      "discountVal": 0,
      "type": "PERCENTAGE|FIXED",
      "endDate": "datetime"
    }
  ]
}
```

**Sumber kode:** `src/modules/promotion/promotion.controller.ts:72`
