# ML Engine API

Base path: `https://greenly-api.duckdns.org/api/ml`

ML Engine masih dalam tahap scaffolding. Hanya terdapat 1 route.

---

### GET /api/ml

**Deskripsi:** Root endpoint untuk ML Engine.

**Autentikasi:** Tidak ada

**Response — Success (200)**
```json
{
  "message": "Hello World"
}
```

**Catatan:** ML Engine belum memiliki implementasi untuk modul `app/api/`, `app/core/`, `app/clients/`, dan `app/workers/`. Semua direktori tersebut hanya berisi `__pycache__/` tanpa file `.py`. Service ini belum memiliki autentikasi, koneksi database, atau fungsionalitas ML yang sesungguhnya.

**Sumber kode:** `main.py:6`
