import { useEffect, useState } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { useServerFn } from "@tanstack/react-start"
import { getSellerDashboardFn } from "#/server/dashboard"

export const Route = createFileRoute("/_authed/seller/dashboard")({
  component: SellerDashboard,
})

type SellerDashboardData = Awaited<ReturnType<typeof getSellerDashboardFn>>

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value)
}

function SellerDashboard() {
  const getDashboard = useServerFn(getSellerDashboardFn)
  const [data, setData] = useState<SellerDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
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

  useEffect(() => {
    getDashboard()
      .then((result) => {
        setData(result)
        setError(null)
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Gagal memuat dashboard")
      })
      .finally(() => setLoading(false))
  }, [getDashboard])

  if (loading) {
    return <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-black/5">Memuat dashboard...</div>
  }

  if (error || !data) {
    return <div className="rounded-xl bg-white p-6 text-red-600 shadow-sm ring-1 ring-black/5">{error ?? "Data tidak tersedia"}</div>
  }

  const weeklySales = weeklySalesData[selectedWeek as keyof typeof weeklySalesData]
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
    link.download = `sales-${selectedWeek
      .replaceAll(" ", "-")
      .toLowerCase()}.csv`

    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-800">Seller Dashboard</h1>
        <p className="text-sm text-gray-500">Ringkasan toko {data.shopName} dari backend Greenly.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <SummaryCard title="Produk" value={data.totalProducts.toLocaleString("id-ID")} />
        <SummaryCard title="Pesanan" value={data.totalOrders.toLocaleString("id-ID")} />
        <SummaryCard title="Revenue" value={formatRupiah(data.totalRevenue)} />
        <SummaryCard title="Saldo" value={formatRupiah(data.balance)} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-black/5 lg:col-span-2">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-semibold">Sales Growth</h3>
              <p className="text-sm text-muted-foreground">
                Pertumbuhan penjualan periode {selectedWeek}
              </p>
              <p className="mt-2 text-2xl font-semibold text-gray-800">
                {formatRupiah(data.totalRevenue)}
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <select
                value={selectedWeek}
                onChange={(e) => setSelectedWeek(e.target.value)}
                className="rounded-lg border bg-white px-3 py-2 text-sm"
              >
                {Object.keys(weeklySalesData).map((week) => (
                  <option key={week} value={week}>
                    {week}
                  </option>
                ))}
              </select>

              <button
                onClick={exportWeeklySalesCSV}
                className="rounded-lg bg-green-600 px-4 py-2 text-sm text-white transition hover:bg-green-700"
              >
                Export CSV
              </button>
            </div>
          </div>

          <div className="w-full overflow-x-auto">
            <svg viewBox="0 0 700 260" className="h-72 w-full min-w-[650px]">
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
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="4"
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

        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-black/5">
          <h3 className="font-semibold text-gray-800">Yang Perlu Dipantau</h3>
          <div className="mt-4 space-y-3">
            <TodoItem label="Produk aktif" value={data.totalProducts} />
            <TodoItem label="Pesanan masuk" value={data.totalOrders} />
            <TodoItem label="Saldo tersedia" value={formatRupiah(data.balance)} />
          </div>
        </div>
      </div>
    </div>
  )
}

function SummaryCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-black/5">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">{title}</p>
      <p className="mt-2 text-2xl font-semibold text-gray-900">{value}</p>
    </div>
  )
}

function TodoItem({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3 text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="font-semibold text-gray-800">{value}</span>
    </div>
  )
}
