# 📚 API Documentation Report
**Project:** nestjs (core-service)
**Generated Date:** 29 June 2026
**Base URL:** `http://localhost:3000`

## 📑 Table of Contents
- [1. Health](#1-health)
- [2. Auth](#2-auth)
- [3. Banner Admin](#3-banner-admin)
- [4. Banner Public](#4-banner-public)
- [5. Chat](#5-chat)
- [6. Notification](#6-notification)
- [7. Finance Platform](#7-finance-platform)
- [8. Roles](#8-roles)
- [9. Checkout](#9-checkout)
- [10. Cart](#10-cart)
- [11. Shops](#11-shops)
- [12. Me](#12-me)
- [13. Promotion Admin](#13-promotion-admin)
- [14. Promotion Public](#14-promotion-public)
- [15. Shop Finance](#15-shop-finance)
- [16. Shop Order](#16-shop-order)
- [17. Commerce Order](#17-commerce-order)
- [18. Users](#18-users)
- [19. Shop Member](#19-shop-member)
- [20. Shop Dashboard](#20-shop-dashboard)
- [21. Shops Ledger](#21-shops-ledger)
- [22. Shop Follower](#22-shop-follower)
- [23. Shop Banner](#23-shop-banner)
- [24. Payout](#24-payout)
- [25. Shop Application](#25-shop-application)
- [26. Refund](#26-refund)
- [27. Payment (Admin)](#27-payment-admin)
- [28. Stripe Payment](#28-stripe-payment)

---

## 1. Health
**Base Path:** `/health`
**Deskripsi:** Health check endpoint untuk memonitor status service

### 1.1 Health Check
- **Endpoint:** `GET /health`
- **Deskripsi:** Mengecek status kesehatan service
- **Authentication:** No (Public)
- **Request:** -
- **Response:**
  - `200 OK`: `{ data: { status: "ok", service: "core-service" }, message: "OK" }`

---

## 2. Auth
**Base Path:** `/auth`
**Deskripsi:** Manajemen autentikasi pengguna (registrasi, login, refresh token, verifikasi email, reset password)

### 2.1 Register
- **Endpoint:** `POST /auth/register`
- **Deskripsi:** Registrasi pengguna baru
- **Authentication:** No (Public)
- **Request:**
  - **Body:** `RegisterDTO` (via `RegisterSchema`)
- **Response:**
  - `201 Created`: Data user yang terdaftar

### 2.2 Login
- **Endpoint:** `POST /auth/login`
- **Deskripsi:** Login pengguna
- **Authentication:** No (Public)
- **Request:**
  - **Body:** `LoginDTO` (via `LoginSchema`)
- **Response:**
  - `200 OK`: Access token & refresh token

### 2.3 Refresh Token
- **Endpoint:** `POST /auth/refresh-token`
- **Deskripsi:** Memperbarui access token menggunakan refresh token
- **Authentication:** No (Public, with `JwtRefreshGuard`)
- **Request:**
  - **Headers:** `Authorization: Bearer <refresh_token>`
- **Response:**
  - `200 OK`: Access token baru

### 2.4 Verify Email
- **Endpoint:** `POST /auth/verify-email`
- **Deskripsi:** Verifikasi alamat email pengguna
- **Authentication:** No (Public)
- **Request:**
  - **Body:** `VerifyEmailDTO` (via `VerifyEmailSchema`)
- **Response:**
  - `200 OK`: Status verifikasi

### 2.5 Verify Password
- **Endpoint:** `POST /auth/verify-password`
- **Deskripsi:** Verifikasi token reset password
- **Authentication:** No (Public)
- **Request:**
  - **Body:** `VerifyPasswordDTO` (via `VerifyPasswordSchema`)
- **Response:**
  - `200 OK`: Status verifikasi

### 2.6 Forgot Password
- **Endpoint:** `POST /auth/forgot-password`
- **Deskripsi:** Mengirim email reset password
- **Authentication:** No (Public)
- **Request:**
  - **Body:** `ForgotPasswordDTO` (via `ForgotPasswordSchema`)
- **Response:**
  - `200 OK`: Email terkirim

### 2.7 Resend Token
- **Endpoint:** `POST /auth/resend-token?for=<tokenType>`
- **Deskripsi:** Mengirim ulang token verifikasi
- **Authentication:** No (Public)
- **Request:**
  - **Body:** `ResendTokenDTO` (via `ResendTokenSchema`)
  - **Query:** `for: AuthTokenType`
- **Response:**
  - `200 OK`: Token terkirim

### 2.8 Change Password
- **Endpoint:** `PATCH /auth/change-password`
- **Deskripsi:** Mengubah password pengguna
- **Authentication:** No (Public)
- **Request:**
  - **Body:** `ChangePasswordDTO` (via `ChangePasswordSchema`)
- **Response:**
  - `200 OK`: Password berhasil diubah

### 2.9 Logout
- **Endpoint:** `POST /auth/logout`
- **Deskripsi:** Logout pengguna
- **Authentication:** Yes (Global JwtAccessGuard)
- **Request:**
  - **CurrentUser:** `UserLogin`
- **Response:**
  - `200 OK`: Logout berhasil

### 2.10 Get Current User
- **Endpoint:** `GET /auth/me`
- **Deskripsi:** Mendapatkan data user yang sedang login
- **Authentication:** Yes (Global JwtAccessGuard)
- **Request:**
  - **CurrentUser:** `UserLogin`
- **Response:**
  - `200 OK`: Data profil user

---

## 3. Banner Admin
**Base Path:** `/admin/banners`
**Deskripsi:** Manajemen banner oleh admin (CRUD)

### 3.1 Find All Banners
- **Endpoint:** `GET /admin/banners`
- **Deskripsi:** Mendapatkan daftar semua banner
- **Authentication:** Yes (JwtAccessGuard + Roles: SUPER_ADMIN, ADMIN)
- **Request:**
  - **Query:** `BannerQueryDTO` (via `BannerQuerySchema`)
- **Response:**
  - `200 OK`: Daftar banner

### 3.2 Find One Banner
- **Endpoint:** `GET /admin/banners/:id`
- **Deskripsi:** Mendapatkan detail banner berdasarkan ID
- **Authentication:** Yes (JwtAccessGuard + Roles: SUPER_ADMIN, ADMIN)
- **Request:**
  - **Params:** `BannerIdParamDTO` (`id`)
- **Response:**
  - `200 OK`: Detail banner
  - `404 Not Found`: Banner tidak ditemukan

### 3.3 Create Banner
- **Endpoint:** `POST /admin/banners`
- **Deskripsi:** Membuat banner baru
- **Authentication:** Yes (JwtAccessGuard + Roles: SUPER_ADMIN, ADMIN)
- **Request:**
  - **Body:** `CreateBannerDTO` (via `CreateBannerSchema`)
- **Response:**
  - `201 Created`: Banner berhasil dibuat

### 3.4 Update Banner
- **Endpoint:** `PATCH /admin/banners/:id`
- **Deskripsi:** Memperbarui banner
- **Authentication:** Yes (JwtAccessGuard + Roles: SUPER_ADMIN, ADMIN)
- **Request:**
  - **Params:** `BannerIdParamDTO` (`id`)
  - **Body:** `UpdateBannerDTO` (via `UpdateBannerSchema`)
- **Response:**
  - `200 OK`: Banner berhasil diperbarui

### 3.5 Delete Banner
- **Endpoint:** `DELETE /admin/banners/:id`
- **Deskripsi:** Menghapus banner
- **Authentication:** Yes (JwtAccessGuard + Roles: SUPER_ADMIN, ADMIN)
- **Request:**
  - **Params:** `BannerIdParamDTO` (`id`)
- **Response:**
  - `200 OK`: Banner berhasil dihapus

---

## 4. Banner Public
**Base Path:** `/banners`
**Deskripsi:** Endpoint publik untuk menampilkan banner

### 4.1 Find Active Banners
- **Endpoint:** `GET /banners/active`
- **Deskripsi:** Mendapatkan banner yang aktif
- **Authentication:** No (Public)
- **Request:**
  - **Query:** `type` (optional string)
- **Response:**
  - `200 OK`: Daftar banner aktif

---

## 5. Chat
**Base Path:** `/chat`
**Deskripsi:** Fitur chat/realtime messaging antar pengguna

### 5.1 Find Conversations
- **Endpoint:** `GET /chat/conversations`
- **Deskripsi:** Mendapatkan daftar percakapan user
- **Authentication:** Yes (Global JwtAccessGuard)
- **Request:**
  - **CurrentUser:** `UserLogin`
  - **Query:** `ChatQueryDto` (via `ChatQuerySchema`)
- **Response:**
  - `200 OK`: Daftar percakapan

### 5.2 Create Conversation
- **Endpoint:** `POST /chat/conversations`
- **Deskripsi:** Membuat percakapan baru
- **Authentication:** Yes (Global JwtAccessGuard)
- **Request:**
  - **CurrentUser:** `UserLogin`
  - **Body:** `CreateConversationDto` (via `CreateConversationSchema`)
- **Response:**
  - `201 Created`: Percakapan baru

### 5.3 Find Messages
- **Endpoint:** `GET /chat/conversations/:id/messages`
- **Deskripsi:** Mendapatkan pesan dalam percakapan
- **Authentication:** Yes (Global JwtAccessGuard)
- **Request:**
  - **CurrentUser:** `UserLogin`
  - **Params:** `ConversationParamDto` (`id`)
  - **Query:** `ChatQueryDto` (via `ChatQuerySchema`)
- **Response:**
  - `200 OK`: Daftar pesan

### 5.4 Send Message
- **Endpoint:** `POST /chat/conversations/:id/messages`
- **Deskripsi:** Mengirim pesan dalam percakapan
- **Authentication:** Yes (Global JwtAccessGuard)
- **Request:**
  - **CurrentUser:** `UserLogin`
  - **Params:** `ConversationParamDto` (`id`)
  - **Body:** `SendMessageDto` (via `SendMessageSchema`)
- **Response:**
  - `201 Created`: Pesan terkirim

### 5.5 Stream Messages (SSE)
- **Endpoint:** `SSE /chat/conversations/:id/stream`
- **Deskripsi:** Streaming realtime pesan dalam percakapan (Server-Sent Events)
- **Authentication:** Yes (Global JwtAccessGuard)
- **Request:**
  - **CurrentUser:** `UserLogin`
  - **Params:** `ConversationParamDto` (`id`)
- **Response:**
  - `200 OK`: Event stream pesan realtime

---

## 6. Notification
**Base Path:** `/notifications`
**Deskripsi:** Manajemen notifikasi pengguna

### 6.1 Find Many Notifications
- **Endpoint:** `GET /notifications`
- **Deskripsi:** Mendapatkan daftar notifikasi user
- **Authentication:** Yes (Global JwtAccessGuard)
- **Request:**
  - **CurrentUser:** `UserLogin`
  - **Query:** `NotificationQueryDto` (via `NotificationQuerySchema`)
- **Response:**
  - `200 OK`: Daftar notifikasi

### 6.2 Unread Count
- **Endpoint:** `GET /notifications/unread-count`
- **Deskripsi:** Mendapatkan jumlah notifikasi yang belum dibaca
- **Authentication:** Yes (Global JwtAccessGuard)
- **Request:**
  - **CurrentUser:** `UserLogin`
- **Response:**
  - `200 OK`: `{ count: number }`

### 6.3 Stream Notifications (SSE)
- **Endpoint:** `SSE /notifications/stream`
- **Deskripsi:** Streaming realtime notifikasi (Server-Sent Events)
- **Authentication:** Yes (Global JwtAccessGuard)
- **Request:**
  - **CurrentUser:** `UserLogin`
- **Response:**
  - `200 OK`: Event stream notifikasi realtime

### 6.4 Create Notification
- **Endpoint:** `POST /notifications`
- **Deskripsi:** Membuat notifikasi baru
- **Authentication:** Yes (Global JwtAccessGuard)
- **Request:**
  - **Body:** `CreateNotificationDto` (via `CreateNotificationSchema`)
- **Response:**
  - `201 Created`: Notifikasi terkirim

### 6.5 Mark All As Read
- **Endpoint:** `PATCH /notifications/read-all`
- **Deskripsi:** Menandai semua notifikasi sebagai sudah dibaca
- **Authentication:** Yes (Global JwtAccessGuard)
- **Request:**
  - **CurrentUser:** `UserLogin`
- **Response:**
  - `200 OK`: Semua notifikasi ditandai dibaca

### 6.6 Mark One As Read
- **Endpoint:** `PATCH /notifications/:id/read`
- **Deskripsi:** Menandai satu notifikasi sebagai sudah dibaca
- **Authentication:** Yes (Global JwtAccessGuard)
- **Request:**
  - **CurrentUser:** `UserLogin`
  - **Params:** `NotificationParamDto` (`id`)
- **Response:**
  - `200 OK`: Notifikasi ditandai dibaca

---

## 7. Finance Platform
**Base Path:** `/admin/finance`
**Deskripsi:** Endpoint finance untuk platform admin (overview keuangan platform)

### 7.1 Get Finance Overview
- **Endpoint:** `GET /admin/finance/overview`
- **Deskripsi:** Mendapatkan overview keuangan platform
- **Authentication:** Yes (`@RequireFinanceAccess('PLATFORM_ADMIN')`)
- **Request:**
  - **Query:** `FinanceOverviewQueryDto` (via `FinanceOverviewQuerySchema`)
- **Response:**
  - `200 OK`: Data overview keuangan

---

## 8. Roles
**Base Path:** `/roles`
**Deskripsi:** Manajemen roles dan permissions (Admin & Super Admin only)

### 8.1 Find All Roles
- **Endpoint:** `GET /roles`
- **Deskripsi:** Mendapatkan daftar semua role
- **Authentication:** Yes (Global JwtAccessGuard + Roles: ADMIN, SUPER_ADMIN)
- **Request:**
  - **Query:** `RoleQueryDTO` (via `roleQuerySchema`)
- **Response:**
  - `200 OK`: Daftar role

### 8.2 Find One Role
- **Endpoint:** `GET /roles/:id`
- **Deskripsi:** Mendapatkan detail role
- **Authentication:** Yes (Global JwtAccessGuard + Roles: ADMIN, SUPER_ADMIN)
- **Request:**
  - **Params:** `RoleIdParamDTO` (`id`)
- **Response:**
  - `200 OK`: Detail role
  - `404 Not Found`: Role tidak ditemukan

### 8.3 Create Role
- **Endpoint:** `POST /roles`
- **Deskripsi:** Membuat role baru
- **Authentication:** Yes (Global JwtAccessGuard + Roles: ADMIN, SUPER_ADMIN)
- **Request:**
  - **Body:** `CreateRoleDTO` (via `createRoleSchema`)
- **Response:**
  - `201 Created`: Role berhasil dibuat

### 8.4 Update Role
- **Endpoint:** `PATCH /roles/:id`
- **Deskripsi:** Memperbarui nama role
- **Authentication:** Yes (Global JwtAccessGuard + Roles: ADMIN, SUPER_ADMIN)
- **Request:**
  - **Params:** `RoleIdParamDTO` (`id`)
  - **Body:** `UpdateRoleDTO` (via `updateRoleSchema`)
- **Response:**
  - `200 OK`: Role berhasil diperbarui

### 8.5 Delete Role
- **Endpoint:** `DELETE /roles/:id`
- **Deskripsi:** Menghapus role
- **Authentication:** Yes (Global JwtAccessGuard + Roles: ADMIN, SUPER_ADMIN)
- **Request:**
  - **Params:** `RoleIdParamDTO` (`id`)
- **Response:**
  - `200 OK`: Role berhasil dihapus

### 8.6 Attach Permissions
- **Endpoint:** `POST /roles/:id/permissions`
- **Deskripsi:** Menambahkan permissions ke role
- **Authentication:** Yes (Global JwtAccessGuard + Roles: ADMIN, SUPER_ADMIN)
- **Request:**
  - **Params:** `RoleIdParamDTO` (`id`)
  - **Body:** `AttachPermissionDTO` (via `attachPermissionSchema`)
- **Response:**
  - `200 OK`: Permissions ditambahkan

### 8.7 Replace Permissions
- **Endpoint:** `PATCH /roles/:id/permissions`
- **Deskripsi:** Mengganti seluruh permissions pada role
- **Authentication:** Yes (Global JwtAccessGuard + Roles: ADMIN, SUPER_ADMIN)
- **Request:**
  - **Params:** `RoleIdParamDTO` (`id`)
  - **Body:** `ReplacePermissionDTO` (via `replacePermissionSchema`)
- **Response:**
  - `200 OK`: Permissions diganti

---

## 9. Checkout
**Base Path:** `/checkout`
**Deskripsi:** Proses checkout transaksi

### 9.1 Checkout
- **Endpoint:** `POST /checkout`
- **Deskripsi:** Melakukan checkout pesanan
- **Authentication:** Yes (Global JwtAccessGuard)
- **Request:**
  - **CurrentUser:** `UserLogin`
  - **Body:** `CheckoutDto` (via `CheckoutSchema`)
- **Response:**
  - `201 Created`: Pesanan berhasil dibuat

---

## 10. Cart
**Base Path:** `/cart`
**Deskripsi:** Manajemen keranjang belanja user

### 10.1 Get Cart
- **Endpoint:** `GET /cart`
- **Deskripsi:** Mendapatkan isi keranjang user
- **Authentication:** Yes (Global JwtAccessGuard)
- **Request:**
  - **CurrentUser:** `UserLogin`
- **Response:**
  - `200 OK`: Data keranjang

### 10.2 Add Item
- **Endpoint:** `POST /cart/items`
- **Deskripsi:** Menambahkan item ke keranjang
- **Authentication:** Yes (Global JwtAccessGuard)
- **Request:**
  - **CurrentUser:** `UserLogin`
  - **Body:** `AddCartItemDto` (via `AddCartItemSchema`)
- **Response:**
  - `201 Created`: Item ditambahkan

### 10.3 Update Item
- **Endpoint:** `PUT /cart/items/:productId`
- **Deskripsi:** Memperbarui quantity item di keranjang
- **Authentication:** Yes (Global JwtAccessGuard)
- **Request:**
  - **CurrentUser:** `UserLogin`
  - **Params:** `CartItemParamDto` (`productId`)
  - **Body:** `UpdateCartItemDto` (via `UpdateCartItemSchema`)
- **Response:**
  - `200 OK`: Item diperbarui

### 10.4 Remove Item
- **Endpoint:** `DELETE /cart/items/:productId`
- **Deskripsi:** Menghapus item dari keranjang
- **Authentication:** Yes (Global JwtAccessGuard)
- **Request:**
  - **CurrentUser:** `UserLogin`
  - **Params:** `CartItemParamDto` (`productId`)
- **Response:**
  - `200 OK`: Item dihapus

### 10.5 Clear Cart
- **Endpoint:** `DELETE /cart`
- **Deskripsi:** Mengosongkan seluruh keranjang
- **Authentication:** Yes (Global JwtAccessGuard)
- **Request:**
  - **CurrentUser:** `UserLogin`
- **Response:**
  - `200 OK`: Keranjang dikosongkan

---

## 11. Shops
**Base Path:** `/shops`
**Deskripsi:** Manajemen toko (CRUD dan pencarian toko)

### 11.1 Find All Shops
- **Endpoint:** `GET /shops`
- **Deskripsi:** Mendapatkan daftar semua toko (publik)
- **Authentication:** Yes (Global JwtAccessGuard)
- **Request:**
  - **Query:** `ShopQueryDTO` (via `ShopQuerySchema`)
- **Response:**
  - `200 OK`: Daftar toko

### 11.2 Create Shop
- **Endpoint:** `POST /shops`
- **Deskripsi:** Membuat toko baru
- **Authentication:** Yes (Global JwtAccessGuard)
- **Request:**
  - **CurrentUser:** `UserLogin`
  - **Body:** `CreateShopDTO` (via `CreateShopSchema`)
- **Response:**
  - `201 Created`: Toko berhasil dibuat

### 11.3 Find My Shop
- **Endpoint:** `GET /shops/me`
- **Deskripsi:** Mendapatkan toko milik user yang sedang login
- **Authentication:** Yes (Global JwtAccessGuard)
- **Request:**
  - **CurrentUser:** `UserLogin`
  - **Query:** `ShopQueryDTO` (via `ShopQuerySchema`)
- **Response:**
  - `200 OK`: Data toko user

### 11.4 Find One Shop
- **Endpoint:** `GET /shops/:id`
- **Deskripsi:** Mendapatkan detail toko berdasarkan ID
- **Authentication:** Yes (Global JwtAccessGuard)
- **Request:**
  - **Params:** `ShopIdParamDTO` (`id`)
- **Response:**
  - `200 OK`: Detail toko
  - `404 Not Found`: Toko tidak ditemukan

### 11.5 Update Shop
- **Endpoint:** `PATCH /shops/:id`
- **Deskripsi:** Memperbarui data toko
- **Authentication:** Yes (Global JwtAccessGuard)
- **Request:**
  - **CurrentUser:** `UserLogin`
  - **Params:** `ShopIdParamDTO` (`id`)
  - **Body:** `UpdateShopDTO` (via `UpdateShopSchema`)
- **Response:**
  - `200 OK`: Toko berhasil diperbarui

### 11.6 Delete Shop
- **Endpoint:** `DELETE /shops/:id`
- **Deskripsi:** Menghapus toko
- **Authentication:** Yes (Global JwtAccessGuard)
- **Request:**
  - **CurrentUser:** `UserLogin`
  - **Params:** `ShopIdParamDTO` (`id`)
- **Response:**
  - `200 OK`: Toko berhasil dihapus

---

## 12. Me
**Base Path:** `/me`
**Deskripsi:** Manajemen profil user yang sedang login

### 12.1 Get My Profile
- **Endpoint:** `GET /me`
- **Deskripsi:** Mendapatkan profil user yang sedang login
- **Authentication:** Yes (Global JwtAccessGuard)
- **Request:**
  - **CurrentUser:** `UserLogin`
- **Response:**
  - `200 OK`: Data profil

### 12.2 Update Profile
- **Endpoint:** `PATCH /me/update`
- **Deskripsi:** Memperbarui profil user
- **Authentication:** Yes (Global JwtAccessGuard)
- **Request:**
  - **CurrentUser:** `UserLogin`
  - **Body:** `UpdateProfileDTO` (via `UpdateProfileSchema`)
- **Response:**
  - `200 OK`: Profil berhasil diperbarui

### 12.3 Following Shops
- **Endpoint:** `GET /me/following/shops`
- **Deskripsi:** Mendapatkan daftar toko yang diikuti user
- **Authentication:** Yes (Global JwtAccessGuard)
- **Request:**
  - **CurrentUser:** `UserLogin`
  - **Query:** `UserFollowingShopDTO` (via `UserFollowingShopSchema`)
- **Response:**
  - `200 OK`: Daftar toko yang diikuti

---

## 13. Promotion Admin
**Base Path:** `/admin/promotions`
**Deskripsi:** Manajemen promosi oleh admin (CRUD)

### 13.1 Create Promotion
- **Endpoint:** `POST /admin/promotions`
- **Deskripsi:** Membuat promosi baru
- **Authentication:** Yes (JwtAccessGuard + PromotionAdminGuard)
- **Request:**
  - **Body:** `CreatePromotionSchema`
- **Response:**
  - `201 Created`: Promosi berhasil dibuat

### 13.2 List Promotions
- **Endpoint:** `GET /admin/promotions`
- **Deskripsi:** Mendapatkan daftar semua promosi
- **Authentication:** Yes (JwtAccessGuard + PromotionAdminGuard)
- **Request:**
  - **Query:** `ListPromotionsQuerySchema`
- **Response:**
  - `200 OK`: Daftar promosi

### 13.3 Find One Promotion
- **Endpoint:** `GET /admin/promotions/:id`
- **Deskripsi:** Mendapatkan detail promosi
- **Authentication:** Yes (JwtAccessGuard + PromotionAdminGuard)
- **Request:**
  - **Params:** `id`
- **Response:**
  - `200 OK`: Detail promosi

### 13.4 Update Promotion
- **Endpoint:** `PATCH /admin/promotions/:id`
- **Deskripsi:** Memperbarui promosi
- **Authentication:** Yes (JwtAccessGuard + PromotionAdminGuard)
- **Request:**
  - **Params:** `id`
  - **Body:** `UpdatePromotionSchema`
- **Response:**
  - `200 OK`: Promosi diperbarui

### 13.5 Delete Promotion
- **Endpoint:** `DELETE /admin/promotions/:id`
- **Deskripsi:** Menghapus promosi (soft delete)
- **Authentication:** Yes (JwtAccessGuard + PromotionAdminGuard)
- **Request:**
  - **Params:** `id`
- **Response:**
  - `200 OK`: Promosi dihapus

---

## 14. Promotion Public
**Base Path:** `/promotions`
**Deskripsi:** Endpoint publik untuk validasi dan melihat promosi

### 14.1 Validate Promo
- **Endpoint:** `POST /promotions/validate`
- **Deskripsi:** Memvalidasi kode promosi
- **Authentication:** Yes (JwtAccessGuard)
- **Request:**
  - **Body:** `ValidatePromoQuerySchema`
- **Response:**
  - `200 OK`: Hasil validasi

### 14.2 List Active Promotions
- **Endpoint:** `GET /promotions/active`
- **Deskripsi:** Mendapatkan promosi yang aktif
- **Authentication:** No (Public)
- **Request:**
  - **Query:** `shopId` (optional)
- **Response:**
  - `200 OK`: Daftar promosi aktif

---

## 15. Shop Finance
**Base Path:** Dynamic — path parameter `:shopId`
**Deskripsi:** Manajemen keuangan toko (balance, ledger, payout) — akses berdasarkan role member toko

### 15.1 Get Balance
- **Endpoint:** `GET /:shopId/balance`
- **Deskripsi:** Mendapatkan saldo toko
- **Authentication:** Yes (ShopMemberGuard + MinRole: ADMIN)
- **Request:**
  - **Params:** `FinanceShopIdParamDTO` (`shopId`)
- **Response:**
  - `200 OK`: Data saldo

### 15.2 Get Ledger
- **Endpoint:** `GET /:shopId/ledger`
- **Deskripsi:** Mendapatkan catatan transaksi toko
- **Authentication:** Yes (ShopMemberGuard + MinRole: ADMIN)
- **Request:**
  - **Params:** `FinanceShopIdParamDTO` (`shopId`)
  - **Query:** `LedgerQueryDTO` (via `LedgerQuerySchema`)
- **Response:**
  - `200 OK`: Data ledger

### 15.3 Request Payout
- **Endpoint:** `POST /:shopId/payout`
- **Deskripsi:** Mengajukan pencairan dana toko
- **Authentication:** Yes (ShopMemberGuard + MinRole: OWNER)
- **Request:**
  - **Params:** `FinanceShopIdParamDTO` (`shopId`)
  - **Body:** `CreatePayoutDTO` (via `CreatePayoutSchema`)
- **Response:**
  - `201 Created`: Payout diajukan

### 15.4 Find Payouts
- **Endpoint:** `GET /:shopId/payouts`
- **Deskripsi:** Mendapatkan riwayat payout toko
- **Authentication:** Yes (ShopMemberGuard + MinRole: ADMIN)
- **Request:**
  - **Params:** `FinanceShopIdParamDTO` (`shopId`)
  - **Query:** `PayoutQueryDTO` (via `PayoutQuerySchema`)
- **Response:**
  - `200 OK`: Daftar payout

---

## 16. Shop Order
**Base Path:** Dynamic — path parameter `:shopId`
**Deskripsi:** Manajemen pesanan dari sisi toko (seller)

### 16.1 Find All Orders
- **Endpoint:** `GET /:shopId`
- **Deskripsi:** Mendapatkan daftar pesanan toko
- **Authentication:** Yes (ShopMemberGuard + MinRole: STAFF)
- **Request:**
  - **Params:** `ShopIdParamDTO` (`shopId`)
  - **Query:** `OrderQueryDTO` (via `OrderQuerySchema`)
- **Response:**
  - `200 OK`: Daftar pesanan

### 16.2 Find One Order
- **Endpoint:** `GET /:shopId/:id`
- **Deskripsi:** Mendapatkan detail pesanan
- **Authentication:** Yes (ShopMemberGuard + MinRole: STAFF)
- **Request:**
  - **Params:** `ShopIdParamDTO & OrderIdParamDTO` (`shopId`, `id`)
- **Response:**
  - `200 OK`: Detail pesanan

### 16.3 Update Order Status
- **Endpoint:** `PATCH /:shopId/:id/status`
- **Deskripsi:** Memperbarui status pesanan
- **Authentication:** Yes (ShopMemberGuard + MinRole: ADMIN)
- **Request:**
  - **Params:** `ShopIdParamDTO & OrderIdParamDTO` (`shopId`, `id`)
  - **Body:** `UpdateOrderStatusDTO` (via `UpdateOrderStatusSchema`)
- **Response:**
  - `200 OK`: Status diperbarui

### 16.4 Update Refund
- **Endpoint:** `PATCH /:shopId/:id/refund/:refundId`
- **Deskripsi:** Memperbarui status refund pesanan
- **Authentication:** Yes (ShopMemberGuard + MinRole: OWNER)
- **Request:**
  - **Params:** `RefundParamDTO` (`shopId`, `id`, `refundId`)
- **Response:**
  - `200 OK`: Refund diperbarui

---

## 17. Commerce Order
**Base Path:** `/orders`
**Deskripsi:** Manajemen pesanan dari sisi pembeli

### 17.1 Find My Orders
- **Endpoint:** `GET /orders`
- **Deskripsi:** Mendapatkan daftar pesanan user yang login
- **Authentication:** Yes (Global JwtAccessGuard)
- **Request:**
  - **CurrentUser:** `UserLogin`
  - **Query:** `OrderQueryDto` (via `OrderQuerySchema`)
- **Response:**
  - `200 OK`: Daftar pesanan

### 17.2 Find Shop Orders
- **Endpoint:** `GET /orders/shop/:shopId`
- **Deskripsi:** Mendapatkan daftar pesanan berdasarkan toko (untuk SELLER)
- **Authentication:** Yes (Global JwtAccessGuard + Roles: SELLER)
- **Request:**
  - **Params:** `shopId`
  - **Query:** `OrderQueryDto` (via `OrderQuerySchema`)
- **Response:**
  - `200 OK`: Daftar pesanan

### 17.3 Find Order By ID
- **Endpoint:** `GET /orders/:orderId`
- **Deskripsi:** Mendapatkan detail pesanan berdasarkan ID
- **Authentication:** Yes (Global JwtAccessGuard)
- **Request:**
  - **Params:** `OrderIdParamDto` (`orderId`)
- **Response:**
  - `200 OK`: Detail pesanan

### 17.4 Update Order Status
- **Endpoint:** `PATCH /orders/:orderId/status`
- **Deskripsi:** Memperbarui status pesanan (untuk SELLER)
- **Authentication:** Yes (Global JwtAccessGuard + Roles: SELLER)
- **Request:**
  - **Params:** `OrderIdParamDto` (`orderId`)
  - **Body:** `UpdateOrderStatusDto` (via `UpdateOrderStatusSchema`)
- **Response:**
  - `200 OK`: Status diperbarui

### 17.5 Payment Callback
- **Endpoint:** `POST /orders/payment-callback`
- **Deskripsi:** Callback dari payment gateway
- **Authentication:** Yes (Global JwtAccessGuard)
- **Request:**
  - **Body:** `PaymentCallbackDto` (via `PaymentCallbackSchema`)
- **Response:**
  - `200 OK`: Callback diproses

### 17.6 Create Refund
- **Endpoint:** `POST /orders/refund`
- **Deskripsi:** Membuat refund pesanan (untuk ADMIN)
- **Authentication:** Yes (Global JwtAccessGuard + Roles: ADMIN)
- **Request:**
  - **Body:** `CreateRefundDto` (via `CreateRefundSchema`)
- **Response:**
  - `201 Created`: Refund dibuat

---

## 18. Users
**Base Path:** `/users`
**Deskripsi:** Manajemen pengguna oleh admin

### 18.1 Find All Users
- **Endpoint:** `GET /users`
- **Deskripsi:** Mendapatkan daftar semua user
- **Authentication:** Yes (Global JwtAccessGuard + Roles: ADMIN, SUPER_ADMIN)
- **Request:**
  - **Query:** `UserQueryDTO` (via `userQuerySchema`)
- **Response:**
  - `200 OK`: Daftar user

### 18.2 Find One User
- **Endpoint:** `GET /users/:id`
- **Deskripsi:** Mendapatkan detail user
- **Authentication:** Yes (Global JwtAccessGuard + Roles: SUPER_ADMIN)
- **Request:**
  - **Params:** `UserIdParamDTO` (`id`)
- **Response:**
  - `200 OK`: Detail user

### 18.3 Create User
- **Endpoint:** `POST /users`
- **Deskripsi:** Membuat user baru oleh admin
- **Authentication:** Yes (Global JwtAccessGuard + Roles: ADMIN, SUPER_ADMIN)
- **Request:**
  - **Body:** `CreateUserDTO` (via `createUserSchema`)
- **Response:**
  - `201 Created`: User berhasil dibuat

### 18.4 Update User
- **Endpoint:** `PATCH /users/:id`
- **Deskripsi:** Memperbarui data user
- **Authentication:** Yes (Global JwtAccessGuard)
- **Request:**
  - **Params:** `UserIdParamDTO` (`id`)
  - **Body:** `UpdateUserDTO` (via `updateUserSchema`)
- **Response:**
  - `200 OK`: User diperbarui

### 18.5 Delete Account
- **Endpoint:** `DELETE /users/delete`
- **Deskripsi:** Menghapus akun user sendiri
- **Authentication:** Yes (Global JwtAccessGuard)
- **Request:**
  - **CurrentUser:** `UserLogin`
- **Response:**
  - `200 OK`: Akun dihapus

### 18.6 Verify Delete
- **Endpoint:** `DELETE /users/delete/verify`
- **Deskripsi:** Verifikasi penghapusan akun
- **Authentication:** Yes (Global JwtAccessGuard)
- **Request:**
  - **Body:** `VerifyDeleteDTO` (via `VerifyDeleteSchema`)
- **Response:**
  - `200 OK`: Verifikasi berhasil

---

## 19. Shop Member
**Base Path:** Dynamic — path parameter `:shopId`
**Deskripsi:** Manajemen anggota toko (staff, admin, owner)

### 19.1 Add Member
- **Endpoint:** `POST /:shopId`
- **Deskripsi:** Menambahkan anggota ke toko
- **Authentication:** Yes (ShopMemberGuard + MinRole: OWNER)
- **Request:**
  - **CurrentUser:** `UserLogin`
  - **Params:** `ShopMemberShopIdParamDTO` (`shopId`)
  - **Body:** `AddMemberDTO` (via `AddMemberSchema`)
- **Response:**
  - `201 Created`: Anggota ditambahkan

### 19.2 Find Members
- **Endpoint:** `GET /:shopId`
- **Deskripsi:** Mendapatkan daftar anggota toko
- **Authentication:** Yes (ShopMemberGuard + MinRole: ADMIN)
- **Request:**
  - **Params:** `ShopMemberShopIdParamDTO` (`shopId`)
  - **Query:** `ShopMemberQueryDTO` (via `ShopMemberQuerySchema`)
- **Response:**
  - `200 OK`: Daftar anggota

### 19.3 Find One Member
- **Endpoint:** `GET /:shopId/:memberId`
- **Deskripsi:** Mendapatkan detail anggota toko
- **Authentication:** Yes (ShopMemberGuard + MinRole: ADMIN)
- **Request:**
  - **Params:** `ShopMemberIdParamDTO` (`shopId`, `memberId`)
- **Response:**
  - `200 OK`: Detail anggota

### 19.4 Update Member Role
- **Endpoint:** `PATCH /:shopId/:memberId`
- **Deskripsi:** Mengubah role anggota toko
- **Authentication:** Yes (ShopMemberGuard + MinRole: OWNER)
- **Request:**
  - **Params:** `ShopMemberIdParamDTO` (`shopId`, `memberId`)
  - **Body:** `UpdateMemberRoleDTO` (via `UpdateMemberRoleSchema`)
- **Response:**
  - `200 OK`: Role diperbarui

### 19.5 Delete Member
- **Endpoint:** `DELETE /:shopId/:memberId`
- **Deskripsi:** Menghapus anggota dari toko
- **Authentication:** Yes (ShopMemberGuard + MinRole: OWNER)
- **Request:**
  - **CurrentUser:** `UserLogin`
  - **Params:** `ShopMemberIdParamDTO` (`shopId`, `memberId`)
- **Response:**
  - `200 OK`: Anggota dihapus

---

## 20. Shop Dashboard
**Base Path:** Dynamic — path parameter `:shopId`
**Deskripsi:** Dashboard analytics untuk toko

### 20.1 Get Summary
- **Endpoint:** `GET /:shopId/summary`
- **Deskripsi:** Mendapatkan ringkasan dashboard toko
- **Authentication:** Yes (ShopMemberGuard + MinRole: STAFF)
- **Request:**
  - **Params:** `ShopIdParamDTO` (`shopId`)
- **Response:**
  - `200 OK`: Data ringkasan

### 20.2 Get Revenue
- **Endpoint:** `GET /:shopId/revenue`
- **Deskripsi:** Mendapatkan data revenue toko
- **Authentication:** Yes (ShopMemberGuard + MinRole: OWNER)
- **Request:**
  - **Params:** `ShopIdParamDTO` (`shopId`)
  - **Query:** `RevenueQueryDTO` (via `RevenueQuerySchema`)
- **Response:**
  - `200 OK`: Data revenue

### 20.3 Get Recent Orders
- **Endpoint:** `GET /:shopId/recent-orders`
- **Deskripsi:** Mendapatkan pesanan terbaru toko
- **Authentication:** Yes (ShopMemberGuard + MinRole: STAFF)
- **Request:**
  - **Params:** `ShopIdParamDTO` (`shopId`)
  - **Query:** `RecentOrdersQueryDTO` (via `RecentOrdersQuerySchema`)
- **Response:**
  - `200 OK`: Daftar pesanan terbaru

---

## 21. Shops Ledger
**Base Path:** `/shops/:shopId/finance`
**Deskripsi:** Catatan transaksi/ledger untuk toko tertentu (akses platform admin & shop owner)

### 21.1 Get Ledgers
- **Endpoint:** `GET /shops/:shopId/finance/ledgers`
- **Deskripsi:** Mendapatkan daftar ledger toko
- **Authentication:** Yes (`@RequireFinanceAccess('PLATFORM_ADMIN', 'SHOP_OWNER')`)
- **Request:**
  - **Params:** `shopId`
  - **Query:** `ListLedgersQueryDto` (via `ListLedgersQuerySchema`)
- **Response:**
  - `200 OK`: Daftar ledger

---

## 22. Shop Follower
**Base Path:** Dynamic — path parameter `:shopId`
**Deskripsi:** Fitur follow/unfollow toko

### 22.1 Follow Shop
- **Endpoint:** `POST /:shopId/follow`
- **Deskripsi:** Mengikuti toko
- **Authentication:** Yes (Global JwtAccessGuard)
- **Request:**
  - **CurrentUser:** `UserLogin`
  - **Params:** `FollowerShopIdParamDTO` (`shopId`)
- **Response:**
  - `201 Created`: Berhasil follow

### 22.2 Unfollow Shop
- **Endpoint:** `DELETE /:shopId/follow`
- **Deskripsi:** Berhenti mengikuti toko
- **Authentication:** Yes (Global JwtAccessGuard)
- **Request:**
  - **CurrentUser:** `UserLogin`
  - **Params:** `FollowerShopIdParamDTO` (`shopId`)
- **Response:**
  - `200 OK`: Berhasil unfollow

### 22.3 Find Followers
- **Endpoint:** `GET /:shopId/followers`
- **Deskripsi:** Mendapatkan daftar pengikut toko
- **Authentication:** Yes (Global JwtAccessGuard)
- **Request:**
  - **Params:** `FollowerShopIdParamDTO` (`shopId`)
  - **Query:** `FollowerQueryDTO` (via `FollowerQuerySchema`)
- **Response:**
  - `200 OK`: Daftar pengikut

### 22.4 Find Following
- **Endpoint:** `GET /:shopId/following`
- **Deskripsi:** Mendapatkan daftar toko yang diikuti user
- **Authentication:** Yes (Global JwtAccessGuard)
- **Request:**
  - **CurrentUser:** `UserLogin`
  - **Query:** `MyFollowingQueryDTO` (via `MyFollowingQuerySchema`)
- **Response:**
  - `200 OK`: Daftar toko yang diikuti

---

## 23. Shop Banner
**Base Path:** Dynamic — path parameter `:shopId`
**Deskripsi:** Manajemen banner untuk toko

### 23.1 Find All Banners
- **Endpoint:** `GET /:shopId`
- **Deskripsi:** Mendapatkan daftar banner toko
- **Authentication:** Yes (ShopMemberGuard + MinRole: STAFF)
- **Request:**
  - **Params:** `ShopBannerShopIdParamDTO` (`shopId`)
  - **Query:** `ShopBannerQueryDTO` (via `ShopBannerQuerySchema`)
- **Response:**
  - `200 OK`: Daftar banner

### 23.2 Find One Banner
- **Endpoint:** `GET /:shopId/:id`
- **Deskripsi:** Mendapatkan detail banner toko
- **Authentication:** Yes (ShopMemberGuard + MinRole: STAFF)
- **Request:**
  - **Params:** `ShopBannerIdParamDTO` (`shopId`, `id`)
- **Response:**
  - `200 OK`: Detail banner

### 23.3 Create Banner
- **Endpoint:** `POST /:shopId`
- **Deskripsi:** Membuat banner baru untuk toko
- **Authentication:** Yes (ShopMemberGuard + MinRole: ADMIN)
- **Request:**
  - **Params:** `ShopBannerShopIdParamDTO` (`shopId`)
  - **Body:** `CreateShopBannerDTO` (via `CreateShopBannerSchema`)
- **Response:**
  - `201 Created`: Banner dibuat

### 23.4 Update Banner
- **Endpoint:** `PATCH /:shopId/:id`
- **Deskripsi:** Memperbarui banner toko
- **Authentication:** Yes (ShopMemberGuard + MinRole: ADMIN)
- **Request:**
  - **Params:** `ShopBannerIdParamDTO` (`shopId`, `id`)
  - **Body:** `UpdateShopBannerDTO` (via `UpdateShopBannerSchema`)
- **Response:**
  - `200 OK`: Banner diperbarui

### 23.5 Delete Banner
- **Endpoint:** `DELETE /:shopId/:id`
- **Deskripsi:** Menghapus banner toko
- **Authentication:** Yes (ShopMemberGuard + MinRole: OWNER)
- **Request:**
  - **Params:** `ShopBannerIdParamDTO` (`shopId`, `id`)
- **Response:**
  - `200 OK`: Banner dihapus

---

## 24. Payout
**Base Path:** Mixed paths
**Deskripsi:** Manajemen payout (pencairan dana) — untuk shop owner dan admin platform

### 24.1 Get Shop Payouts
- **Endpoint:** `GET /shops/:shopId/finance/payouts`
- **Deskripsi:** Mendapatkan daftar payout toko
- **Authentication:** Yes (`@RequireFinanceAccess('SHOP_OWNER', 'PLATFORM_ADMIN')`)
- **Request:**
  - **Params:** `shopId`
  - **Query:** `ListPayoutsQueryDto` (via `ListPayoutsQuerySchema`)
- **Response:**
  - `200 OK`: Daftar payout

### 24.2 Request Payout
- **Endpoint:** `POST /shops/:shopId/finance/payouts/request`
- **Deskripsi:** Mengajukan pencairan dana (shop owner)
- **Authentication:** Yes (`@RequireFinanceAccess('SHOP_OWNER')`)
- **Request:**
  - **CurrentUser:** `UserPayload`
  - **Params:** `shopId`
  - **Body:** `CreatePayoutRequestDto` (via `CreatePayoutRequestSchema`)
- **Response:**
  - `201 Created`: Payout diajukan

### 24.3 Approve Payout
- **Endpoint:** `PATCH /admin/finance/payouts/:id/approve`
- **Deskripsi:** Menyetujui payout (platform admin)
- **Authentication:** Yes (`@RequireFinanceAccess('PLATFORM_ADMIN')`)
- **Request:**
  - **CurrentUser:** `UserPayload` (admin)
  - **Params:** `id`
  - **Body:** `ApprovePayoutDto` (via `ApprovePayoutSchema`)
- **Response:**
  - `200 OK`: Payout disetujui

### 24.4 Reject Payout
- **Endpoint:** `PATCH /admin/finance/payouts/:id/reject`
- **Deskripsi:** Menolak payout (platform admin)
- **Authentication:** Yes (`@RequireFinanceAccess('PLATFORM_ADMIN')`)
- **Request:**
  - **Params:** `id`
  - **Body:** `RejectPayoutDto` (via `RejectPayoutSchema`)
- **Response:**
  - `200 OK`: Payout ditolak

---

## 25. Shop Application
**Base Path:** Dynamic — path parameter `:shopId`
**Deskripsi:** Pengajuan aplikasi/verifikasi toko

### 25.1 Create Application
- **Endpoint:** `POST /:shopId`
- **Deskripsi:** Membuat aplikasi pengajuan toko
- **Authentication:** Yes (Global JwtAccessGuard)
- **Request:**
  - **Params:** `ShopApplicationShopIdParamDTO` (`shopId`)
  - **Body:** `CreateShopApplicationDTO` (via `CreateShopApplicationSchema`)
- **Response:**
  - `201 Created`: Aplikasi dibuat

### 25.2 Update Application
- **Endpoint:** `PATCH /:shopId`
- **Deskripsi:** Memperbarui aplikasi pengajuan toko
- **Authentication:** Yes (Global JwtAccessGuard)
- **Request:**
  - **Params:** `ShopApplicationShopIdParamDTO` (`shopId`)
  - **Body:** `CreateShopApplicationDTO` (via `CreateShopApplicationSchema`)
- **Response:**
  - `200 OK`: Aplikasi diperbarui

### 25.3 Review Application
- **Endpoint:** `PATCH /:shopId/review`
- **Deskripsi:** Mereview aplikasi toko (SUPER_ADMIN only)
- **Authentication:** Yes (Global JwtAccessGuard + Roles: SUPER_ADMIN)
- **Request:**
  - **Params:** `ShopApplicationShopIdParamDTO` (`shopId`)
  - **Body:** `ReviewShopApplicationDTO` (via `ReviewShopApplicationSchema`)
- **Response:**
  - `200 OK`: Aplikasi direview

---

## 26. Refund
**Base Path:** Mixed paths
**Deskripsi:** Manajemen refund — untuk shop owner dan admin platform

### 26.1 Get Shop Refunds
- **Endpoint:** `GET /shops/:shopId/finance/refunds`
- **Deskripsi:** Mendapatkan daftar refund toko
- **Authentication:** Yes (`@RequireFinanceAccess('SHOP_OWNER')`)
- **Request:**
  - **Params:** `shopId`
  - **Query:** `ListRefundsQueryDto` (via `ListRefundsQuerySchema`)
- **Response:**
  - `200 OK`: Daftar refund

### 26.2 Request Shop Refund
- **Endpoint:** `POST /shops/:shopId/finance/refunds`
- **Deskripsi:** Mengajukan refund dari toko
- **Authentication:** Yes (`@RequireFinanceAccess('SHOP_OWNER')`)
- **Request:**
  - **Params:** `shopId`
  - **Body:** `CreateRefundDto` (via `CreateRefundSchema`)
- **Response:**
  - `201 Created`: Refund diajukan

### 26.3 Get All Refunds (Admin)
- **Endpoint:** `GET /admin/finance/refunds`
- **Deskripsi:** Mendapatkan semua refund (platform admin)
- **Authentication:** Yes (`@RequireFinanceAccess('PLATFORM_ADMIN')`)
- **Request:**
  - **Query:** `ListRefundsQueryDto` (via `ListRefundsQuerySchema`)
- **Response:**
  - `200 OK`: Daftar semua refund

### 26.4 Request Admin Refund
- **Endpoint:** `POST /admin/finance/refunds`
- **Deskripsi:** Membuat refund dari admin platform
- **Authentication:** Yes (`@RequireFinanceAccess('PLATFORM_ADMIN')`)
- **Request:**
  - **Body:** `CreateRefundDto` (via `CreateRefundSchema`)
- **Response:**
  - `201 Created`: Refund dibuat

### 26.5 Approve Refund
- **Endpoint:** `PATCH /admin/finance/refunds/:id/approve`
- **Deskripsi:** Menyetujui refund (platform admin)
- **Authentication:** Yes (`@RequireFinanceAccess('PLATFORM_ADMIN')`)
- **Request:**
  - **Params:** `id`
  - **Body:** `ApproveRefundDto` (via `ApproveRefundSchema`)
- **Response:**
  - `200 OK`: Refund disetujui

### 26.6 Reject Refund
- **Endpoint:** `PATCH /admin/finance/refunds/:id/reject`
- **Deskripsi:** Menolak refund (platform admin)
- **Authentication:** Yes (`@RequireFinanceAccess('PLATFORM_ADMIN')`)
- **Request:**
  - **Params:** `id`
  - **Body:** `ApproveRefundDto` (via `ApproveRefundSchema`)
- **Response:**
  - `200 OK`: Refund ditolak

### 26.7 Force Approve Refund
- **Endpoint:** `POST /admin/finance/refunds/:id/force-approve`
- **Deskripsi:** Memaksa menyetujui refund (platform admin)
- **Authentication:** Yes (`@RequireFinanceAccess('PLATFORM_ADMIN')`)
- **Request:**
  - **Params:** `id`
  - **Body:** `ForceRefundDto` (via `ForceRefundSchema`)
- **Response:**
  - `200 OK`: Refund dipaksa disetujui

---

## 27. Payment Admin
**Base Path:** `/admin/finance`
**Deskripsi:** Manajemen pembayaran oleh admin platform

### 27.1 Get All Payments
- **Endpoint:** `GET /admin/finance/payments`
- **Deskripsi:** Mendapatkan daftar semua pembayaran
- **Authentication:** Yes (`@RequireFinanceAccess('PLATFORM_ADMIN')`)
- **Request:**
  - **Query:** `ListPaymentsQueryDto` (via `ListPaymentsQuerySchema`)
- **Response:**
  - `200 OK`: Daftar pembayaran

### 27.2 Update Payment Status
- **Endpoint:** `PATCH /admin/finance/payments/:id/status`
- **Deskripsi:** Memperbarui status pembayaran
- **Authentication:** Yes (`@RequireFinanceAccess('PLATFORM_ADMIN')`)
- **Request:**
  - **Params:** `id`
  - **Body:** `UpdatePaymentStatusDto` (via `UpdatePaymentStatusSchema`)
- **Response:**
  - `200 OK`: Status diperbarui

---

## 28. Stripe Payment
**Base Path:** `/payments/stripe`
**Deskripsi:** Integrasi pembayaran Stripe

### 28.1 Create Payment Intent
- **Endpoint:** `POST /payments/stripe/create-intent`
- **Deskripsi:** Membuat payment intent Stripe
- **Authentication:** Yes (Global JwtAccessGuard)
- **Request:**
  - **CurrentUser:** `UserLogin`
  - **Body:** `CreateStripeIntentDto` (via `CreateStripeIntentSchema`)
- **Response:**
  - `201 Created`: Payment intent dibuat

### 28.2 Stripe Webhook
- **Endpoint:** `POST /payments/stripe/webhook`
- **Deskripsi:** Webhook handler dari Stripe
- **Authentication:** No (Public)
- **Request:**
  - **Headers:** `stripe-signature`
  - **Body:** Raw request buffer
- **Response:**
  - `200 OK`: Webhook diproses

### 28.3 Payment Success
- **Endpoint:** `GET /payments/stripe/success`
- **Deskripsi:** Halaman redirect setelah pembayaran sukses
- **Authentication:** No (Public)
- **Request:**
  - **Query:** `session_id`
- **Response:**
  - `200 OK`: Redirect/success page

### 28.4 Payment Cancel
- **Endpoint:** `GET /payments/stripe/cancel`
- **Deskripsi:** Halaman redirect setelah pembayaran dibatalkan
- **Authentication:** No (Public)
- **Request:**
  - **Query:** `session_id`
- **Response:**
  - `200 OK`: Redirect/cancel page

---

## 📝 Catatan Tambahan

### Global Configuration
- **Global Guards:**
  - `JwtAccessGuard` (global) — ALL endpoints require JWT authentication by default, kecuali yang memiliki decorator `@Public()`.
  - `RolesGuard` (global) — memvalidasi role-based access untuk decorator `@Roles()`.
- **Global Prefix:** Tidak ada (`app.setGlobalPrefix()` tidak digunakan).
- **Global Interceptor:** `ResponseInterceptor` — membungkus response dalam format standar.
- **Global Exception Filter:** `GlobalExceptionFilter` — menangani error secara global.
- **Middleware:** `CorrelationIdMiddleware` & `RequestLoggerMiddleware` — applied ke semua routes.
- **Validation:** Menggunakan `ZodValidationPipe` untuk validasi request body, params, dan query.
- **Messaging:** Terhubung ke RabbitMQ untuk event bus.

### Authentication & Authorization Flow
1. **JwtAccessGuard** (global) — memvalidasi access token JWT dari header `Authorization`.
2. **RolesGuard** (global) — mengecek decorator `@Roles(...)` pada handler/controller.
3. **@Public()** — mengecualikan endpoint dari JwtAccessGuard global.
4. **@Roles('ADMIN', 'SUPER_ADMIN')** — endpoint hanya untuk role tertentu.
5. **@UseGuards(ShopMemberGuard)** + **@MinRole('STAFF'|'ADMIN'|'OWNER')** — akses berdasarkan keanggotaan toko.
6. **@RequireFinanceAccess('PLATFORM_ADMIN', 'SHOP_OWNER')** — decorator custom untuk akses finance.

### DTO / Validation Schemas Utama
- `src/modules/auth/auth.dto.ts` — RegisterDTO, LoginDTO, VerifyEmailDTO, ForgotPasswordDTO, ChangePasswordDTO, etc.
- `src/modules/banner/banner.dto.ts` — CreateBannerDTO, UpdateBannerDTO, BannerQueryDTO, BannerIdParamDTO
- `src/modules/chat/chat.dto.ts` — ChatQueryDto, ConversationParamDto, CreateConversationDto, SendMessageDto
- `src/modules/notification/notification.dto.ts` — CreateNotificationDto, NotificationParamDto, NotificationQueryDto
- `src/modules/commerce/cart/cart.dto.ts` — AddCartItemDto, UpdateCartItemDto, CartItemParamDto
- `src/modules/commerce/checkout/checkout.dto.ts` — CheckoutDto
- `src/modules/commerce/order/dto/order.dto.ts` — OrderQueryDto, OrderIdParamDto, UpdateOrderStatusDto, PaymentCallbackDto, CreateRefundDto
- `src/modules/identity/users/users.dto.ts` — UserQueryDTO, UserIdParamDTO, CreateUserDTO, UpdateUserDTO
- `src/modules/identity/roles/roles.dto.ts` — RoleQueryDTO, RoleIdParamDTO, CreateRoleDTO, UpdateRoleDTO, AttachPermissionDTO, ReplacePermissionDTO
- `src/modules/identity/me/me.dto.ts` — UpdateProfileDTO, UserFollowingShopDTO
- `src/modules/shops/shops.dto.ts` — CreateShopDTO, UpdateShopDTO, ShopIdParamDTO, ShopQueryDTO
- `src/modules/shops/finance/finance.dto.ts` — FinanceShopIdParamDTO, LedgerQueryDTO, CreatePayoutDTO, PayoutQueryDTO
- `src/modules/shops/order/order.dto.ts` — OrderQueryDTO, OrderIdParamDTO, UpdateOrderStatusDTO, RefundParamDTO
- `src/modules/shops/member/member.dto.ts` — AddMemberDTO, UpdateMemberRoleDTO, ShopMemberShopIdParamDTO, ShopMemberIdParamDTO
- `src/modules/shops/dashboard/dashboard.dto.ts` — ShopIdParamDTO, RecentOrdersQueryDTO, RevenueQueryDTO
- `src/modules/shops/follower/follower.dto.ts` — FollowerShopIdParamDTO, FollowerQueryDTO, MyFollowingQueryDTO
- `src/modules/shops/banner/banner.dto.ts` — ShopBannerShopIdParamDTO, ShopBannerIdParamDTO, ShopBannerQueryDTO, CreateShopBannerDTO, UpdateShopBannerDTO
- `src/modules/shops/application/application.dto.ts` — CreateShopApplicationDTO, ReviewShopApplicationDTO, ShopApplicationQueryDTO, ShopApplicationShopIdParamDTO
- `src/modules/finance/finance.dto.ts` — FinanceOverviewQueryDto
- `src/modules/promotion/promotion.dto.ts` — CreatePromotionSchema, ListPromotionsQuerySchema, UpdatePromotionSchema, ValidatePromoQuerySchema
- `src/modules/finance/ledger/dto/index.ts` — ListLedgersQueryDto
- `src/modules/finance/payout/payout.dto.ts` — CreatePayoutRequestDto, ApprovePayoutDto, RejectPayoutDto, ListPayoutsQueryDto
- `src/modules/finance/payment/payment.dto.ts` — CreateStripeIntentDto, ListPaymentsQueryDto, UpdatePaymentStatusDto
- `src/modules/finance/refund/refund.dto.ts` — ListRefundsQueryDto, CreateRefundDto, ApproveRefundDto, ForceRefundDto

### Prisma ORM & Database
- **ORM:** Prisma dengan adapter MariaDB.
- **Schema:** `prisma/schema.prisma`.
- **Seeders:** user, shop, promotion, order, role, payout, notification, ledger, banner, follower.

### Environment & Deployment
- **Port:** `3000` (default, dapat diubah via env `PORT`).
- **RabbitMQ:** Terhubung ke `amqp://guest:guest@rabbitmq:5672/` (default, dapat diubah via env).
- **Queue:** `greenly_queue` (default).
- **Docker:** Tersedia `Dockerfile.dev` dan `docker-compose.yml` di root project.
- **No Swagger:** Tidak menggunakan Swagger/OpenAPI. Dokumentasi ini dibuat dari analisis kode sumber.
