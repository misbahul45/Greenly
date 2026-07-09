# Finance Overview API (Admin)

Base path: `https://greenly-api.duckdns.org/api/core`

---

### GET /api/core/admin/finance/overview

**Deskripsi:** Mendapatkan overview keuangan platform (admin only).

**Autentikasi:** Bearer JWT — Decorator: `@RequireFinanceAccess('PLATFORM_ADMIN')` (akan menjalankan `JwtAccessGuard`, `FinanceAdminGuard`, `ShopOwnershipGuard`)

**Query Parameters:**
| Nama | Tipe | Wajib | Keterangan |
|------|------|-------|------------|
| dateFrom | datetime (ISO 8601) | Tidak | Filter awal |
| dateTo | datetime (ISO 8601) | Tidak | Filter akhir |

**Response — Success (200)**
```json
{
  "status": "success",
  "statusCode": 200,
  "message": "success",
  "data": {
    "totalRevenue": 0,
    "totalOrders": 0,
    "totalPayouts": 0,
    "totalFees": 0
  }
}
```

**Sumber kode:** `src/modules/finance/finance.controller.ts:12`, `src/modules/finance/finance.dto.ts:3`, `src/modules/finance/shared/decorators/require-finance-access.decorator.ts`
