import { useEffect, useState } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { useServerFn } from "@tanstack/react-start"
import { getSellerDashboardFn } from "#/features/dashboard/api"

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
          <p className="text-sm text-gray-500">Performa penjualan</p>
          <h2 className="mt-2 text-3xl font-semibold text-gray-800">{formatRupiah(data.totalRevenue)}</h2>
          <div className="mt-6 h-40 rounded-lg bg-green-50 p-4">
            <div className="flex h-full items-end gap-3">
              {[32, 52, 44, 68, 58, 76, 64].map((height, index) => (
                <div key={index} className="flex flex-1 items-end">
                  <div className="w-full rounded-t-md bg-green-500" style={{ height: `${height}%` }} />
                </div>
              ))}
            </div>
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
