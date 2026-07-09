import { useEffect, useState } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { useServerFn } from "@tanstack/react-start"
import { getAdminDashboardFn } from "#/server/dashboard"

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
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-5 shadow-sm ring-1 ring-black/5 animate-pulse h-28" />
          ))}
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-5 shadow-sm ring-1 ring-black/5 animate-pulse h-28" />
          ))}
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

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard Admin</h1>
        <p className="text-sm text-muted-foreground mt-1">Ringkasan platform Greenly Mart secara keseluruhan.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Customer"
          value={data.totalUsers.toLocaleString("id-ID")}
          icon={<UserIcon />}
          color="blue"
        />
        <StatCard
          title="Toko Terdaftar"
          value={data.totalShops.toLocaleString("id-ID")}
          icon={<ShopIcon />}
          color="green"
        />
        <StatCard
          title="Total Pesanan"
          value={data.totalOrders.toLocaleString("id-ID")}
          icon={<OrderIcon />}
          color="purple"
        />
        <StatCard
          title="Total Revenue"
          value={formatRupiah(data.totalRevenue)}
          icon={<RevenueIcon />}
          color="orange"
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard
          title="Total Produk"
          value={data.totalProducts.toLocaleString("id-ID")}
          icon={<ProductIcon />}
          color="teal"
        />
        <StatCard
          title="Total Kategori"
          value={data.totalCategories.toLocaleString("id-ID")}
          icon={<CategoryIcon />}
          color="indigo"
        />
        <div className="bg-white rounded-xl p-5 shadow-sm ring-1 ring-black/5 flex items-center gap-4">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${data.mlStatus === "online" ? "bg-green-100" : "bg-gray-100"}`}>
            <MlIcon active={data.mlStatus === "online"} />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">ML Engine</p>
            <p className={`mt-1 text-lg font-semibold ${data.mlStatus === "online" ? "text-green-600" : "text-gray-400"}`}>
              {data.mlStatus === "online" ? "Online" : "Offline"}
            </p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm ring-1 ring-black/5">
          <h3 className="font-semibold text-gray-800 mb-4">Distribusi Platform</h3>
          <div className="space-y-3">
            <ProgressRow label="Customer" value={data.totalUsers} max={Math.max(data.totalUsers, data.totalShops, data.totalOrders, 1)} color="bg-blue-500" />
            <ProgressRow label="Toko" value={data.totalShops} max={Math.max(data.totalUsers, data.totalShops, data.totalOrders, 1)} color="bg-green-500" />
            <ProgressRow label="Pesanan" value={data.totalOrders} max={Math.max(data.totalUsers, data.totalShops, data.totalOrders, 1)} color="bg-purple-500" />
            <ProgressRow label="Produk" value={data.totalProducts} max={Math.max(data.totalUsers, data.totalShops, data.totalOrders, data.totalProducts, 1)} color="bg-teal-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm ring-1 ring-black/5">
          <h3 className="font-semibold text-gray-800 mb-4">Ringkasan Keuangan</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-50">
              <span className="text-sm text-gray-500">Total Revenue Platform</span>
              <span className="font-semibold text-gray-900">{formatRupiah(data.totalRevenue)}</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-50">
              <span className="text-sm text-gray-500">Rata-rata per Pesanan</span>
              <span className="font-semibold text-gray-900">
                {data.totalOrders > 0 ? formatRupiah(Math.round(data.totalRevenue / data.totalOrders)) : "Rp 0"}
              </span>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="text-sm text-gray-500">Produk per Toko</span>
              <span className="font-semibold text-gray-900">
                {data.totalShops > 0 ? Math.round(data.totalProducts / data.totalShops) : 0} produk
              </span>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}

function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string
  value: string
  icon: React.ReactNode
  color: "blue" | "green" | "purple" | "orange" | "teal" | "indigo"
}) {
  const bg: Record<typeof color, string> = {
    blue: "bg-blue-100",
    green: "bg-green-100",
    purple: "bg-purple-100",
    orange: "bg-orange-100",
    teal: "bg-teal-100",
    indigo: "bg-indigo-100",
  }

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm ring-1 ring-black/5 flex items-center gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${bg[color]}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide truncate">{title}</p>
        <p className="mt-1 text-lg font-semibold text-gray-900 truncate">{value}</p>
      </div>
    </div>
  )
}

function ProgressRow({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-500">{label}</span>
        <span className="font-medium text-gray-700">{value.toLocaleString("id-ID")}</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2">
        <div className={`${color} h-2 rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

function UserIcon() {
  return (
    <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
    </svg>
  )
}

function ShopIcon() {
  return (
    <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  )
}

function OrderIcon() {
  return (
    <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
      <rect x="9" y="3" width="6" height="4" rx="1" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6M9 16h4" />
    </svg>
  )
}

function RevenueIcon() {
  return (
    <svg className="w-5 h-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <line x1="12" y1="1" x2="12" y2="23" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
    </svg>
  )
}

function ProductIcon() {
  return (
    <svg className="w-5 h-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
    </svg>
  )
}

function CategoryIcon() {
  return (
    <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  )
}

function MlIcon({ active }: { active: boolean }) {
  return (
    <svg className={`w-5 h-5 ${active ? "text-green-600" : "text-gray-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <circle cx="12" cy="12" r="3" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v2M12 20v2M2 12h2M20 12h2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  )
}
