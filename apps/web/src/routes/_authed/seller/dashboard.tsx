import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_authed/seller/dashboard")({
  component: SellerDashboard,
})

function SellerDashboard() {
  return (
    <div className="space-y-6">
     {/* STATS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { title: "Belum Bayar", value: 2 },
          { title: "Perlu Diproses", value: 12 },
          { title: "Telah Diproses", value: 8 },
          { title: "Produk Habis", value: 4 },
        ].map((item, i) => (
          <div
            key={i}
            className="bg-white rounded-xl p-4 shadow-sm ring-1 ring-black/5 hover:shadow-md transition"
          >
            <p className="text-sm text-muted-foreground">{item.title}</p>
            <p className="text-xl font-bold">{item.value}</p>
          </div>
        ))}
      </div>

      {/* CHART + SIDE */}
      <div className="grid md:grid-cols-3 gap-6">

        {/* CHART */}
        <div className="md:col-span-2 bg-white rounded-xl p-5 shadow-sm ring-1 ring-black/5">
          <h3 className="font-semibold mb-4">Grafik Penjualan</h3>

          <div className="flex items-end gap-2 h-40">
            {[40, 60, 30, 80, 90, 70, 100].map((h, i) => (
              <div
                key={i}
                className="flex-1 bg-green-500 rounded-t hover:bg-green-600 transition"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>

          <p className="mt-4 font-bold text-lg">
            Rp 12.450.000
          </p>
        </div>

        {/* SIDE STATS */}
        <div className="space-y-4">
          {[
            { title: "Pengunjung", value: "4.281" },
            { title: "Produk Dilihat", value: "18.102" },
            { title: "Pesanan", value: "142" },
          ].map((item, i) => (
            <div
              key={i}
              className="bg-white p-4 rounded-xl shadow-sm ring-1 ring-black/5"
            >
              <p className="text-sm text-muted-foreground">{item.title}</p>
              <p className="font-bold">{item.value}</p>
            </div>
          ))}
        </div>

      </div>

      {/* EXTRA SECTION */}
      <div className="grid md:grid-cols-3 gap-6">

        {/* PESANAN TERBARU */}
        <div className="md:col-span-2 bg-white rounded-xl p-5 shadow-sm ring-1 ring-black/5">
          <h3 className="font-semibold mb-4">Pesanan Terbaru</h3>

          <div className="space-y-3">
            {[
              { name: "Beras Organik 5kg", price: "Rp 85.000", status: "Selesai" },
              { name: "Sayur Bayam", price: "Rp 12.000", status: "Diproses" },
              { name: "Cabai Merah", price: "Rp 45.000", status: "Selesai" },
            ].map((item, i) => (
              <div
                key={i}
                className="flex justify-between items-center bg-gray-50 p-3 rounded-lg"
              >
                <div>
                  <p className="text-sm font-medium">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{item.price}</p>
                </div>

                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    item.status === "Selesai"
                      ? "bg-green-100 text-green-600"
                      : "bg-yellow-100 text-yellow-600"
                  }`}
                >
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="space-y-4">

          {/* PRODUK TERLARIS */}
          <div className="bg-white rounded-xl p-5 shadow-sm ring-1 ring-black/5">
            <h3 className="font-semibold mb-4">Produk Terlaris</h3>

            <div className="space-y-3">
              {[
                { name: "Beras Organik", sold: 120 },
                { name: "Cabai Merah", sold: 90 },
                { name: "Bayam Segar", sold: 75 },
              ].map((item, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span>{item.name}</span>
                  <span className="font-bold">{item.sold}</span>
                </div>
              ))}
            </div>
          </div>

          {/* QUICK ACTION */}
          <div className="bg-white rounded-xl p-5 shadow-sm ring-1 ring-black/5">
            <h3 className="font-semibold mb-4">Aksi Cepat</h3>

            <div className="flex flex-col gap-3">
              <button className="bg-green-600 text-white py-2 rounded-lg text-sm hover:bg-green-700 transition">
                + Tambah Produk
              </button>

              <button className="border py-2 rounded-lg text-sm hover:bg-gray-100 transition">
                Lihat Pesanan
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  )
}