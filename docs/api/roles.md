# Roles API

Base path: `https://greenly-api.duckdns.org/api/core`

Semua endpoint membutuhkan role `ADMIN` atau `SUPER_ADMIN`.

---

### GET /api/core/roles

**Deskripsi:** Mendapatkan daftar roles.

**Autentikasi:** Bearer JWT — Role: ADMIN, SUPER_ADMIN

**Query Parameters:**
| Nama | Tipe | Wajib | Default | Keterangan |
|------|------|-------|---------|------------|
| page | number | Tidak | 1 | Halaman |
| limit | number | Tidak | 10 | Maks 100 |
| includePermissions | boolean | Tidak | false | Sertakan permissions (`true`/`false` string) |
| search | string | Tidak | - | Pencarian |

**Response — Success (200)**
```json
{
  "status": "success",
  "message": "success",
  "data": [
    {
      "id": "string",
      "name": "string (UPPERCASE)",
      "permissions": ["string"] | null
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

**Sumber kode:** `src/modules/identity/roles/roles.controller.ts:35`, `src/modules/identity/roles/roles.dto.ts:68`

---

### GET /api/core/roles/:id

**Deskripsi:** Mendapatkan detail role.

**Autentikasi:** Bearer JWT — Role: ADMIN, SUPER_ADMIN

**Path Parameters:**
| Nama | Tipe | Wajib | Keterangan |
|------|------|-------|------------|
| id | string | Ya | ID role |

**Response — Success (200)**
```json
{
  "status": "success",
  "message": "success",
  "data": {
    "id": "string",
    "name": "string (UPPERCASE)"
  }
}
```

**Sumber kode:** `src/modules/identity/roles/roles.controller.ts:47`

---

### POST /api/core/roles

**Deskripsi:** Membuat role baru.

**Autentikasi:** Bearer JWT — Role: ADMIN, SUPER_ADMIN

**Request Body:**
```json
{
  "name": "string — required, min 2, max 50, akan di-trim dan di-UPPERCASE"
}
```

**Response — Success (201)**
```json
{
  "status": "success",
  "message": "success",
  "data": {
    "id": "string",
    "name": "string"
  }
}
```

**Sumber kode:** `src/modules/identity/roles/roles.controller.ts:58`, `src/modules/identity/roles/roles.dto.ts:16`

---

### PATCH /api/core/roles/:id

**Deskripsi:** Mengupdate nama role.

**Autentikasi:** Bearer JWT — Role: ADMIN, SUPER_ADMIN

**Path Parameters:**
| Nama | Tipe | Wajib | Keterangan |
|------|------|-------|------------|
| id | string | Ya | ID role |

**Request Body:**
```json
{
  "name": "string — required, min 2, max 50, akan di-UPPERCASE"
}
```

**Response — Success (200)**
```json
{
  "status": "success",
  "message": "success",
  "data": {
    "id": "string",
    "name": "string"
  }
}
```

**Sumber kode:** `src/modules/identity/roles/roles.controller.ts:69`, `src/modules/identity/roles/roles.dto.ts:26`

---

### DELETE /api/core/roles/:id

**Deskripsi:** Menghapus role.

**Autentikasi:** Bearer JWT — Role: ADMIN, SUPER_ADMIN

**Path Parameters:**
| Nama | Tipe | Wajib | Keterangan |
|------|------|-------|------------|
| id | string | Ya | ID role |

**Response — Success (200)**
```json
{
  "status": "success",
  "message": "success",
  "data": null
}
```

**Sumber kode:** `src/modules/identity/roles/roles.controller.ts:82`

---

### POST /api/core/roles/:id/permissions

**Deskripsi:** Menambahkan permissions ke role.

**Autentikasi:** Bearer JWT — Role: ADMIN, SUPER_ADMIN

**Path Parameters:**
| Nama | Tipe | Wajib | Keterangan |
|------|------|-------|------------|
| id | string | Ya | ID role |

**Request Body:**
```json
{
  "permissions": ["string — min 2, akan di-UPPERCASE"]
}
```

**Response — Success (201)**
```json
{
  "status": "success",
  "message": "success",
  "data": null
}
```

**Sumber kode:** `src/modules/identity/roles/roles.controller.ts:93`, `src/modules/identity/roles/roles.dto.ts:36`

---

### PATCH /api/core/roles/:id/permissions

**Deskripsi:** Mengganti seluruh permissions role (replace).

**Autentikasi:** Bearer JWT — Role: ADMIN, SUPER_ADMIN

**Path Parameters:**
| Nama | Tipe | Wajib | Keterangan |
|------|------|-------|------------|
| id | string | Ya | ID role |

**Request Body:**
```json
{
  "permissions": ["string — min 2, akan di-UPPERCASE"]
}
```

**Response — Success (200)**
```json
{
  "status": "success",
  "message": "success",
  "data": null
}
```

**Sumber kode:** `src/modules/identity/roles/roles.controller.ts:109`, `src/modules/identity/roles/roles.dto.ts:46`
