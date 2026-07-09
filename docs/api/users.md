# Users API (Admin)

Base path: `https://greenly-api.duckdns.org/api/core`

Semua endpoint di controller ini membutuhkan role `ADMIN` atau `SUPER_ADMIN`.

---

### GET /api/core/users

**Deskripsi:** Mendapatkan daftar semua user (admin only).

**Autentikasi:** Bearer JWT — Role: ADMIN, SUPER_ADMIN

**Query Parameters:**
| Nama | Tipe | Wajib | Default | Keterangan |
|------|------|-------|---------|------------|
| page | number | Tidak | 1 | Halaman |
| limit | number | Tidak | 10 | Maks 100 |
| status | enum | Tidak | - | `ACTIVE`, `SUSPENDED`, `BANNED`, `PENDING_VERIFICATION` |
| search | string | Tidak | - | Pencarian |
| sortBy | enum | Tidak | createdAt | `createdAt`, `updatedAt`, `email`, `status` |
| sortOrder | enum | Tidak | desc | `asc` / `desc` |

**Response — Success (200)**
```json
{
  "status": "success",
  "data": [
    {
      "id": "string",
      "email": "string",
      "status": "ACTIVE|SUSPENDED|BANNED|PENDING_VERIFICATION",
      "isActive": true,
      "emailVerified": "datetime|null",
      "followingCount": 0,
      "createdAt": "datetime",
      "updatedAt": "datetime",
      "profile": {
        "fullName": "string",
        "phone": "string|null",
        "avatarUrl": "string|null"
      },
      "roles": [
        {
          "role": {
            "id": "string",
            "name": "string"
          }
        }
      ]
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

**Sumber kode:** `src/modules/identity/users/users.controller.ts:33`, `src/modules/identity/users/users.dto.ts:20`

---

### GET /api/core/users/:id

**Deskripsi:** Mendapatkan detail user by ID.

**Autentikasi:** Bearer JWT — Role: SUPER_ADMIN

**Path Parameters:**
| Nama | Tipe | Wajib | Keterangan |
|------|------|-------|------------|
| id | string | Ya | ID user |

**Response — Success (200)**
```json
{
  "status": "success",
  "data": {
    "id": "string",
    "email": "string",
    "status": "string",
    "isActive": true,
    "createdAt": "datetime",
    "profile": { },
    "roles": []
  }
}
```

**Sumber kode:** `src/modules/identity/users/users.controller.ts:45`

---

### POST /api/core/users

**Deskripsi:** Membuat user baru oleh admin.

**Autentikasi:** Bearer JWT — Role: ADMIN, SUPER_ADMIN

**Request Body:**
```json
{
  "email": "string — required, valid email",
  "password": "string — required, min 6",
  "name": "string — required"
}
```

**Response — Success (201)**
```json
{
  "status": "success",
  "data": { }
}
```

**Sumber kode:** `src/modules/identity/users/users.controller.ts:56`, `src/modules/identity/users/users.dto.ts:37`

---

### PATCH /api/core/users/:id

**Deskripsi:** Mengupdate status user.

**Autentikasi:** Bearer JWT

**Path Parameters:**
| Nama | Tipe | Wajib | Keterangan |
|------|------|-------|------------|
| id | string | Ya | ID user |

**Request Body:**
```json
{
  "status": "ACTIVE|SUSPENDED|BANNED|PENDING_VERIFICATION — optional",
  "isActive": "boolean — optional"
}
```

**Response — Success (200)**
```json
{
  "status": "success",
  "data": { }
}
```

**Sumber kode:** `src/modules/identity/users/users.controller.ts:67`, `src/modules/identity/users/users.dto.ts:45`

---

### DELETE /api/core/users/delete

**Deskripsi:** Menghapus akun sendiri (bukan oleh admin — menggunakan token dari body).

**Autentikasi:** Bearer JWT

**Catatan:** Ini bukan endpoint REST standar. Tidak ada path parameter. User menghapus dirinya sendiri. Endpoint ini menghasilkan token delete yang perlu diverifikasi.

**Response — Success (200)**
```json
{
  "status": "success",
  "data": null,
  "message": "success"
}
```

**Sumber kode:** `src/modules/identity/users/users.controller.ts:79`

---

### DELETE /api/core/users/delete/verify

**Deskripsi:** Verifikasi dan konfirmasi penghapusan akun.

**Autentikasi:** Bearer JWT

**Request Body:**
```json
{
  "token": "string — required, min 6 karakter"
}
```

**Response — Success (200)**
```json
{
  "status": "success",
  "data": null,
  "message": "success"
}
```

**Sumber kode:** `src/modules/identity/users/users.controller.ts:88`, `src/modules/identity/users/users.dto.ts:55`
