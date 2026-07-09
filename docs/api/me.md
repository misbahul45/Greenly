# Me (Profile) API

Base path: `https://greenly-api.duckdns.org/api/core`

---

### GET /api/core/me

**Deskripsi:** Mendapatkan data profile user yang sedang login.

**Autentikasi:** Bearer JWT

**Response — Success (200)**
```json
{
  "status": "success",
  "statusCode": 200,
  "message": "success",
  "data": {
    "id": "string",
    "email": "string",
    "profile": {
      "fullName": "string",
      "phone": "string|null",
      "avatarUrl": "string|null",
      "photoUrl": "string|null",
      "address": "string|null"
    },
    "roles": ["string"],
    "status": "ACTIVE|SUSPENDED|BANNED|PENDING_VERIFICATION"
  }
}
```

**Sumber kode:** `src/modules/identity/me/me.controller.ts:13`

---

### PATCH /api/core/me/update

**Deskripsi:** Memperbarui profile user yang sedang login.

**Autentikasi:** Bearer JWT

**Request Body:**
```json
{
  "name": "string — optional, min 3, max 100",
  "phone": "string — optional, min 8, max 20",
  "avatarUrl": "string — optional, valid URL",
  "photoUrl": "string — optional, valid URL",
  "address": "string — optional, max 255"
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

**Sumber kode:** `src/modules/identity/me/me.controller.ts:22`, `src/modules/identity/me/me.dto.ts:4`

---

### GET /api/core/me/following/shops

**Deskripsi:** Mendapatkan daftar toko yang diikuti user.

**Autentikasi:** Bearer JWT

**Query Parameters:**
| Nama | Tipe | Wajib | Default | Keterangan |
|------|------|-------|---------|------------|
| page | number | Tidak | 1 | Halaman |
| limit | number | Tidak | 10 | Maks 100 |
| shopId | string | Ya | - | ID toko |
| search | string | Tidak | - | Pencarian |
| createdFrom | date | Tidak | - | Filter tanggal awal follow |
| createdTo | date | Tidak | - | Filter tanggal akhir follow |
| sortBy | enum | Tidak | createdAt | `createdAt` |
| sortOrder | enum | Tidak | desc | `asc` / `desc` |

**Response — Success (200)**
```json
{
  "status": "success",
  "statusCode": 200,
  "message": "success",
  "data": [
    {
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

**Sumber kode:** `src/modules/identity/me/me.controller.ts:35`, `src/modules/identity/me/me.dto.ts:36`
