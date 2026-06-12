import { useEffect, useState } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { useServerFn } from "@tanstack/react-start"
import { getAdminDashboardFn } from "#/features/dashboard/api"

export const Route = createFileRoute("/_authed/admin/dashboard")({
  component: AdminDashboard,
})

type AdminDashboardData = Awaited<ReturnType<typeof getAdminDashboardFn>>

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
    return <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-black/5">Memuat dashboard...</div>
  }

  if (error || !data) {
    return <div className="rounded-xl bg-white p-6 text-red-600 shadow-sm ring-1 ring-black/5">{error ?? "Data tidak tersedia"}</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-800">Admin Dashboard</h1>
        <p className="text-sm text-gray-500">Ringkasan operasional Greenly dari backend aktif.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
        <SummaryCard title="Customer" value={data.totalUsers.toLocaleString("id-ID")} />
        <SummaryCard title="Toko" value={data.totalShops.toLocaleString("id-ID")} />
        <SummaryCard title="Pesanan" value={data.totalOrders.toLocaleString("id-ID")} />
        <SummaryCard title="Produk" value={data.totalProducts.toLocaleString("id-ID")} />
        <SummaryCard title="Kategori" value={data.totalCategories.toLocaleString("id-ID")} />
        <SummaryCard title="ML Service" value={data.mlStatus} tone={data.mlStatus === "online" ? "green" : "red"} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-black/5 lg:col-span-2">
          <p className="text-sm text-gray-500">Estimasi revenue dari pesanan terbaru</p>
          <h2 className="mt-2 text-3xl font-semibold text-gray-800">{formatRupiah(data.totalRevenue)}</h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <Metric label="Order tercatat" value={data.totalOrders} />
            <Metric label="Produk aktif" value={data.totalProducts} />
            <Metric label="Kategori katalog" value={data.totalCategories} />
          </div>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-black/5">
          <h3 className="font-semibold text-gray-800">Status Sistem</h3>
          <div className="mt-4 space-y-3 text-sm">
            <StatusRow label="Core API" value="online" />
            <StatusRow label="Catalog API" value={data.totalProducts >= 0 ? "online" : "offline"} />
            <StatusRow label="ML API" value={data.mlStatus} />
          </div>
        </div>
      </div>
    </div>
  )
}

function SummaryCard({ title, value, tone = "neutral" }: { title: string; value: string; tone?: "neutral" | "green" | "red" }) {
  const color = tone === "green" ? "text-green-600" : tone === "red" ? "text-red-600" : "text-gray-900"

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-black/5">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">{title}</p>
      <p className={`mt-2 text-2xl font-semibold ${color}`}>{value}</p>
    </div>
  )
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-gray-50 p-4">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-1 text-xl font-semibold text-gray-800">{value.toLocaleString("id-ID")}</p>
    </div>
  )
}

function StatusRow({ label, value }: { label: string; value: string }) {
  const online = value === "online"

  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-500">{label}</span>
      <span className={online ? "font-medium text-green-600" : "font-medium text-red-600"}>{value}</span>
    </div>
  )
}
