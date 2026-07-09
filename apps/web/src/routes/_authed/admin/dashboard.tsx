import { useEffect, useState } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { useServerFn } from "@tanstack/react-start"
import { getAdminDashboardFn } from "#/server/dashboard.server"

export const Route = createFileRoute("/_authed/admin/dashboard")({
  component: AdminDashboard,
})

type AdminDashboardData = Awaited<ReturnType<typeof getAdminDashboardFn>>

/*
const weeklySalesData = { ... } // static dummy data replaced by API
const orders = [ ... ] // static dummy orders replaced by API
*/

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value)
}

function AdminDashboard() {
  const getDashboard = useServerFn(getAdminDashboardFn)
  const [data, setData] = useState<AdminDashboardData | null>(null)
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
        <div className="grid md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white p-4 rounded-xl shadow-sm ring-1 ring-black/5 animate-pulse h-24" />
          ))}
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="rounded-xl bg-white p-6 text-red-600 shadow-sm ring-1 ring-black/5">
        {error ?? "Data tidak tersedia"}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-4 gap-4">
        <StatCard title="Total Customer" value={data.totalUsers.toLocaleString("id-ID")} />
        <StatCard title="Toko Terdaftar" value={data.totalShops.toLocaleString("id-ID")} />
        <StatCard title="Total Pesanan" value={data.totalOrders.toLocaleString("id-ID")} />
        <StatCard title="Total Revenue" value={formatRupiah(data.totalRevenue)} />
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <StatCard title="Total Produk" value={data.totalProducts.toLocaleString("id-ID")} />
        <StatCard title="Total Kategori" value={data.totalCategories.toLocaleString("id-ID")} />
        <StatCard
          title="Status ML Engine"
          value={data.mlStatus === "online" ? "Online" : "Tidak Tersedia"}
          accent={data.mlStatus === "online" ? "green" : "gray"}
        />
      </div>
    </div>
  )
}

function StatCard({
  title,
  value,
  accent = "default",
}: {
  title: string
  value: string
  accent?: "green" | "gray" | "default"
}) {
  const valueColor =
    accent === "green"
      ? "text-green-600"
      : accent === "gray"
      ? "text-muted-foreground"
      : "text-gray-900"

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm ring-1 ring-black/5">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">{title}</p>
      <p className={`mt-2 text-2xl font-semibold ${valueColor}`}>{value}</p>
    </div>
  )
}
