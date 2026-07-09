# Shop Members API

Base path: `https://greenly-api.duckdns.org/api/core`

Path prefix dari `RouterModule`: `shops/:shopId/members`

Semua endpoint dilindungi oleh `ShopMemberGuard` + `MinRole`.

---

### POST /api/core/shops/:shopId/members

**Deskripsi:** Menambahkan member ke toko.

**Autentikasi:** Bearer JWT — MinRole: OWNER

**Path Parameters:**
| Nama | Tipe | Wajib | Keterangan |
|------|------|-------|------------|
| shopId | string | Ya | ID toko |

**Request Body:**
```json
{
  "userId": "string — required",
  "role": "OWNER|ADMIN|STAFF — required"
}
```

**Response — Success (201)**
```json
{
  "status": "success",
  "data": { }
}
```

**Sumber kode:** `src/modules/shops/member/member.controller.ts:37`, `src/modules/shops/member/member.dto.ts:27`

---

### GET /api/core/shops/:shopId/members

**Deskripsi:** Mendapatkan daftar member toko.

**Autentikasi:** Bearer JWT — MinRole: ADMIN

**Path Parameters:**
| Nama | Tipe | Wajib | Keterangan |
|------|------|-------|------------|
| shopId | string | Ya | ID toko |

**Query Parameters:**
| Nama | Tipe | Wajib | Default | Keterangan |
|------|------|-------|---------|------------|
| page | number | Tidak | 1 | Halaman |
| limit | number | Tidak | 10 | Maks 100 |
| role | enum | Tidak | - | `OWNER`, `ADMIN`, `STAFF` |
| sortBy | enum | Tidak | id | `id`, `userId`, `role`, `createdAt` |
| sortOrder | enum | Tidak | asc | `asc` / `desc` |
| search | string | Tidak | - | Pencarian |

**Response — Success (200)**
```json
{
  "status": "success",
  "data": [
    {
      "id": "string",
      "shopId": "string",
      "userId": "string",
      "role": "OWNER|ADMIN|STAFF",
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

**Sumber kode:** `src/modules/shops/member/member.controller.ts:52`, `src/modules/shops/member/member.dto.ts:42`

---

### GET /api/core/shops/:shopId/members/:memberId

**Deskripsi:** Mendapatkan detail member toko.

**Autentikasi:** Bearer JWT — MinRole: ADMIN

**Path Parameters:**
| Nama | Tipe | Wajib | Keterangan |
|------|------|-------|------------|
| shopId | string | Ya | ID toko |
| memberId | string | Ya | ID member |

**Response — Success (200)**
```json
{
  "status": "success",
  "data": {
    "id": "string",
    "shopId": "string",
    "userId": "string",
    "role": "OWNER|ADMIN|STAFF",
    "createdAt": "datetime"
  }
}
```

**Sumber kode:** `src/modules/shops/member/member.controller.ts:66`

---

### PATCH /api/core/shops/:shopId/members/:memberId

**Deskripsi:** Mengupdate role member.

**Autentikasi:** Bearer JWT — MinRole: OWNER

**Path Parameters:**
| Nama | Tipe | Wajib | Keterangan |
|------|------|-------|------------|
| shopId | string | Ya | ID toko |
| memberId | string | Ya | ID member |

**Request Body:**
```json
{
  "role": "OWNER|ADMIN|STAFF — required"
}
```

**Response — Success (200)**
```json
{
  "status": "success",
  "data": { }
}
```

**Sumber kode:** `src/modules/shops/member/member.controller.ts:78`, `src/modules/shops/member/member.dto.ts:35`

---

### DELETE /api/core/shops/:shopId/members/:memberId

**Deskripsi:** Menghapus member dari toko.

**Autentikasi:** Bearer JWT — MinRole: OWNER

**Path Parameters:**
| Nama | Tipe | Wajib | Keterangan |
|------|------|-------|------------|
| shopId | string | Ya | ID toko |
| memberId | string | Ya | ID member |

**Response — Success (200)**
```json
{
  "status": "success",
  "data": null
}
```

**Sumber kode:** `src/modules/shops/member/member.controller.ts:92`
