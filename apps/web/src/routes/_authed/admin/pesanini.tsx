import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_authed/admin/pesanini")({
  component: RouteComponent,
})

function RouteComponent() {
  const data = [
    {
      id: "#ORD-98213",
      date: "12 Okt 2023, 14:20",
      customer: "Andi Setiawan",
      store: "Toko Sayur Segar",
      total: "Rp 125.000",
      method: "Gopay",
      status: "Dikirim",
    },
    {
      id: "#ORD-98212",
      date: "12 Okt 2023, 12:15",
      customer: "Budi Mansur",
      store: "Petani Hidroponik Jaya",
      total: "Rp 84.500",
      method: "VA BCA",
      status: "Dikemas",
    },
    {
      id: "#ORD-98211",
      date: "12 Okt 2023, 09:45",
      customer: "Siti Pertiwi",
      store: "Buah Organik Malang",
      total: "Rp 312.000",
      method: "QRIS",
      status: "Selesai",
    },
    {
      id: "#ORD-98210",
      date: "11 Okt 2023, 21:05",
      customer: "Dani Nugraha",
      store: "Toko Sayur Segar",
      total: "Rp 45.000",
      method: "ShopeePay",
      status: "Belum Bayar",
    },
  ]

  const statusStyle = (status: string) => {
    if (status === "Dikirim")
      return "bg-blue-100 text-blue-600"
    if (status === "Dikemas")
      return "bg-orange-100 text-orange-600"
    if (status === "Selesai")
      return "bg-green-100 text-green-600"
    if (status === "Belum Bayar")
      return "bg-red-100 text-red-600"
    return ""
  }

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">Daftar Pesanan</h1>
          <p className="text-sm text-muted-foreground">
            Kelola dan pantau semua transaksi Greenly Mart.
          </p>
        </div>

        <button className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm">
          ⬇ Export Laporan
        </button>
      </div>

      {/* STATS */}
      <div className="grid md:grid-cols-4 gap-4">

        <div className="bg-white p-5 rounded-xl shadow-sm ring-1 ring-black/5">
          <p className="text-sm text-muted-foreground">Total Orders</p>
          <p className="text-2xl font-bold mt-2">1,284</p>
          <span className="text-green-600 text-xs">+12.5%</span>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm ring-1 ring-black/5">
          <p className="text-sm text-muted-foreground">Pending</p>
          <p className="text-2xl font-bold mt-2">45</p>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm ring-1 ring-black/5">
          <p className="text-sm text-muted-foreground">Shipped</p>
          <p className="text-2xl font-bold mt-2">112</p>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm ring-1 ring-black/5">
          <p className="text-sm text-muted-foreground">Completed</p>
          <p className="text-2xl font-bold mt-2">1,127</p>
        </div>

      </div>

      {/* FILTER */}
      <div className="bg-white p-4 rounded-xl shadow-sm ring-1 ring-black/5 flex flex-wrap gap-3">

        <input
          placeholder="Cari ID atau Customer"
          className="border rounded-lg px-3 py-2 text-sm"
        />

        <select className="border rounded-lg px-3 py-2 text-sm">
          <option>Semua Status</option>
        </select>

        <input
          type="text"
          value="01 Jan 2024 - 31 Jan 2024"
          readOnly
          className="border rounded-lg px-3 py-2 text-sm"
        />

        <button className="px-3 py-2 border rounded-lg text-sm">
          Reset Filter
        </button>

      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow-sm ring-1 ring-black/5 overflow-hidden">

        <div className="overflow-x-auto">
          <table className="w-full text-sm">

            <thead className="bg-gray-50 text-xs text-gray-500">
              <tr>
                <th className="p-3 text-left">ORDER ID</th>
                <th className="p-3 text-left">TANGGAL</th>
                <th className="p-3 text-left">CUSTOMER</th>
                <th className="p-3 text-left">TOKO/PETANI</th>
                <th className="p-3 text-left">TOTAL</th>
                <th className="p-3 text-left">METODE</th>
                <th className="p-3 text-left">STATUS</th>
                <th className="p-3 text-left">AKSI</th>
              </tr>
            </thead>

            <tbody>
              {data.map((item, i) => (
                <tr key={i} className="border-t">

                  <td className="p-3 text-green-600 font-medium">
                    {item.id}
                  </td>

                  <td className="p-3 text-xs text-muted-foreground">
                    {item.date}
                  </td>

                  <td className="p-3">{item.customer}</td>
                  <td className="p-3">{item.store}</td>
                  <td className="p-3 font-medium">{item.total}</td>
                  <td className="p-3">{item.method}</td>

                  {/* STATUS */}
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${statusStyle(
                        item.status
                      )}`}
                    >
                      {item.status}
                    </span>
                  </td>

                  {/* AKSI */}
                  <td className="p-3">
                    <button className="text-gray-500">
                      👁
                    </button>
                  </td>

                </tr>
              ))}
            </tbody>

          </table>
        </div>

        {/* FOOTER */}
        <div className="flex justify-between items-center p-4 text-xs text-muted-foreground border-t">
          <p>Menampilkan 1 - 5 dari 1,284 pesanan</p>

          <div className="flex gap-2 items-center">
            <button className="px-2">‹</button>
            <button className="bg-green-600 text-white h-6 w-6 rounded-full">
              1
            </button>
            <button className="h-6 w-6 border rounded-full">2</button>
            <button className="h-6 w-6 border rounded-full">3</button>
            <button className="px-2">›</button>
          </div>
        </div>

      </div>

    </div>
  )
}