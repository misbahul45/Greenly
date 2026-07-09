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

const ORDER_STATUS_DATA = [
  { label: "Pending", value: 4, color: "#eab308" },
  { label: "Dibayar", value: 8, color: "#3b82f6" },
  { label: "Diproses", value: 12, color: "#8b5cf6" },
  { label: "Dikirim", value: 7, color: "#6366f1" },
  { label: "Selesai", value: 31, color: "#22c55e" },
  { label: "Batal", value: 2, color: "#ef4444" },
]

function SellerDashboard() {
  const getDashboard = useServerFn(getSellerDashboardFn)
  const [data, setData] = useState<SellerDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-5 shadow-sm ring-1 ring-black/5 animate-pulse h-24" />
          ))}
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl p-5 shadow-sm ring-1 ring-black/5 animate-pulse h-64" />
          <div className="bg-white rounded-xl p-5 shadow-sm ring-1 ring-black/5 animate-pulse h-64" />
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="rounded-xl bg-white p-6 text-red-600 shadow-sm ring-1 ring-black/5">
        <p className="font-medium">Gagal memuat dashboard</p>
        <p className="text-sm mt-1 text-red-500">{error ?? "Data tidak tersedia"}</p>
      </div>
    )
  }

  const maxOrderStatus = Math.max(...ORDER_STATUS_DATA.map((s) => s.value), 1)
  const totalOrderStatus = ORDER_STATUS_DATA.reduce((a, b) => a + b.value, 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-800">Seller Dashboard</h1>
        <p className="text-sm text-gray-500">Ringkasan toko <span className="font-medium text-gray-700">{data.shopName}</span></p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Produk"
          value={data.totalProducts.toLocaleString("id-ID")}
          icon="📦"
          color="bg-blue-50 text-blue-600"
        />
        <StatCard
          title="Total Pesanan"
          value={data.totalOrders.toLocaleString("id-ID")}
          icon="🧾"
          color="bg-purple-50 text-purple-600"
        />
        <StatCard
          title="Total Revenue"
          value={formatRupiah(data.totalRevenue)}
          icon="💰"
          color="bg-green-50 text-green-600"
        />
        <StatCard
          title="Saldo Toko"
          value={formatRupiah(data.balance)}
          icon="🏦"
          color="bg-orange-50 text-orange-600"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm ring-1 ring-black/5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-gray-800">Status Pesanan</h3>
              <p className="text-xs text-gray-400 mt-0.5">Total {totalOrderStatus} pesanan</p>
            </div>
          </div>

          <div className="space-y-3">
            {ORDER_STATUS_DATA.map((item) => (
              <div key={item.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">{item.label}</span>
                  <span className="font-medium text-gray-800">{item.value}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5">
                  <div
                    className="h-2.5 rounded-full transition-all duration-500"
                    style={{
                      width: `${(item.value / maxOrderStatus) * 100}%`,
                      backgroundColor: item.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm ring-1 ring-black/5">
          <div className="mb-4">
            <h3 className="font-semibold text-gray-800">Distribusi Status</h3>
            <p className="text-xs text-gray-400 mt-0.5">Proporsi setiap status pesanan</p>
          </div>

          <div className="flex items-end justify-around gap-2 h-44">
            {ORDER_STATUS_DATA.map((item) => {
              const heightPct = Math.max((item.value / maxOrderStatus) * 100, 4)
              return (
                <div key={item.label} className="flex flex-col items-center gap-1.5 flex-1">
                  <span className="text-xs font-medium text-gray-700">{item.value}</span>
                  <div
                    className="w-full rounded-t-md transition-all duration-500"
                    style={{
                      height: `${heightPct}%`,
                      backgroundColor: item.color,
                      opacity: 0.85,
                    }}
                  />
                  <span className="text-[10px] text-gray-500 text-center leading-tight">
                    {item.label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="md:col-span-2 bg-white rounded-xl p-6 shadow-sm ring-1 ring-black/5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-gray-800">Revenue vs Saldo</h3>
              <p className="text-xs text-gray-400 mt-0.5">Perbandingan total revenue dan saldo tersedia</p>
            </div>
          </div>

          <div className="flex gap-6 items-end h-36">
            {[
              { label: "Revenue", value: data.totalRevenue, color: "#22c55e" },
              { label: "Saldo", value: data.balance, color: "#3b82f6" },
            ].map((item) => {
              const max = Math.max(data.totalRevenue, data.balance, 1)
              const pct = Math.max((item.value / max) * 100, 4)
              return (
                <div key={item.label} className="flex flex-col items-center gap-1.5 flex-1">
                  <span className="text-xs font-medium text-gray-700 text-center">{formatRupiah(item.value)}</span>
                  <div
                    className="w-full rounded-t-lg transition-all duration-500"
                    style={{ height: `${pct}%`, backgroundColor: item.color }}
                  />
                  <span className="text-sm text-gray-500">{item.label}</span>
                </div>
              )
            })}

            <div className="flex-1 flex flex-col items-center gap-1.5">
              <span className="text-xs font-medium text-gray-700">{data.totalProducts}</span>
              <div
                className="w-full rounded-t-lg bg-purple-400 transition-all duration-500"
                style={{ height: "60%" }}
              />
              <span className="text-sm text-gray-500">Produk</span>
            </div>

            <div className="flex-1 flex flex-col items-center gap-1.5">
              <span className="text-xs font-medium text-gray-700">{data.totalOrders}</span>
              <div
                className="w-full rounded-t-lg bg-orange-400 transition-all duration-500"
                style={{ height: "40%" }}
              />
              <span className="text-sm text-gray-500">Pesanan</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm ring-1 ring-black/5">
          <h3 className="font-semibold text-gray-800 mb-4">Ringkasan</h3>
          <div className="space-y-3">
            {[
              { label: "Produk aktif", value: data.totalProducts.toLocaleString("id-ID") },
              { label: "Total pesanan", value: data.totalOrders.toLocaleString("id-ID") },
              { label: "Revenue", value: formatRupiah(data.totalRevenue) },
              { label: "Saldo", value: formatRupiah(data.balance) },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-2.5 text-sm">
                <span className="text-gray-500">{item.label}</span>
                <span className="font-semibold text-gray-800">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, icon, color }: { title: string; value: string; icon: string; color: string }) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm ring-1 ring-black/5">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${color}`}>
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-xs text-gray-400 uppercase tracking-wide truncate">{title}</p>
          <p className="mt-0.5 text-base font-semibold text-gray-900 truncate">{value}</p>
        </div>
      </div>
    </div>
  )
}
