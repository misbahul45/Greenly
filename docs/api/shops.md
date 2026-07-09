# Shops API

Base path: `https://greenly-api.duckdns.org/api/core`

---

### GET /api/core/shops

**Deskripsi:** Mendapatkan daftar toko (publik).

**Autentikasi:** Bearer JWT

**Query Parameters:**
| Nama | Tipe | Wajib | Default | Keterangan |
|------|------|-------|---------|------------|
| page | number | Tidak | 1 | Halaman |
| limit | number | Tidak | 10 | Maks 100 |
| search | string | Tidak | - | Pencarian nama toko |
| status | enum | Tidak | - | `PENDING`, `APPROVED`, `REJECTED`, `SUSPENDED` |
| ownerId | string | Tidak | - | Filter owner |
| createdFrom | date | Tidak | - | Filter tanggal awal |
| createdTo | date | Tidak | - | Filter tanggal akhir |
| sortBy | enum | Tidak | createdAt | `createdAt`, `updatedAt`, `name`, `status` |
| sortOrder | enum | Tidak | desc | `asc` / `desc` |

**Response — Success (200)**
```json
{
  "status": "success",
  "statusCode": 200,
  "message": "success",
  "data": [
    {
      "id": "string",
      "ownerId": "string",
      "name": "string",
      "description": "string|null",
      "status": "PENDING|APPROVED|REJECTED|SUSPENDED",
      "balance": 0,
      "followerCount": 0,
      "createdAt": "datetime",
      "updatedAt": "datetime"
    }
  ],
  "metaData": {
    "page": 1,
    "limit": 10,
    "total": 0,
    "totalPages": 0
  }
}
```

**Sumber kode:** `src/modules/shops/shops.controller.ts:32`, `src/modules/shops/shops.dto.ts:21`

---

### POST /api/core/shops

**Deskripsi:** Membuat toko baru.

**Autentikasi:** Bearer JWT

**Request Body:**
```json
{
  "name": "string — required, min 3, max 100, trim",
  "description": "string — optional, max 500, trim (akan jadi null jika empty string)"
}
```

**Response — Success (201)**
```json
{
  "status": "success",
  "statusCode": 201,
  "message": "success",
  "data": {
    "id": "string",
    "ownerId": "string",
    "name": "string",
    "description": "string|null",
    "status": "PENDING",
    "balance": 0,
    "followerCount": 0,
    "createdAt": "datetime",
    "updatedAt": "datetime"
  }
}
```

**Sumber kode:** `src/modules/shops/shops.controller.ts:42`, `src/modules/shops/shops.dto.ts:40`

---

### GET /api/core/shops/me

**Deskripsi:** Mendapatkan toko milik user yang sedang login.

**Autentikasi:** Bearer JWT

**Query Parameters:** Sama seperti `GET /shops`

**Response — Success (200)**
```json
{
  "status": "success",
  "statusCode": 200,
  "message": "success",
  "data": [
    {
      "id": "string",
      "ownerId": "string",
      "name": "string",
      "status": "PENDING|APPROVED|REJECTED|SUSPENDED",
      "description": "string|null",
      "followerCount": 0,
      "createdAt": "datetime",
      "updatedAt": "datetime"
    }
  ]
}
```

**Sumber kode:** `src/modules/shops/shops.controller.ts:54`

---

### GET /api/core/shops/:id

**Deskripsi:** Mendapatkan detail toko berdasarkan ID.

**Autentikasi:** Bearer JWT

**Path Parameters:**
| Nama | Tipe | Wajib | Keterangan |
|------|------|-------|------------|
| id | string | Ya | ID toko |

**Response — Success (200)**
```json
{
  "status": "success",
  "data": {
    "id": "string",
    "ownerId": "string",
    "name": "string",
    "description": "string|null",
    "status": "PENDING|APPROVED|REJECTED|SUSPENDED",
    "balance": 0,
    "followerCount": 0,
    "createdAt": "datetime",
    "updatedAt": "datetime"
  }
}
```

**Sumber kode:** `src/modules/shops/shops.controller.ts:65`, `src/modules/shops/shops.dto.ts:3`

---

### PATCH /api/core/shops/:id

**Deskripsi:** Memperbarui toko (hanya owner).

**Autentikasi:** Bearer JWT

**Path Parameters:**
| Nama | Tipe | Wajib | Keterangan |
|------|------|-------|------------|
| id | string | Ya | ID toko |

**Request Body:**
```json
{
  "name": "string — optional, min 3, max 100, trim",
  "description": "string — optional, max 500, trim"
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

**Sumber kode:** `src/modules/shops/shops.controller.ts:75`, `src/modules/shops/shops.dto.ts:52`

---

### DELETE /api/core/shops/:id

**Deskripsi:** Menghapus toko (hanya owner).

**Autentikasi:** Bearer JWT

**Path Parameters:**
| Nama | Tipe | Wajib | Keterangan |
|------|------|-------|------------|
| id | string | Ya | ID toko |

**Response — Success (200)**
```json
{
  "status": "success",
  "message": "success",
  "data": null
}
```

**Sumber kode:** `src/modules/shops/shops.controller.ts:88`
