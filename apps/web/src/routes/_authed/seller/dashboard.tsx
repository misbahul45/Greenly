import { createFileRoute } from "@tanstack/react-router"
import { useState } from "react"

export const Route = createFileRoute("/_authed/seller/dashboard")({
  component: SellerDashboard,
})

function SellerDashboard() {
  const weeklySalesData = {
    "6-12 Mei 2024": [
      { day: "Senin", sales: 1200000 },
      { day: "Selasa", sales: 1800000 },
      { day: "Rabu", sales: 1400000 },
      { day: "Kamis", sales: 2200000 },
      { day: "Jumat", sales: 2000000 },
      { day: "Sabtu", sales: 2800000 },
      { day: "Minggu", sales: 3200000 },
    ],
    "13-19 Mei 2024": [
      { day: "Senin", sales: 1500000 },
      { day: "Selasa", sales: 1700000 },
      { day: "Rabu", sales: 2100000 },
      { day: "Kamis", sales: 2600000 },
      { day: "Jumat", sales: 2300000 },
      { day: "Sabtu", sales: 3000000 },
      { day: "Minggu", sales: 3500000 },
    ],
    "20-26 Mei 2024": [
      { day: "Senin", sales: 1100000 },
      { day: "Selasa", sales: 1600000 },
      { day: "Rabu", sales: 1900000 },
      { day: "Kamis", sales: 2400000 },
      { day: "Jumat", sales: 2200000 },
      { day: "Sabtu", sales: 2700000 },
      { day: "Minggu", sales: 3100000 },
    ],
  }

  const [selectedWeek, setSelectedWeek] = useState("6-12 Mei 2024")
  const weeklySales =
    weeklySalesData[selectedWeek as keyof typeof weeklySalesData]
  const maxSales = Math.max(...weeklySales.map((item) => item.sales))

  function exportWeeklySalesCSV() {
    const headers = ["Periode", "Hari", "Penjualan"]
    const rows = weeklySales.map((item) => [
      selectedWeek,
      item.day,
      item.sales,
    ])

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n")

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")

    link.href = url
    link.download = `seller-sales-${selectedWeek
      .replaceAll(" ", "-")
      .toLowerCase()}.csv`

    link.click()
    URL.revokeObjectURL(url)
  }

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
          <div className="md:col-span-2 bg-white rounded-xl p-6 shadow-sm ring-1 ring-black/5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
              <div>
                <h3 className="font-semibold">Sales Growth</h3>
                <p className="text-sm text-muted-foreground">
                  Pertumbuhan penjualan periode {selectedWeek}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <select
                  value={selectedWeek}
                  onChange={(e) => setSelectedWeek(e.target.value)}
                  className="border px-3 py-2 rounded-lg text-sm bg-white"
                >
                  {Object.keys(weeklySalesData).map((week) => (
                    <option key={week} value={week}>
                      {week}
                    </option>
                  ))}
                </select>

                <button
                  onClick={exportWeeklySalesCSV}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 transition"
                >
                  Export CSV
                </button>
              </div>
            </div>

            <div className="w-full overflow-x-auto">
              <svg viewBox="0 0 700 260" className="min-w-[650px] w-full h-72">
                {[50, 100, 150, 200].map((y) => (
                  <line
                    key={y}
                    x1="40"
                    y1={y}
                    x2="660"
                    y2={y}
                    stroke="#e5e7eb"
                    strokeWidth="1"
                  />
                ))}

                <polyline
                  fill="none"
                  stroke="#16a34a"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={weeklySales
                    .map((item, index) => {
                      const x = 60 + index * 95
                      const y = 220 - (item.sales / maxSales) * 170
                      return `${x},${y}`
                    })
                    .join(" ")}
                />

                {weeklySales.map((item, index) => {
                  const x = 60 + index * 95
                  const y = 220 - (item.sales / maxSales) * 170

                  return (
                    <g key={item.day}>
                      <circle cx={x} cy={y} r="6" fill="#16a34a" />

                      <text
                        x={x}
                        y={245}
                        textAnchor="middle"
                        className="fill-slate-500 text-xs"
                      >
                        {item.day.slice(0, 3)}
                      </text>

                      <text
                        x={x}
                        y={y - 12}
                        textAnchor="middle"
                        className="fill-slate-700 text-xs font-semibold"
                      >
                        {(item.sales / 1000000).toFixed(1)}jt
                      </text>
                    </g>
                  )
                })}
              </svg>
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
