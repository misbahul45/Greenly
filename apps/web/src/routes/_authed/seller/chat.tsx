import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_authed/seller/chat")({
  component: ChatPage,
})

function ChatPage() {
  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-semibold">Chat</h1>
          <p className="text-sm text-muted-foreground">
            Kelola komunikasi dengan pembeli secara efisien.
          </p>
        </div>

        
      </div>

      {/* PERFORMA */}
      <div className="space-y-4">
        <h2 className="font-semibold">Performa Chat</h2>

        <div className="grid md:grid-cols-3 gap-4">

          {/* CARD 1 */}
          <div className="bg-white p-4 rounded-xl shadow-sm ring-1 ring-black/5">
            <p className="text-sm text-muted-foreground">Jumlah Chat</p>
            <p className="text-2xl font-bold mt-2">1,284</p>
            <span className="text-green-600 text-sm">+12%</span>
          </div>

          {/* CARD 2 */}
          <div className="bg-white p-4 rounded-xl shadow-sm ring-1 ring-black/5">
            <p className="text-sm text-muted-foreground">
              Persentase Chat Dibalas
            </p>
            <p className="text-2xl font-bold mt-2">98.5%</p>
            <span className="text-green-600 text-sm">+0.5%</span>
          </div>

          {/* CARD 3 */}
          <div className="bg-white p-4 rounded-xl shadow-sm ring-1 ring-black/5">
            <p className="text-sm text-muted-foreground">
              Waktu Respons Chat
            </p>
            <p className="text-2xl font-bold mt-2">&lt; 2 menit</p>
            <span className="text-red-500 text-sm">-15%</span>
          </div>

        </div>

        {/* DISTRIBUSI */}
        <div className="bg-white p-4 rounded-xl shadow-sm ring-1 ring-black/5">
          <p className="text-sm font-medium mb-3">Distribusi Balasan</p>

          <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-green-500 w-[75%]" />
          </div>

          <div className="flex justify-between text-xs mt-2 text-muted-foreground">
            <span>● Agen (75%)</span>
            <span>● Asisten AI (25%)</span>
          </div>

          <p className="text-xs mt-2 text-muted-foreground">
            Asisten AI membantu menjawab pertanyaan umum saat agen sedang sibuk.
          </p>
        </div>
      </div>

      {/* AI CHAT */}
      <div className="space-y-4">
        <h2 className="font-semibold">
          Asisten AI Chat{" "}
          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
            AKTIF
          </span>
        </h2>

        <div className="grid md:grid-cols-2 gap-4">

          <div className="bg-white p-4 rounded-xl shadow-sm ring-1 ring-black/5">
            <p className="font-medium">Balasan Otomatis</p>
            <p className="text-sm text-muted-foreground mt-1">
              Kirim pesan otomatis saat pembeli mulai menyapa atau di luar jam operasional.
            </p>
            <button className="text-green-600 text-sm mt-3">
              Atur Sekarang →
            </button>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm ring-1 ring-black/5">
            <p className="font-medium">FAQ Chat</p>
            <p className="text-sm text-muted-foreground mt-1">
              Buat daftar pertanyaan yang sering diajukan untuk dijawab otomatis.
            </p>
            <button className="text-green-600 text-sm mt-3">
              Lihat FAQ →
            </button>
          </div>

        </div>
      </div>

      {/* FITUR AGEN */}
      <div className="space-y-4">
        <h2 className="font-semibold">Fitur Agen</h2>

        <div className="grid md:grid-cols-2 gap-4">

          <div className="bg-white p-4 rounded-xl shadow-sm ring-1 ring-black/5">
            <div className="flex justify-between items-center">
              <p className="font-medium">Template Pesan</p>
              <button className="text-xs border px-2 py-1 rounded">
                Ubah
              </button>
            </div>
            <p className="text-xs text-green-600 mt-1">
              TINGKATKAN KECEPATAN BALASAN
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Siapkan teks standar untuk menanyakan detail pesanan atau konfirmasi stok barang.
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm ring-1 ring-black/5">
            <div className="flex justify-between items-center">
              <p className="font-medium">Pesan Otomatis</p>
              <button className="text-xs border px-2 py-1 rounded">
                Ubah
              </button>
            </div>
            <p className="text-xs text-green-600 mt-1">
              PESAN CEPAT
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Kirim pesan instan saat ada trigger tertentu seperti pesanan baru atau pembayaran diterima.
            </p>
          </div>

        </div>
      </div>

      {/* EDUKASI */}
      <div className="space-y-4">
        <h2 className="font-semibold">Edukasi Chat</h2>

        <div className="bg-white rounded-xl shadow-sm ring-1 ring-black/5 divide-y">

          {[
            "Apa itu Chat Penjual?",
            "Cara meningkatkan persentase balasan chat",
            "Tips menggunakan Template Pesan secara efektif",
            "Ketentuan dan Etika berkomunikasi dengan Pembeli",
          ].map((item, i) => (
            <div
              key={i}
              className="p-4 flex justify-between items-center text-sm hover:bg-gray-50 cursor-pointer"
            >
              {item}
              <span>→</span>
            </div>
          ))}

        </div>
      </div>

    </div>
  )
}