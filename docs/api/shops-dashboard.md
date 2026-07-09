# Shop Dashboard API

Base path: `https://greenly-api.duckdns.org/api/core`

Path prefix dari `RouterModule`: `shops/:shopId/dashboard`

Semua endpoint dilindungi oleh `ShopMemberGuard` + `MinRole`.

---

### GET /api/core/shops/:shopId/dashboard/summary

**Deskripsi:** Mendapatkan ringkasan dashboard toko.

**Autentikasi:** Bearer JWT — MinRole: STAFF

**Path Parameters:**
| Nama | Tipe | Wajib | Keterangan |
|------|------|-------|------------|
| shopId | string | Ya | ID toko |

**Response — Success (200)**
```json
{
  "status": "success",
  "data": {
    "totalOrders": 0,
    "totalRevenue": 0,
    "totalProducts": 0,
    "totalFollowers": 0,
    "balance": 0
  }
}
```

**Sumber kode:** `src/modules/shops/dashboard/dashboard.controller.ts:20`

---

### GET /api/core/shops/:shopId/dashboard/revenue

**Deskripsi:** Mendapatkan data revenue toko.

**Autentikasi:** Bearer JWT — MinRole: OWNER

**Path Parameters:**
| Nama | Tipe | Wajib | Keterangan |
|------|------|-------|------------|
| shopId | string | Ya | ID toko |

**Query Parameters:**
| Nama | Tipe | Wajib | Default | Keterangan |
|------|------|-------|---------|------------|
| range | enum | Tidak | 30d | `7d`, `30d`, `90d` |

**Response — Success (200)**
```json
{
  "status": "success",
  "data": {
    "range": "7d|30d|90d",
    "revenue": [],
    "total": 0
  }
}
```

**Sumber kode:** `src/modules/shops/dashboard/dashboard.controller.ts:31`, `src/modules/shops/dashboard/dashboard.dto.ts:11`

---

### GET /api/core/shops/:shopId/dashboard/recent-orders

**Deskripsi:** Mendapatkan pesanan terbaru toko.

**Autentikasi:** Bearer JWT — MinRole: STAFF

**Path Parameters:**
| Nama | Tipe | Wajib | Keterangan |
|------|------|-------|------------|
| shopId | string | Ya | ID toko |

**Query Parameters:**
| Nama | Tipe | Wajib | Default | Keterangan |
|------|------|-------|---------|------------|
| limit | number | Tidak | 10 | Maks 50 |

**Response — Success (200)**
```json
{
  "status": "success",
  "data": [
    {
      "id": "string",
      "totalAmount": 0,
      "status": "string",
      "createdAt": "datetime"
    }
  ]
}
```

**Sumber kode:** `src/modules/shops/dashboard/dashboard.controller.ts:44`, `src/modules/shops/dashboard/dashboard.dto.ts:6`
