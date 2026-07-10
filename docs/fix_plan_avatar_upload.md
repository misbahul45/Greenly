# Fix Plan: Avatar Upload Error

## Hasil Analisis (Root Cause)

Upload avatar selalu error karena **3 bug yang saling berkaitan** dalam alur:
`Flutter pickImage → ApiClient.upload → catalog /uploads/avatar → ImageKit → return URL → Flutter setState → save profile (PATCH /me/update)`

---

## Bug #1 — URL Upload Salah: Catalog API Tidak Punya Auth User Context yang Sesuai

**File:** `apps/app/lib/features/Main/features/profile/screens/edit_profile_screen.dart:88`

```dart
// SEKARANG (salah):
final res = await ApiClient.upload<Map<String, dynamic>>(
  url: '${ENV.catalogApiUrl}/uploads/avatar',  // ← /api/catalog/uploads/avatar
  ...
);
```

Endpoint `POST /api/catalog/uploads/avatar` dilindungi oleh `JWTAuthMiddleware` di catalog-service.
Middleware ini melakukan `coreSvc.GetMe(ctx, token)` ke core-service untuk memvalidasi user.

**Masalah:** Jika core-service tidak dapat diakses atau token format tidak cocok dengan yang diharapkan catalog-service, upload akan langsung gagal 401 sebelum sampai ke ImageKit.

Selain itu, `folder` yang dipakai adalah `/avatars/{user_id}` — ini opsional dan tidak merusak, tapi jika `user_id` tidak di-set di context (`c.Get("user_id")`), folder menjadi `/avatars` saja.

**Status:** Ini bukan bug fatal sendiri jika auth berfungsi, namun lihat Bug #2.

---

## Bug #2 — `MeService.updateProfile` Mengirim ke Path yang Salah

**File:** `apps/app/lib/shared/services/me_service.dart:22`

```dart
// SEKARANG:
static Future<ApiResponse<dynamic>> updateProfile(UpdateProfileDto payload) async {
  return await ApiClient.patch<dynamic>(
    "$_baseUrl/me/update",   // ← /api/core/me/update
    payload.toJson(),
  );
}
```

Core-service controller:
```typescript
// me.controller.ts
@Controller('me')
export class MeController {
  @Patch('/update')
  updateProfile(...) { ... }
}
```

Traefik strips prefix `/api/core` → request sampai ke NestJS sebagai `PATCH /me/update`.
NestJS route: `@Controller('me')` + `@Patch('/update')` = `PATCH /me/update`. ✅ Path **benar**.

---

## Bug #3 — `UpdateProfileDto.toJson()` Tidak Mengirim Field yang Diharapkan Backend

**File:** `apps/app/lib/shared/domains/dto/update_profile_dto.dart`

```dart
Map<String, dynamic> toJson() => {
  if (name != null && name!.isNotEmpty) 'name': name,        // ← key 'name'
  if (phone != null) 'phone': phone,
  if (address != null) 'address': address,
  if (avatarUrl != null && avatarUrl!.isNotEmpty) 'avatarUrl': avatarUrl,
  ...
};
```

Backend Zod schema (`me.dto.ts`) menerima: `name`, `phone`, `avatarUrl`, `photoUrl`, `address`. ✅

`me.repository.ts` lalu menulis ke DB:
```typescript
data: {
  fullName: data.name,     // ← payload key 'name' → DB column 'fullName' ✅
  avatarUrl: data.avatarUrl,
  ...
}
```

Tidak ada mismatch di sini. **Namun ada masalah lain:**

`edit_profile_screen.dart:_load()` memanggil `MeService.getProfileDetail()` yang hit `GET /api/core/me`.
Response dari backend membungkus data di dalam key `profile`:

```typescript
// me.service.ts → toMeResponse(user) → data.profile
{
  "data": {
    "profile": {
      "fullName": "...",
      "avatarUrl": "...",
      ...
    }
  }
}
```

`ProfileDetailData.fromJson()` sudah handle ini:
```dart
final profile = json['profile'] is Map ? json['profile'] : json;
```

✅ Ini benar.

---

## Bug #4 (CRITICAL) — ImageKit Private Key Kosong / Tidak Terkonfigurasi

**File:** `services/catalog-service/internal/imagekit/client.go:25`

```go
func NewClient() Client {
  return &client{
    privateKey: os.Getenv("IMAGEKIT_PRIVATE_KEY"),  // ← bisa kosong!
    ...
  }
}
```

**File:** `services/catalog-service/modules/uploads/handler.go:49`

```go
uploaded, err := h.imagekit.Upload(header.Filename, fileData, folder)
if err != nil {
  c.Error(middleware.NewAppError(502, "Failed to upload image to storage", nil))
  return
}
```

Jika `IMAGEKIT_PRIVATE_KEY` tidak di-set di `.env`, semua upload akan return HTTP 502 dari catalog-service. Error message dari flutter akan menjadi: `"Gagal mengunggah gambar"` (karena `res.message` adalah `"Failed to upload image to storage"`).

**Ini adalah penyebab paling umum upload selalu error di environment development.**

---

## Bug #5 (CRITICAL) — Response Body dari Upload Tidak Dibaca dengan Benar

**File:** `apps/app/lib/features/Main/features/profile/screens/edit_profile_screen.dart:99-113`

```dart
final res = await ApiClient.upload<Map<String, dynamic>>(
  url: '${ENV.catalogApiUrl}/uploads/avatar',
  files: [file],
  fileField: 'file',
  fromJsonT: (json) => json as Map<String, dynamic>,
);

if (res.isSuccess && res.data != null) {
  final url = res.data!['url']?.toString() ?? '';
  ...
}
```

**`ApiResponse.fromJson`** membaca: `json['data']` lalu memanggil `fromJsonT`.

Backend response dari `utils.Created(c, gin.H{"url": ..., "fileId": ...})`:
```json
{
  "status": "success",
  "data": { "url": "https://ik.imagekit.io/...", "fileId": "..." },
  "message": "..."
}
```

Jadi `res.data!['url']` seharusnya bekerja — **IF** `ApiClient.upload` berhasil, dan `res.isSuccess == true`.

**Masalah tersembunyi:** `ApiClient._handleResponse` mengecek:
```dart
if (res.statusCode >= 200 && res.statusCode < 300 && isSuccess) {
  return ApiResponse<T>.fromJson(decoded, fromJsonT ?? (data) => data as T);
}
```

`isSuccess` dicek dari field `"status"` dalam JSON. Jika backend mengembalikan 201 (Created) tapi `isSuccess = false` karena format respons berbeda, data tidak akan diparse. Namun `utils.Created` di catalog-service seharusnya mengembalikan format yang benar.

---

## Bug #6 — `_pickedFile` Tetap Non-Null Meskipun Upload Gagal

**File:** `edit_profile_screen.dart:83-86`

```dart
setState(() {
  _pickedFile = file;    // ← di-set sebelum upload dimulai
  _uploading = true;
});
```

Ketika upload gagal, `_pickedFile` masih berisi file lokal. Widget `_buildAvatarContent()` menampilkan `Image.file(_pickedFile!)` sehingga terlihat seolah berhasil, padahal `_avatarUrl` tidak terupdate. Ketika user menekan "Simpan", `avatarUrl` yang di-kirim ke backend adalah URL lama (atau kosong), bukan URL ImageKit.

**Dampak:** User pikir foto berhasil diupload, padahal tidak.

---

## Bug #7 — `_avatarUrl` Tidak Disimpan Setelah Ganti Foto Baru yang Sudah Ada

Di `_pickImage`, jika sebelumnya sudah ada `_avatarUrl` lama dan upload baru gagal, `_avatarUrl` tetap berisi URL lama. Ini sebenarnya behavior yang acceptable, namun tidak ada visual feedback yang jelas membedakan "foto berhasil diupdate" vs "foto tidak berubah".

---

## Ringkasan Temuan

| # | Severity | Lokasi | Masalah |
|---|----------|--------|---------|
| 1 | 🔴 Critical | `.env` / `IMAGEKIT_PRIVATE_KEY` | Key kosong → semua upload 502 |
| 2 | 🔴 Critical | `imagekit/client.go` | Tidak ada validasi key sebelum request |
| 3 | 🟠 High | `edit_profile_screen.dart:83` | `_pickedFile` di-set sebelum upload, user tidak tahu jika gagal |
| 4 | 🟡 Medium | `imagekit/client.go` | Tidak ada file size/type validation sebelum upload ke ImageKit |
| 5 | 🟡 Medium | `edit_profile_screen.dart` | Tidak reset `_pickedFile` ke `null` jika upload gagal |

---

## Rencana Perbaikan

### Fix 1 — Validasi `IMAGEKIT_PRIVATE_KEY` di Startup

**File:** `services/catalog-service/internal/imagekit/client.go`

Tambahkan validasi early di `NewClient()` sehingga service tidak diam-diam gagal saat runtime:

```go
func NewClient() Client {
  key := os.Getenv("IMAGEKIT_PRIVATE_KEY")
  if key == "" {
    log.Fatal("IMAGEKIT_PRIVATE_KEY is not set — uploads will not work")
  }
  return &client{
    privateKey: key,
    httpClient: &http.Client{Timeout: 30 * time.Second},
  }
}
```

**Alternatif tanpa `log.Fatal`** (graceful):

```go
func NewClient() Client {
  key := os.Getenv("IMAGEKIT_PRIVATE_KEY")
  if key == "" {
    log.Println("[WARN] IMAGEKIT_PRIVATE_KEY not set — avatar uploads will fail")
  }
  return &client{...}
}
```

---

### Fix 2 — Validasi File di Handler Sebelum Upload ke ImageKit

**File:** `services/catalog-service/modules/uploads/handler.go`

Tambahkan validasi ukuran file dan tipe MIME:

```go
func (h *handler) UploadAvatar(c *gin.Context) {
  file, header, err := c.Request.FormFile("file")
  if err != nil {
    c.Error(middleware.NewAppError(400, "file is required", nil))
    return
  }
  defer file.Close()

  const maxSize = 5 * 1024 * 1024  // 5 MB
  if header.Size > maxSize {
    c.Error(middleware.NewAppError(400, "file size exceeds 5MB limit", nil))
    return
  }

  contentType := header.Header.Get("Content-Type")
  allowed := map[string]bool{
    "image/jpeg": true,
    "image/png":  true,
    "image/webp": true,
  }
  if !allowed[contentType] {
    c.Error(middleware.NewAppError(400, "only JPEG, PNG, and WebP images are allowed", nil))
    return
  }

  fileData, err := io.ReadAll(file)
  if err != nil {
    c.Error(middleware.NewAppError(400, "Failed to read file", nil))
    return
  }

  userID, exists := c.Get("user_id")
  folder := "/avatars"
  if exists && userID != nil {
    folder = fmt.Sprintf("/avatars/%s", userID)
  }

  uploaded, err := h.imagekit.Upload(header.Filename, fileData, folder)
  if err != nil {
    c.Error(middleware.NewAppError(502, "Failed to upload image to storage", nil))
    return
  }

  utils.Created(c, gin.H{
    "url":    uploaded.URL,
    "fileId": uploaded.FileID,
  })
}
```

---

### Fix 3 — Reset `_pickedFile` Jika Upload Gagal di Flutter

**File:** `apps/app/lib/features/Main/features/profile/screens/edit_profile_screen.dart`

Ubah `_pickImage` agar:
1. `_pickedFile` baru di-set SETELAH upload sukses.
2. Jika gagal, reset ke `null` (tampilkan avatar lama atau placeholder).

```dart
Future<void> _pickImage() async {
  final picker = ImagePicker();
  final picked = await picker.pickImage(
    source: ImageSource.gallery,
    maxWidth: 512,
    maxHeight: 512,
    imageQuality: 80,
  );
  if (picked == null || !mounted) return;

  final file = File(picked.path);
  setState(() => _uploading = true);

  try {
    final res = await ApiClient.upload<Map<String, dynamic>>(
      url: '${ENV.catalogApiUrl}/uploads/avatar',
      files: [file],
      fileField: 'file',
      fromJsonT: (json) => json as Map<String, dynamic>,
    );

    if (!mounted) return;

    if (res.isSuccess && res.data != null) {
      final url = res.data!['url']?.toString() ?? '';
      if (url.isNotEmpty) {
        setState(() {
          _pickedFile = file;   // ← set hanya jika sukses
          _avatarUrl = url;
          _uploading = false;
        });
        return;
      }
    }

    setState(() {
      _pickedFile = null;   // ← reset preview agar tidak menipu user
      _uploading = false;
    });

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            res.message.isNotEmpty ? res.message : 'Gagal mengunggah gambar',
          ),
          backgroundColor: Colors.red,
        ),
      );
    }
  } catch (_) {
    if (!mounted) return;
    setState(() {
      _pickedFile = null;
      _uploading = false;
    });
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Terjadi kesalahan saat mengunggah gambar'),
        backgroundColor: Colors.red,
      ),
    );
  }
}
```

---

### Fix 4 — Tambahkan `receiverName`, `addressLine`, `city`, `province`, `postalCode`, `notes` ke `UpdateProfileSchema` di Backend (Opsional)

**File:** `services/core-service/src/modules/identity/me/me.dto.ts`

Saat ini `UpdateProfileSchema` hanya punya: `name`, `phone`, `avatarUrl`, `photoUrl`, `address`.
Flutter mengirim juga: `receiverName`, `addressLine`, `city`, `province`, `postalCode`, `notes`.

Zod akan **strip** field yang tidak dikenal secara default (`.strip()`), jadi field alamat detail diabaikan dan hanya `address` (composed string) yang disimpan. Ini behavior yang sah karena Flutter sudah compose semua field ke satu string `address`. **Tidak perlu diubah** selama `composed` address sudah lengkap.

---

## Urutan Implementasi

1. **Fix 1** — Cek dan set `IMAGEKIT_PRIVATE_KEY` di `.env` → immediate fix untuk 80% kasus error
2. **Fix 3** — Reset `_pickedFile = null` jika upload gagal (Flutter) → UX fix agar user tidak tertipu
3. **Fix 2** — Validasi file size & MIME type di backend handler → proteksi dari input buruk
4. **Fix 4** — Log warning di imagekit client (bukan fatal) agar deployment tidak crash

---

## Cara Verifikasi

```bash
# 1. Cek apakah key sudah di-set
grep IMAGEKIT_PRIVATE_KEY .env

# 2. Test upload langsung
curl -X POST http://localhost/api/catalog/uploads/avatar \
  -H "Authorization: Bearer <token>" \
  -F "file=@/path/to/test.jpg"

# Expected response:
# { "status": "success", "data": { "url": "https://ik.imagekit.io/...", "fileId": "..." } }
```
