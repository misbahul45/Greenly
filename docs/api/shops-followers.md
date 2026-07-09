# Shop Followers API

Base path: `https://greenly-api.duckdns.org/api/core`

Path prefix dari `RouterModule`: `shops/:shopId`

---

### POST /api/core/shops/:shopId/follow

**Deskripsi:** Mengikuti toko.

**Autentikasi:** Bearer JWT

**Path Parameters:**
| Nama | Tipe | Wajib | Keterangan |
|------|------|-------|------------|
| shopId | string | Ya | ID toko |

**Response — Success (201)**
```json
{
  "status": "success",
  "message": "success",
  "data": null
}
```

**Sumber kode:** `src/modules/shops/follower/follower.controller.ts:26`

---

### DELETE /api/core/shops/:shopId/follow

**Deskripsi:** Berhenti mengikuti toko.

**Autentikasi:** Bearer JWT

**Path Parameters:**
| Nama | Tipe | Wajib | Keterangan |
|------|------|-------|------------|
| shopId | string | Ya | ID toko |

**Response — Success (200)**
```json
{
  "status": "success",
  "message": "success",
  "data": null
}
```

**Sumber kode:** `src/modules/shops/follower/follower.controller.ts:37`

---

### GET /api/core/shops/:shopId/followers

**Deskripsi:** Mendapatkan daftar follower toko.

**Autentikasi:** Bearer JWT

**Path Parameters:**
| Nama | Tipe | Wajib | Keterangan |
|------|------|-------|------------|
| shopId | string | Ya | ID toko |

**Query Parameters:**
| Nama | Tipe | Wajib | Default | Keterangan |
|------|------|-------|---------|------------|
| page | number | Tidak | 1 | Halaman |
| limit | number | Tidak | 10 | Maks 100 |
| search | string | Tidak | - | Pencarian |
| sortBy | enum | Tidak | createdAt | `createdAt` |
| sortOrder | enum | Tidak | desc | `asc` / `desc` |

**Response — Success (200)**
```json
{
  "status": "success",
  "data": [
    {
      "userId": "string",
      "shopId": "string",
      "createdAt": "datetime"
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

**Sumber kode:** `src/modules/shops/follower/follower.controller.ts:48`, `src/modules/shops/follower/follower.dto.ts:10`

---

### GET /api/core/shops/:shopId/following

**Deskripsi:** Mendapatkan daftar toko yang diikuti user yang sedang login.

**Autentikasi:** Bearer JWT

**Path Parameters:**
| Nama | Tipe | Wajib | Keterangan |
|------|------|-------|------------|
| shopId | string | Ya | ID toko |

**Query Parameters:**
| Nama | Tipe | Wajib | Default | Keterangan |
|------|------|-------|---------|------------|
| page | number | Tidak | 1 | Halaman |
| limit | number | Tidak | 10 | Maks 100 |
| sortBy | enum | Tidak | createdAt | `createdAt` |
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

**Sumber kode:** `src/modules/shops/follower/follower.controller.ts:60`, `src/modules/shops/follower/follower.dto.ts:21`
