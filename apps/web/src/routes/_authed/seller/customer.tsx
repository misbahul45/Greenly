import { createFileRoute } from "@tanstack/react-router"
import { useState } from "react"

export const Route = createFileRoute("/_authed/seller/customer")({
  component: CustomerPage,
})

const customers = [
  {
    name: "Andi Wijaya",
    username: "@andi",
    orders: 24,
    total: "Rp 3.420.000",
    last: "2 hari lalu",
    status: "Repeat",
    history: [
      {
        date: "10 Jan 2026",
        product: "Kaos Oversize",
        total: "Rp 180.000",
      },
      {
        date: "02 Feb 2026",
        product: "Hoodie Polos",
        total: "Rp 250.000",
      },
    ],
  },
  {
    name: "Siska Mawar",
    username: "@siska",
    orders: 1,
    total: "Rp 120.000",
    last: "5 jam lalu",
    status: "Aktif",
    history: [
      {
        date: "11 Mei 2026",
        product: "Totebag Canvas",
        total: "Rp 120.000",
      },
    ],
  },
  {
    name: "Budi Santoso",
    username: "@budi",
    orders: 12,
    total: "Rp 1.550.000",
    last: "1 bulan lalu",
    status: "Tidak Aktif",
    history: [
      {
        date: "15 Mar 2026",
        product: "Celana Cargo",
        total: "Rp 300.000",
      },
      {
        date: "20 Mar 2026",
        product: "Kemeja Flanel",
        total: "Rp 220.000",
      },
    ],
  },
]

function CustomerPage() {
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null)
  const [statusFilter, setStatusFilter] = useState("Semua Status")

  const filteredCustomers =
    statusFilter === "Semua Status"
      ? customers
      : customers.filter((c) => c.status === statusFilter)

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
          <div
            key={i}
            className="bg-white rounded-xl p-4 shadow-sm ring-1 ring-black/5"
          >
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

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm"
        >
          <option>Semua Status</option>
          <option>Aktif</option>
          <option>Tidak Aktif</option>
          <option>Repeat</option>
        </select>

        <button className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm">
          Cari
        </button>

        <button
          onClick={() => setStatusFilter("Semua Status")}
          className="border px-4 py-2 rounded-lg text-sm"
        >
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

            {filteredCustomers.map((c, i) => (
              <tr key={i} className="border-t">

                <td className="p-3 flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full" />
                  <span className="font-medium">{c.name}</span>
                </td>

                <td>{c.username}</td>
                <td>{c.orders}</td>
                <td>{c.total}</td>
                <td>{c.last}</td>

                {/* STATUS DROPDOWN */}
                <td>
                  <select
                    defaultValue={c.status}
                    className={`text-xs px-3 py-1 rounded-full border outline-none ${
                      c.status === "Repeat"
                        ? "bg-green-100 text-green-600 border-green-200"
                        : c.status === "Aktif"
                        ? "bg-blue-100 text-blue-600 border-blue-200"
                        : "bg-gray-100 text-gray-600 border-gray-200"
                    }`}
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Tidak Aktif">Tidak Aktif</option>
                    <option value="Repeat">Repeat</option>
                  </select>
                </td>

                {/* AKSI */}
                <td>
                  <button
                    onClick={() => setSelectedCustomer(c)}
                    className="text-green-600 text-sm hover:underline"
                  >
                    Riwayat
                  </button>
                </td>

              </tr>
            ))}

          </tbody>

        </table>

        {/* EMPTY STATE */}
        {filteredCustomers.length === 0 && (
          <div className="py-10 text-center text-sm text-gray-500">
            Tidak ada customer dengan status tersebut.
          </div>
        )}

      </div>

      {/* POPUP RIWAYAT */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-xl">

            {/* HEADER */}
            <div className="flex justify-between items-start mb-5">

              <div>
                <h2 className="text-lg font-semibold">
                  Riwayat Pembelian
                </h2>

                <p className="text-sm text-muted-foreground">
                  {selectedCustomer.name} ({selectedCustomer.username})
                </p>
              </div>

              <button
                onClick={() => setSelectedCustomer(null)}
                className="text-gray-400 hover:text-gray-700 text-lg"
              >
                ✕
              </button>

            </div>

            {/* LIST HISTORY */}
            <div className="space-y-3 max-h-[350px] overflow-auto">

              {selectedCustomer.history.map((item: any, index: number) => (
                <div
                  key={index}
                  className="border rounded-xl p-4 flex justify-between items-start"
                >

                  <div>
                    <p className="font-medium">{item.product}</p>
                    <p className="text-sm text-gray-500">
                      {item.date}
                    </p>
                  </div>

                  <p className="font-semibold text-green-600">
                    {item.total}
                  </p>

                </div>
              ))}

            </div>

            {/* FOOTER */}
            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setSelectedCustomer(null)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm"
              >
                Tutup
              </button>
            </div>

          </div>

        </div>
      )}

      {/* PAGINATION */}
      <div className="flex justify-between items-center text-sm">

        <p className="text-muted-foreground">
          Showing 1–{filteredCustomers.length} dari 1.284 customer
        </p>

        <div className="flex gap-2">
          {[1, 2, 3, 4].map((n) => (
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