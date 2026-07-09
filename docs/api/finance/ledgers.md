# Ledger API (Shop Finance)

Base path: `https://greenly-api.duckdns.org/api/core`

---

### GET /api/core/shops/:shopId/finance/ledgers

**Deskripsi:** Mendapatkan daftar transaksi ledger toko.

**Autentikasi:** Bearer JWT — Decorator: `@RequireFinanceAccess('PLATFORM_ADMIN', 'SHOP_OWNER')`

**Path Parameters:**
| Nama | Tipe | Wajib | Keterangan |
|------|------|-------|------------|
| shopId | string | Ya | ID toko |

**Query Parameters:**
| Nama | Tipe | Wajib | Default | Keterangan |
|------|------|-------|---------|------------|
| type | enum | Tidak | - | `CREDIT` / `DEBIT` |
| dateFrom | datetime (ISO) | Tidak | - | Filter tanggal mulai |
| dateTo | datetime (ISO) | Tidak | - | Filter tanggal akhir |
| page | number | Tidak | 1 | Halaman |
| limit | number | Tidak | 20 | Maks 100 |

**Response — Success (200)**
```json
{
  "status": "success",
  "statusCode": 200,
  "message": "success",
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

**Sumber kode:** `src/modules/finance/ledger/ledger.controller.ts:12`, `src/modules/finance/ledger/dto.ts:3`
