# Shop Application API

Base path: `https://greenly-api.duckdns.org/api/core`

Path prefix dari `RouterModule`: `shops/:shopId/application`

---

### POST /api/core/shops/:shopId/application

**Deskripsi:** Membuat aplikasi toko (pengajuan verifikasi toko).

**Autentikasi:** Bearer JWT

**Path Parameters:**
| Nama | Tipe | Wajib | Keterangan |
|------|------|-------|------------|
| shopId | string | Ya | ID toko |

**Request Body:**
```json
{
  "idCardUrl": "string — required, valid URL, trim",
  "selfieUrl": "string — optional, valid URL, trim (null jika empty)",
  "nib": "string — optional, max 50, trim (null jika empty)",
  "npwp": "string — optional, max 50, trim (null jika empty)",
  "siupUrl": "string — optional, valid URL, trim (null jika empty)",
  "bankName": "string — required, min 2, max 100, trim",
  "bankAccount": "string — required, min 5, max 30, trim",
  "accountName": "string — required, min 2, max 100, trim"
}
```

**Response — Success (201)**
```json
{
  "status": "success",
  "data": {
    "id": "string",
    "shopId": "string",
    "status": "PENDING"
  }
}
```

**Sumber kode:** `src/modules/shops/application/application.controller.ts:31`, `src/modules/shops/application/application.dto.ts:20`

---

### PATCH /api/core/shops/:shopId/application

**Deskripsi:** Mengupdate aplikasi toko.

**Autentikasi:** Bearer JWT

**Path Parameters:**
| Nama | Tipe | Wajib | Keterangan |
|------|------|-------|------------|
| shopId | string | Ya | ID toko |

**Request Body:** Sama seperti POST

**Sumber kode:** `src/modules/shops/application/application.controller.ts:43`

---

### PATCH /api/core/shops/:shopId/application/review

**Deskripsi:** Review aplikasi toko (admin). Mengubah status aplikasi.

**Autentikasi:** Bearer JWT — Role: SUPER_ADMIN

**Path Parameters:**
| Nama | Tipe | Wajib | Keterangan |
|------|------|-------|------------|
| shopId | string | Ya | ID toko |

**Request Body:**
```json
{
  "status": "PENDING|REVIEW|APPROVED|REJECTED — required",
  "notes": "string — optional, max 500, trim (null jika empty)"
}
```

**Response — Success (200)**
```json
{
  "status": "success",
  "data": { }
}
```

**Sumber kode:** `src/modules/shops/application/application.controller.ts:55`, `src/modules/shops/application/application.dto.ts:65`

---

### GET /api/core/shops/:shopId/application

**Deskripsi:** Mendapatkan detail aplikasi toko (admin).

**Autentikasi:** Bearer JWT — Role: SUPER_ADMIN

**Path Parameters:**
| Nama | Tipe | Wajib | Keterangan |
|------|------|-------|------------|
| shopId | string | Ya | ID toko |

**Response — Success (200)**
```json
{
  "status": "success",
  "data": {
    "id": "string",
    "shopId": "string",
    "idCardUrl": "string",
    "selfieUrl": "string|null",
    "nib": "string|null",
    "npwp": "string|null",
    "siupUrl": "string|null",
    "bankName": "string",
    "bankAccount": "string",
    "accountName": "string",
    "status": "PENDING|REVIEW|APPROVED|REJECTED",
    "notes": "string|null",
    "createdAt": "datetime",
    "reviewedAt": "datetime|null",
    "updatedAt": "datetime"
  }
}
```

**Sumber kode:** `src/modules/shops/application/application.controller.ts:68`

---

### GET /api/core/shops/:shopId/application/list

**Deskripsi:** Mendapatkan daftar semua aplikasi toko (admin).

**Autentikasi:** Bearer JWT — Role: SUPER_ADMIN

**Path Parameters:**
| Nama | Tipe | Wajib | Keterangan |
|------|------|-------|------------|
| shopId | string | Ya | ID toko |

**Query Parameters:**
| Nama | Tipe | Wajib | Default | Keterangan |
|------|------|-------|---------|------------|
| page | number | Tidak | 1 | Halaman |
| limit | number | Tidak | 10 | Maks 100 |
| status | enum | Tidak | - | `PENDING`, `REVIEW`, `APPROVED`, `REJECTED` |
| shopId | string | Tidak | - | Filter shopId |
| search | string | Tidak | - | Pencarian |
| createdFrom | date | Tidak | - | Filter tanggal awal |
| createdTo | date | Tidak | - | Filter tanggal akhir |
| sortBy | enum | Tidak | createdAt | `createdAt`, `updatedAt`, `status` |
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

**Sumber kode:** `src/modules/shops/application/application.controller.ts:79`, `src/modules/shops/application/application.dto.ts:79`

---

### GET /api/core/shops/:shopId/application/me

**Deskripsi:** Mendapatkan aplikasi toko milik user yang login.

**Autentikasi:** Bearer JWT

**Path Parameters:**
| Nama | Tipe | Wajib | Keterangan |
|------|------|-------|------------|
| shopId | string | Ya | ID toko |

**Response — Success (200)**
```json
{
  "status": "success",
  "data": { }
}
```

**Sumber kode:** `src/modules/shops/application/application.controller.ts:90`

---

### DELETE /api/core/shops/:shopId/application

**Deskripsi:** Menghapus aplikasi toko.

**Autentikasi:** Bearer JWT

**Path Parameters:**
| Nama | Tipe | Wajib | Keterangan |
|------|------|-------|------------|
| shopId | string | Ya | ID toko |

**Response — Success (200)**
```json
{
  "status": "success",
  "data": null
}
```

**Sumber kode:** `src/modules/shops/application/application.controller.ts:101`
