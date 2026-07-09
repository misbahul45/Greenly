# Shop Finance API

Base path: `https://greenly-api.duckdns.org/api/core`

Path prefix dari `RouterModule`: `shops/:shopId/finance`

Semua endpoint dilindungi oleh `ShopMemberGuard` + `MinRole`.

---

### GET /api/core/shops/:shopId/finance/balance

**Deskripsi:** Mendapatkan saldo toko.

**Autentikasi:** Bearer JWT — MinRole: ADMIN

**Path Parameters:**
| Nama | Tipe | Wajib | Keterangan |
|------|------|-------|------------|
| shopId | string | Ya | ID toko |

**Response — Success (200)**
```json
{
  "status": "success",
  "data": {
    "balance": 0
  }
}
```

**Sumber kode:** `src/modules/shops/finance/finance.controller.ts:30`

---

### GET /api/core/shops/:shopId/finance/ledger

**Deskripsi:** Mendapatkan daftar ledger (riwayat transaksi) toko.

**Autentikasi:** Bearer JWT — MinRole: ADMIN

**Path Parameters:**
| Nama | Tipe | Wajib | Keterangan |
|------|------|-------|------------|
| shopId | string | Ya | ID toko |

**Query Parameters:**
| Nama | Tipe | Wajib | Default | Keterangan |
|------|------|-------|---------|------------|
| page | number | Tidak | 1 | Halaman |
| limit | number | Tidak | 20 | Maks 100 |
| type | enum | Tidak | - | `CREDIT`, `DEBIT` |
| search | string | Tidak | - | Pencarian |
| createdFrom | date | Tidak | - | Filter tanggal awal |
| createdTo | date | Tidak | - | Filter tanggal akhir |
| sortBy | enum | Tidak | createdAt | `createdAt`, `amount` |
| sortOrder | enum | Tidak | desc | `asc` / `desc` |

**Response — Success (200)**
```json
{
  "status": "success",
  "data": [
    {
      "id": "string",
      "shopId": "string",
      "type": "CREDIT|DEBIT",
      "amount": 0,
      "reference": "string",
      "description": "string|null",
      "createdAt": "datetime"
    }
  ],
  "metaData": {
    "page": 1,
    "limit": 20,
    "total": 0,
    "totalPages": 0
  }
}
```

**Sumber kode:** `src/modules/shops/finance/finance.controller.ts:41`, `src/modules/shops/finance/finance.dto.ts:28`

---

### POST /api/core/shops/:shopId/finance/payout

**Deskripsi:** Mengajukan pencairan dana (payout) dari saldo toko.

**Autentikasi:** Bearer JWT — MinRole: OWNER

**Path Parameters:**
| Nama | Tipe | Wajib | Keterangan |
|------|------|-------|------------|
| shopId | string | Ya | ID toko |

**Request Body:**
```json
{
  "amount": "number — required, positif"
}
```

**Response — Success (201)**
```json
{
  "status": "success",
  "data": {
    "id": "string",
    "shopId": "string",
    "amount": 0,
    "status": "PENDING",
    "createdAt": "datetime"
  }
}
```

**Sumber kode:** `src/modules/shops/finance/finance.controller.ts:54`, `src/modules/shops/finance/finance.dto.ts:42`

---

### GET /api/core/shops/:shopId/finance/payouts

**Deskripsi:** Mendapatkan daftar payout toko.

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
| status | enum | Tidak | - | `PENDING`, `PROCESSING`, `COMPLETED`, `FAILED` |
| createdFrom | date | Tidak | - | Filter tanggal awal |
| createdTo | date | Tidak | - | Filter tanggal akhir |
| sortBy | enum | Tidak | createdAt | `createdAt`, `paidAt`, `amount` |
| sortOrder | enum | Tidak | desc | `asc` / `desc` |

**Response — Success (200)**
```json
{
  "status": "success",
  "data": [
    {
      "id": "string",
      "shopId": "string",
      "amount": 0,
      "status": "PENDING|PROCESSING|COMPLETED|FAILED",
      "createdAt": "datetime",
      "paidAt": "datetime|null"
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

**Sumber kode:** `src/modules/shops/finance/finance.controller.ts:67`, `src/modules/shops/finance/finance.dto.ts:49`
