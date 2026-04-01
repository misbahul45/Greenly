import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_authed/seller/dashboard")({
  component: SellerDashboard,
})

function SellerDashboard() {
  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-800">
          Seller Dashboard
        </h1>
        <p className="text-sm text-gray-500">
          Ini halaman dashboard penjual untuk memantau performa toko Anda hari ini.
        </p>
      </div>

      {/* YANG PERLU DILAKUKAN */}
      <div>
        <h2 className="text-sm font-semibold text-gray-600 mb-3">
          Yang Perlu Dilakukan
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {[
            { title: "Belum Bayar", value: 2 },
            { title: "Pengiriman Perlu Diproses", value: 12 },
            { title: "Pengiriman Telah Diproses", value: 8 },
            { title: "Menunggu Respon Pengembalian", value: 0 },
            { title: "Menunggu Respon Pembatalan", value: 1 },
            { title: "Produk Diblokir", value: 0 },
            { title: "Produk Habis", value: 4, danger: true },
          ].map((item, i) => (
            <div
              key={i}
              className="bg-white rounded-xl p-4 text-center shadow-sm ring-1 ring-black/5"
            >
              <p
                className={`text-xl font-bold ${
                  item.danger ? "text-red-500" : "text-gray-800"
                }`}
              >
                {item.value}
              </p>
              <p className="text-xs text-gray-500 mt-1">{item.title}</p>
            </div>
          ))}
        </div>
      </div>

      {/* DATA TOKO */}
<div>
  <div className="flex justify-between items-center mb-3">
    <h2 className="text-sm font-semibold text-gray-600">
      Data Toko Saya
    </h2>

    {/* FILTER */}
    <div className="flex gap-2 text-xs">
      <button className="px-3 py-1 rounded-md bg-gray-100 text-gray-800">
        7 Hari Terakhir
      </button>
      <button className="px-3 py-1 rounded-md text-gray-500 hover:bg-gray-100">
        30 Hari
      </button>
    </div>
  </div>

        <div className="grid md:grid-cols-3 gap-6">

          {/* CHART */}
          <div className="md:col-span-2 bg-white rounded-xl p-5 shadow-sm ring-1 ring-black/5">
            <div className="flex justify-between items-center mb-4">
              <div>
                <p className="text-xs text-gray-400">GRAFIK PENJUALAN</p>
                <h2 className="text-xl font-semibold text-gray-800">
                  Rp 12.450.000
                </h2>
              </div>
              <span className="text-green-500 text-sm font-medium">
                +12.5%
              </span>
            </div>

            {/* CHART BAR */}
            <div className="flex items-end gap-2 h-40">
              {[30, 40, 60, 80, 50, 70, 100].map((h, i) => (
                <div
                  key={i}
                  className={`flex-1 rounded-md ${
                    i === 6 ? "bg-green-500" : "bg-green-200"
                  }`}
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          </div>

          {/* SIDE STATS */}
          <div className="space-y-4">
            {[
              { title: "Total Pengunjung Unik", value: "4.281", change: "+28.2%" },
              { title: "Produk Dilihat", value: "18.102", change: "+15.4%" },
              { title: "Pesanan", value: "142", change: "-2.1%", red: true },
              { title: "Tingkat Konversi", value: "3.32%", change: "+0.4%" },
            ].map((item, i) => (
              <div
                key={i}
                className="bg-white p-4 rounded-xl shadow-sm ring-1 ring-black/5 flex justify-between"
              >
                <div>
                  <p className="text-xs text-gray-400">{item.title}</p>
                  <p className="text-lg font-semibold">{item.value}</p>
                </div>
                <span
                  className={`text-sm font-medium ${
                    item.red ? "text-red-500" : "text-green-500"
                  }`}
                >
                  {item.change}
                </span>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* BOTTOM SECTION */}
      <div className="grid md:grid-cols-2 gap-6">

        {/* PROMO */}
        <div className="bg-white rounded-xl p-5 shadow-sm ring-1 ring-black/5 flex justify-between items-center">
          <div>
            <p className="font-medium">Promosi Menarik</p>
            <p className="text-sm text-gray-500">
              Tingkatkan penjualan dengan Flash Sale atau Diskon Toko.
            </p>
          </div>

          <button className="text-green-600 font-medium text-sm">
            Buat Promo
          </button>
        </div>

        {/* RATING */}
        <div className="bg-white rounded-xl p-5 shadow-sm ring-1 ring-black/5 flex justify-between items-center">
          <div>
            <p className="font-medium">Peringkat Toko</p>
            <p className="text-sm text-gray-500">⭐ 4.8 / 5.0</p>
          </div>

          <button className="text-green-600 font-medium text-sm">
            Cek Ulasan
          </button>
        </div>

      </div>

    </div>
  )
}