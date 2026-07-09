# Categories API (Catalog Service)

Base path: `https://greenly-api.duckdns.org/api/catalog`

Response terformat menggunakan `middleware/error_middleware.go`.

---

### GET /api/catalog/categories

**Deskripsi:** Mendapatkan daftar kategori.

**Autentikasi:** Tidak ada (public)

**Query Parameters:**
| Nama | Tipe | Wajib | Default | Keterangan |
|------|------|-------|---------|------------|
| page | int | Tidak | - | Halaman |
| limit | int | Tidak | - | Batas per halaman |
| search | string | Tidak | - | Pencarian |
| sortBy | string | Tidak | - | Field sorting |
| sortOrder | string | Tidak | - | `asc` / `desc` |

**Response — Success (200)**
```json
{
  "data": [
    {
      "id": "string",
      "name": "string",
      "slug": "string",
      "parentId": "string|null",
      "createdAt": "datetime",
      "updatedAt": "datetime"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 0,
    "totalPages": 0
  }
}
```

**Sumber kode:** `modules/categories/`

---

### GET /api/catalog/categories/tree

**Deskripsi:** Mendapatkan hierarki kategori dalam bentuk tree.

**Autentikasi:** Tidak ada (public)

**Query Parameters:**
| Nama | Tipe | Wajib | Keterangan |
|------|------|-------|------------|
| max_depth | int | Tidak | Kedalaman maksimum tree |
| parent_id | string | Tidak | Filter parent |
| include_products | bool | Tidak | Sertakan produk |
| only_active | bool | Tidak | Hanya kategori aktif |
| with_path | bool | Tidak | Sertakan path |
| format | string | Tidak | Format output |

**Response — Success (200)**
```json
{
  "data": [
    {
      "id": "string",
      "name": "string",
      "slug": "string",
      "parentId": "string|null",
      "productCount": 0,
      "level": 0,
      "path": ["string"],
      "children": [],
      "createdAt": "datetime",
      "updatedAt": "datetime"
    }
  ],
  "meta": {
    "totalCategories": 0,
    "maxDepthReached": 0,
    "rootId": "string",
    "format": "string"
  }
}
```

**Sumber kode:** `modules/categories/`

---

### GET /api/catalog/categories/:id

**Deskripsi:** Mendapatkan detail kategori by ID.

**Autentikasi:** Tidak ada (public)

**Path Parameters:**
| Nama | Tipe | Wajib | Keterangan |
|------|------|-------|------------|
| id | string | Ya | ID kategori |

**Response — Success (200)**
```json
{
  "data": {
    "id": "string",
    "name": "string",
    "slug": "string",
    "parentId": "string|null",
    "createdAt": "datetime",
    "updatedAt": "datetime"
  }
}
```

**Sumber kode:** `modules/categories/`

---

### POST /api/catalog/categories

**Deskripsi:** Membuat kategori baru.

**Autentikasi:** Bearer JWT — RequireRole: ADMIN, SUPERADMIN

**Request Body:**
```json
{
  "name": "string — required",
  "slug": "string — optional",
  "parentId": "string — optional"
}
```

**Response — Success (201)**
```json
{
  "data": {
    "id": "string",
    "name": "string",
    "slug": "string",
    "parentId": "string|null",
    "createdAt": "datetime",
    "updatedAt": "datetime"
  }
}
```

**Sumber kode:** `modules/categories/`, `middleware/auth_middleware.go`

---

### PUT /api/catalog/categories/:id

**Deskripsi:** Mengupdate kategori.

**Autentikasi:** Bearer JWT — RequireRole: ADMIN, SUPERADMIN

**Path Parameters:**
| Nama | Tipe | Wajib | Keterangan |
|------|------|-------|------------|
| id | string | Ya | ID kategori |

**Request Body:**
```json
{
  "name": "string — optional",
  "slug": "string — optional",
  "parentId": "string — optional"
}
```

**Response — Success (200)**
```json
{
  "data": {
    "id": "string",
    "name": "string",
    "slug": "string",
    "parentId": "string|null",
    "createdAt": "datetime",
    "updatedAt": "datetime"
  }
}
```

**Sumber kode:** `modules/categories/`

---

### DELETE /api/catalog/categories/:id

**Deskripsi:** Menghapus kategori.

**Autentikasi:** Bearer JWT — RequireRole: ADMIN, SUPERADMIN

**Path Parameters:**
| Nama | Tipe | Wajib | Keterangan |
|------|------|-------|------------|
| id | string | Ya | ID kategori |

**Response — Success (200)**
```json
{
  "message": "Category deleted"
}
```

**Sumber kode:** `modules/categories/`
