
---

# 1️⃣ SHOPS CORE MODULE (`/shops`)

Ini module utama untuk CRUD toko.

## 🎯 Tujuan

Handle pembuatan dan manajemen dasar toko.

## 📦 Endpoints

### ✅ Create Shop

```
POST /shops
```

* Owner membuat toko
* Status default: `PENDING`

**Butuh:**

* name
* description

Relasi:

* `User (owner)`
* `Shop`

---

### ✅ Get My Shops

```
GET /shops/me
```

Return semua shop yang:

* dia owner
* atau member

---

### ✅ Get Shop Detail

```
GET /shops/:id
```

Include:

* owner
* application
* followers count
* balance
* status

---

### ✅ Update Shop

```
PATCH /shops/:id
```

Hanya owner

---

### ✅ Delete Shop (Soft delete recommended)

```
DELETE /shops/:id
```

---

# 2️⃣ APPLICATION MODULE (`/shops/application`)

Berdasarkan model:

```
ShopApplication
```

## 🎯 Tujuan

Verifikasi legalitas toko.

## 📦 Endpoints

### ✅ Submit Application

```
POST /shops/:shopId/application
```

Create ShopApplication

---

### ✅ Update Application

```
PATCH /shops/:shopId/application
```

---

### ✅ Get My Application

```
GET /shops/:shopId/application
```

---

### ✅ Admin Review Application

```
PATCH /admin/shops/:shopId/application
```

Update:

* status → APPROVED / REJECTED
* notes
* reviewedAt

Relasi:

* `ShopApplication`
* `Shop`

---

# 3️⃣ DASHBOARD MODULE (`/shops/dashboard`)

## 🎯 Tujuan

Analytics & ringkasan performa toko.

Ambil data dari:

* Order
* Payment
* ShopLedger

## 📦 Endpoints

### ✅ Summary

```
GET /shops/:shopId/dashboard/summary
```

Return:

* totalOrders
* totalRevenue
* totalCompleted
* balance
* monthlyRevenue

---

### ✅ Recent Orders

```
GET /shops/:shopId/dashboard/recent-orders
```

---

### ✅ Revenue Chart Data

```
GET /shops/:shopId/dashboard/revenue?range=30days
```

---

# 4️⃣ FINANCE MODULE (`/shops/finance`)

Berhubungan dengan:

* ShopLedger
* Payout
* Payment
* Refund

---

## 📦 Endpoints

### ✅ Get Balance

```
GET /shops/:shopId/finance/balance
```

Return:

* current balance
* pending payout

---

### ✅ Ledger History

```
GET /shops/:shopId/finance/ledger
```

---

### ✅ Request Payout

```
POST /shops/:shopId/finance/payout
```

Create:

```
Payout
status = PENDING
```

---

### ✅ Get Payout History

```
GET /shops/:shopId/finance/payouts
```

---

# 5️⃣ FOLLOWER MODULE (`/shops/follower`)

Berdasarkan model:

```
ShopFollower
```

## 📦 Endpoints

### ✅ Follow Shop

```
POST /shops/:shopId/follow
```

---

### ✅ Unfollow Shop

```
DELETE /shops/:shopId/follow
```

---

### ✅ Get Followers

```
GET /shops/:shopId/followers
```

---

### ✅ Get My Followed Shops

```
GET /users/me/following
```

---

# 6️⃣ MEMBER MODULE (`/shops/member`)

Model:

```
ShopMember
```

## 🎯 Tujuan

Manajemen tim toko.

---

## 📦 Endpoints

### ✅ Add Member

```
POST /shops/:shopId/members
```

Body:

```
{
  userId,
  role
}
```

---

### ✅ Get Members

```
GET /shops/:shopId/members
```

---

### ✅ Update Member Role

```
PATCH /shops/:shopId/members/:memberId
```

---

### ✅ Remove Member

```
DELETE /shops/:shopId/members/:memberId
```

---

# 7️⃣ ORDER MODULE (`/shops/order`)

Berhubungan dengan:

* Order
* OrderItem
* Payment
* Refund

---

## 📦 Endpoints

### ✅ Get Shop Orders

```
GET /shops/:shopId/orders
```

Filter:

* status
* date
* pagination

---

### ✅ Get Order Detail

```
GET /shops/:shopId/orders/:orderId
```

---

### ✅ Update Order Status

```
PATCH /shops/:shopId/orders/:orderId/status
```

Flow:

* PENDING → PAID
* PAID → PROCESSING
* PROCESSING → SHIPPED
* SHIPPED → COMPLETED

---

### ✅ Approve Refund

```
PATCH /shops/:shopId/orders/:orderId/refund/:refundId
```

---

# 🔐 ROLE MATRIX (Important)

| Action             | Owner | Member | Admin |
| ------------------ | ----- | ------ | ----- |
| Create shop        | ✅     | ❌      | ❌     |
| Update shop        | ✅     | ❌      | ✅     |
| View dashboard     | ✅     | ✅      | ✅     |
| Manage members     | ✅     | ❌      | ❌     |
| Finance access     | ✅     | ❌      | ✅     |
| Review application | ❌     | ❌      | ✅     |

---

# 🧠 Kalau Ini Production-Ready

Tambahkan:

### 1️⃣ Soft Delete Shop

Tambahkan:

```
deletedAt DateTime?
```

---

### 2️⃣ Add Audit Log

Untuk semua perubahan status:

* Order
* Application
* Payout

---

### 3️⃣ Transaction Safety

Semua:

* Payment
* Ledger
* Payout

Harus pakai:

```ts
await prisma.$transaction(async (tx) => {
   ...
})
```

---

# 🎯 Arsitektur Recommended

Karena kamu sudah pakai:

* Prisma
* Modular folder
* TanStack frontend

Structure ideal backend:

```
shops/
 ├── shops.controller.ts
 ├── shops.service.ts
 ├── shops.repository.ts
 ├── dto/
 ├── application/
 ├── finance/
 ├── dashboard/
 ├── follower/
 ├── member/
 ├── order/
```

Pisahkan logic ke service layer.

---

# 🔥 Kesimpulan

Module `shops` kamu secara sistem sudah level:

✔️ Marketplace seperti Tokopedia
✔️ Sudah ada ledger
✔️ Sudah ada payout
✔️ Sudah ada verification
✔️ Sudah ada refund
✔️ Sudah ada member system

Tinggal:

* API design rapih
* RBAC kuat
* Transaction aman
* Index optimal

---

Kalau kamu mau, aku bisa bantu:

* 🧱 Buatin full REST API blueprint (OpenAPI style)
* 🔐 Design RBAC granular permission
* 💰 Design finance flow yang 100% konsisten
* 📈 Optimasi query + index strategy
* 🏗️ Refactor jadi enterprise-grade architecture

Kamu mau lanjut ke bagian mana dulu? 🚀
