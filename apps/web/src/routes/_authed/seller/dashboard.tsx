import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_authed/seller/dashboard")({
  component: SellerDashboard,
})

const selectedMonth = "Desember 2025"

const weeklySales = [
  { week: "Minggu 1", period: "1 - 7 Des", sales: 3200000 },
  { week: "Minggu 2", period: "8 - 14 Des", sales: 4100000 },
  { week: "Minggu 3", period: "15 - 21 Des", sales: 5300000 },
  { week: "Minggu 4", period: "22 - 31 Des", sales: 6450000 },
]

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value)
}

function exportSalesCSV() {
  const headers = ["Bulan", "Minggu", "Periode", "Penjualan"]
  const rows = weeklySales.map((item) => [
    selectedMonth,
    item.week,
    item.period,
    item.sales,
  ])

  const csvContent = [headers, ...rows]
    .map((row) => row.join(","))
    .join("\n")

  const blob = new Blob([csvContent], {
    type: "text/csv;charset=utf-8;",
  })

  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")

  link.href = url
  link.download = `penjualan-mingguan-${selectedMonth
    .toLowerCase()
    .replaceAll(" ", "-")}.csv`

  link.click()
  URL.revokeObjectURL(url)
}

function SellerDashboard() {
  const totalSales = weeklySales.reduce((sum, item) => sum + item.sales, 0)

  const chartWidth = 700
  const chartHeight = 280
  const paddingX = 60
  const paddingTop = 35
  const paddingBottom = 55

  const maxSales = Math.max(...weeklySales.map((item) => item.sales))
  const minSales = Math.min(...weeklySales.map((item) => item.sales))

  const points = weeklySales.map((item, index) => {
    const x =
      paddingX +
      (index / (weeklySales.length - 1)) * (chartWidth - paddingX * 2)

    const y =
      chartHeight -
      paddingBottom -
      ((item.sales - minSales) / (maxSales - minSales || 1)) *
        (chartHeight - paddingTop - paddingBottom)

    return { ...item, x, y }
  })

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

          <div className="flex gap-2 text-xs">
            <button className="px-3 py-1 rounded-md bg-gray-100 text-gray-800">
              Bulan Ini
            </button>
            <button className="px-3 py-1 rounded-md text-gray-500 hover:bg-gray-100">
              Bulan Lalu
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* LINE CHART */}
          <div className="md:col-span-2 bg-white rounded-xl p-5 shadow-sm ring-1 ring-black/5">
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-xs text-gray-400">
                  GRAFIK PENJUALAN MINGGUAN
                </p>
                <h2 className="text-2xl font-semibold text-gray-800">
                  {formatRupiah(totalSales)}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Periode: {selectedMonth}
                </p>
              </div>

              <button
                onClick={exportSalesCSV}
                className="px-4 py-2 rounded-xl bg-green-600 text-white text-sm font-medium hover:bg-green-700"
              >
                Ekspor CSV
              </button>
            </div>

            <div className="h-72 w-full">
              <svg
                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                className="w-full h-full"
                preserveAspectRatio="none"
              >
                {/* GRID */}
                {[0, 1, 2, 3].map((i) => {
                  const y = paddingTop + i * 55

                  return (
                    <line
                      key={i}
                      x1={paddingX}
                      y1={y}
                      x2={chartWidth - paddingX}
                      y2={y}
                      stroke="#e5e7eb"
                      strokeWidth="1"
                    />
                  )
                })}

                {/* LINE */}
                <polyline
                  fill="none"
                  stroke="rgb(34 197 94)"
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={points.map((p) => `${p.x},${p.y}`).join(" ")}
                />

                {/* POINTS */}
                {points.map((item) => (
                  <g key={item.week}>
                    <circle
                      cx={item.x}
                      cy={item.y}
                      r="6"
                      fill="rgb(34 197 94)"
                    />

                    <text
                      x={item.x}
                      y={item.y - 14}
                      textAnchor="middle"
                      fontSize="12"
                      fill="#334155"
                      fontWeight="600"
                    >
                      {formatRupiah(item.sales)}
                    </text>

                    <text
                      x={item.x}
                      y={chartHeight - 28}
                      textAnchor="middle"
                      fontSize="13"
                      fill="#475569"
                    >
                      {item.week}
                    </text>

                    <text
                      x={item.x}
                      y={chartHeight - 10}
                      textAnchor="middle"
                      fontSize="11"
                      fill="#94a3b8"
                    >
                      {item.period}
                    </text>
                  </g>
                ))}
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