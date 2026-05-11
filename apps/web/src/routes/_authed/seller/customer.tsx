import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_authed/seller/customer")({
  component: CustomerPage,
})

function CustomerPage() {
  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-xl font-semibold">Customer</h1>
          <p className="text-sm text-muted-foreground">
            Kelola data pelanggan untuk memantau aktivitas dan performa penjualan Anda.
          </p>
        </div>

        <button className="border px-4 py-2 rounded-lg text-sm">
          Export Data Customer
        </button>
      </div>

      {/* STATS */}
      <div className="grid md:grid-cols-4 gap-4">

        {[
          { title: "Total Customer", value: "1.284", growth: "+12%" },
          { title: "Customer Aktif", value: "340" },
          { title: "Customer Baru", value: "52", growth: "+5%" },
          { title: "Repeat Buyer", value: "128" },
        ].map((item, i) => (
          <div key={i} className="bg-white rounded-xl p-4 shadow-sm ring-1 ring-black/5">
            <p className="text-sm text-muted-foreground">{item.title}</p>
            <p className="text-xl font-bold">{item.value}</p>
            {item.growth && (
              <p className="text-green-600 text-sm">{item.growth}</p>
            )}
            <div className="h-1 bg-gray-200 rounded mt-2">
              <div className="h-1 bg-green-500 rounded w-1/2"></div>
            </div>
          </div>
        ))}

      </div>

      {/* FILTER */}
      <div className="bg-white p-4 rounded-xl shadow-sm ring-1 ring-black/5 flex flex-col md:flex-row gap-3">

        <input
          placeholder="Cari nama, ID, atau email"
          className="flex-1 border rounded-lg px-4 py-2 text-sm"
        />

        <select className="border rounded-lg px-3 py-2 text-sm">
          <option>Semua Status</option>
          <option>Aktif</option>
          <option>Baru</option>
        </select>

        <button className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm">
          Cari
        </button>

        <button className="border px-4 py-2 rounded-lg text-sm">
          Reset
        </button>

      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow-sm ring-1 ring-black/5 overflow-hidden">

        <table className="w-full text-sm">

          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="p-3">Customer</th>
              <th>Username</th>
              <th>Total Pesanan</th>
              <th>Total Belanja</th>
              <th>Terakhir Belanja</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>

          <tbody>

            {[
              {
                name: "Andi Wijaya",
                username: "@andi",
                orders: 24,
                total: "Rp 3.420.000",
                last: "2 hari lalu",
                status: "Repeat",
              },
              {
                name: "Siska Mawar",
                username: "@siska",
                orders: 1,
                total: "Rp 120.000",
                last: "5 jam lalu",
                status: "Baru",
              },
              {
                name: "Budi Santoso",
                username: "@budi",
                orders: 12,
                total: "Rp 1.550.000",
                last: "1 bulan lalu",
                status: "Tidak Aktif",
              },
            ].map((c, i) => (
              <tr key={i} className="border-t">

                <td className="p-3 flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full" />
                  <span className="font-medium">{c.name}</span>
                </td>

                <td>{c.username}</td>
                <td>{c.orders}</td>
                <td>{c.total}</td>
                <td>{c.last}</td>

                <td>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    c.status === "Repeat"
                      ? "bg-green-100 text-green-600"
                      : c.status === "Baru"
                      ? "bg-blue-100 text-blue-600"
                      : "bg-gray-100 text-gray-600"
                  }`}>
                    {c.status}
                  </span>
                </td>

                <td>
                  <button className="text-green-600 text-sm">
                    Riwayat
                  </button>
                </td>

              </tr>
            ))}

          </tbody>

        </table>

      </div>

      {/* PAGINATION */}
      <div className="flex justify-between items-center text-sm">

        <p className="text-muted-foreground">
          Showing 1–3 dari 1.284 customer
        </p>

        <div className="flex gap-2">
          {[1,2,3,4].map((n)=>(
            <button
              key={n}
              className={`w-8 h-8 rounded-full ${
                n === 1
                  ? "bg-green-600 text-white"
                  : "border"
              }`}
            >
              {n}
            </button>
          ))}
        </div>

      </div>

    </div>
  )
}