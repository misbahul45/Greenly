# Auth API

Base path: `https://greenly-api.duckdns.org/api/core`

---

### POST /api/core/auth/register

**Deskripsi:** Mendaftarkan user baru.

**Autentikasi:** Tidak ada (public)

**Request Body:**
```json
{
  "name": "string — required, min 3, max 100",
  "email": "string — required, valid email, akan di-lowercase",
  "password": "string — required, min 8, max 100",
  "confirmPassword": "string — required, harus sama dengan password"
}
```

**Response — Success (201)**
```json
{
  "status": "success",
  "statusCode": 201,
  "message": "User registered",
  "data": {
    "id": "string",
    "email": "string",
    "name": "string"
  }
}
```

**Response — Error (400)**
```json
{
  "status": false,
  "statusCode": 400,
  "message": "Account already existed",
  "errors": null
}
```

**Sumber kode:** `src/modules/auth/auth.controller.ts:42`, `src/modules/auth/auth.dto.ts:4`

---

### POST /api/core/auth/login

**Deskripsi:** Login user.

**Autentikasi:** Tidak ada (public)

**Request Body:**
```json
{
  "email": "string — required, valid email, akan di-lowercase",
  "password": "string — required"
}
```

**Response — Success (200)**
```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Login successful",
  "data": {
    "tokens": {
      "accessToken": "string (JWT)",
      "refreshToken": "string (JWT)"
    },
    "user": {
      "id": "string",
      "name": "string",
      "email": "string",
      "roles": ["string"]
    }
  }
}
```

**Response — Error (404)**
```json
{
  "status": false,
  "statusCode": 404,
  "message": "User not found",
  "errors": null
}
```

**Response — Error (401)**
```json
{
  "status": false,
  "statusCode": 401,
  "message": "Invalid email or password",
  "errors": null
}
```

**Response — Error (403)**
```json
{
  "status": false,
  "statusCode": 403,
  "message": "Your email is not verified. Please verify to continue.",
  "errors": null
}
```

**Sumber kode:** `src/modules/auth/auth.controller.ts:49`, `src/modules/auth/auth.dto.ts:30`

---

### POST /api/core/auth/refresh-token

**Deskripsi:** Memperbarui access token menggunakan refresh token.

**Autentikasi:** Bearer JWT (refresh token via header)

**Headers:**
| Header | Wajib | Keterangan |
|--------|-------|------------|
| Authorization | Ya | `Bearer <refreshToken>` |

**Response — Success (200)**
```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Successfully refresh token",
  "data": {
    "accessToken": "string (JWT)",
    "refreshToken": "string (JWT)"
  }
}
```

**Response — Error (403)**
```json
{
  "status": false,
  "statusCode": 403,
  "message": "Invalid refresh token",
  "errors": null
}
```

**Sumber kode:** `src/modules/auth/auth.controller.ts:57`, `src/modules/auth/guards/jwt.refresh.guard.ts`

---

### POST /api/core/auth/verify-email

**Deskripsi:** Verifikasi email menggunakan OTP token.

**Autentikasi:** Tidak ada (public)

**Request Body:**
```json
{
  "token": "string — required, min 6 karakter (OTP)"
}
```

**Response — Success (200)**
```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Email verified successfully",
  "data": {
    "user": {
      "id": "string",
      "email": "string",
      "name": "string",
      "roles": ["string"]
    },
    "tokens": {
      "accessToken": "string (JWT)",
      "refreshToken": "string (JWT)"
    }
  }
}
```

**Response — Error (404)**
```json
{
  "status": false,
  "statusCode": 404,
  "message": "Token verification not found",
  "errors": null
}
```

**Sumber kode:** `src/modules/auth/auth.controller.ts:72`, `src/modules/auth/auth.dto.ts:45`

---

### POST /api/core/auth/verify-password

**Deskripsi:** Verifikasi token reset password.

**Autentikasi:** Tidak ada (public)

**Request Body:**
```json
{
  "token": "string — required, min 6 karakter (OTP)"
}
```

**Response — Success (200)**
```json
{
  "status": "success",
  "message": "Token verified successfully",
  "data": {
    "id": "string",
    "userId": "string",
    "tokenHash": "string",
    "type": "RESET_PASSWORD",
    "expiresAt": "datetime",
    "usedAt": "datetime",
    "createdAt": "datetime"
  }
}
```

**Sumber kode:** `src/modules/auth/auth.controller.ts:88`, `src/modules/auth/auth.dto.ts:52`

---

### POST /api/core/auth/forgot-password

**Deskripsi:** Mengirim OTP reset password ke email user.

**Autentikasi:** Tidak ada (public)

**Request Body:**
```json
{
  "email": "string — required, valid email, akan di-lowercase"
}
```

**Response — Success (200)**
```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Password reset sent to <email>",
  "data": null
}
```

**Response — Error (404)**
```json
{
  "status": false,
  "statusCode": 404,
  "message": "User not found",
  "errors": null
}
```

**Sumber kode:** `src/modules/auth/auth.controller.ts:102`, `src/modules/auth/auth.dto.ts:58`

---

### POST /api/core/auth/resend-token?for=VERIFY_EMAIL|RESET_PASSWORD

**Deskripsi:** Mengirim ulang OTP.

**Autentikasi:** Tidak ada (public)

**Query Parameters:**
| Nama | Tipe | Wajib | Default | Keterangan |
|------|------|-------|---------|------------|
| for | enum | Ya | - | `VERIFY_EMAIL` atau `RESET_PASSWORD` |

**Request Body:**
```json
{
  "email": "string — required, valid email, akan di-lowercase"
}
```

**Response — Success (200)**
```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Resend token sent to <email>",
  "data": null
}
```

**Sumber kode:** `src/modules/auth/auth.controller.ts:113`, `src/modules/auth/auth.dto.ts:90`

---

### PATCH /api/core/auth/change-password

**Deskripsi:** Mengubah password setelah token di-verifikasi.

**Autentikasi:** Tidak ada (public)

**Request Body:**
```json
{
  "tokenId": "string — required (ID dari auth_token setelah verify-password)",
  "newPassword": "string — required, min 8, max 100",
  "confirmNewPassword": "string — required, harus sama dengan newPassword"
}
```

**Response — Success (200)**
```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Successfully changed password",
  "data": {
    "id": "string",
    "email": "string"
  }
}
```

**Sumber kode:** `src/modules/auth/auth.controller.ts:125`, `src/modules/auth/auth.dto.ts:65`

---

### POST /api/core/auth/logout

**Deskripsi:** Logout — menonaktifkan semua token auth user.

**Autentikasi:** Bearer JWT

**Response — Success (200)**
```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Logged out successfully",
  "data": null
}
```

**Sumber kode:** `src/modules/auth/auth.controller.ts:136`
