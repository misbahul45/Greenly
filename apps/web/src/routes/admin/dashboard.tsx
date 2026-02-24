"use client"

import { createFileRoute } from "@tanstack/react-router"
import {
  TrendingUp,
  ShoppingCart,
  Store,
  ClipboardCheck,
} from "lucide-react"

export const Route = createFileRoute("/admin/dashboard")({
  component: DashboardAdmin,
})

function DashboardAdmin() {
  return (
    <div className="space-y-6">
      {/* WELCOME */}
      <div className="rounded-2xl bg-white p-6 ring-1 ring-black/5 shadow-sm">
        <h1 className="text-2xl font-semibold text-[#674636]">
          Selamat datang kembali, Admin 👋
        </h1>
        <p className="mt-2 text-sm text-foreground/60">
          Berikut adalah statistik kinerja platform Greenly Mart.
        </p>
      </div>

      {/* STAT CARDS */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Penjualan"
          value="Rp 18.750.000"
          icon={<TrendingUp size={18} />}
        />
        <StatCard
          title="Total Pesanan"
          value="780"
          icon={<ShoppingCart size={18} />}
        />
        <StatCard
          title="Toko Aktif"
          value="134"
          icon={<Store size={18} />}
        />
        <StatCard
          title="Menunggu Approval"
          value="4"
          icon={<ClipboardCheck size={18} />}
        />
      </div>

      {/* CHART SECTION */}
      <div className="grid gap-6 xl:grid-cols-2">
        <ChartCard title="Total Penjualan">
          <div className="h-64 rounded-xl bg-[#e8f2ec]" />
        </ChartCard>

        <ChartCard title="Total Pesanan">
          <div className="h-64 rounded-xl bg-[#f4eee6]" />
        </ChartCard>
      </div>

      {/* TABLE + SIDE INFO */}
      <div className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <Card title="Pesanan Terbaru">
            <table className="w-full text-sm">
              <thead className="text-left text-foreground/60">
                <tr>
                  <th className="pb-3">Order ID</th>
                  <th className="pb-3">Customer</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="space-y-2">
                <tr className="border-t">
                  <td className="py-3">PJ2442204</td>
                  <td>Rizky Aditya</td>
                  <td>
                    <StatusChip color="green">Selesai</StatusChip>
                  </td>
                </tr>
                <tr className="border-t">
                  <td className="py-3">PJ2442203</td>
                  <td>Putri Dewi</td>
                  <td>
                    <StatusChip color="yellow">Proses</StatusChip>
                  </td>
                </tr>
                <tr className="border-t">
                  <td className="py-3">PJ2442202</td>
                  <td>Agus Pratama</td>
                  <td>
                    <StatusChip color="blue">Baru</StatusChip>
                  </td>
                </tr>
              </tbody>
            </table>
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Pengajuan Toko Baru">
            <ul className="space-y-3 text-sm">
              <li>Kebun Hidro Sejahtera</li>
              <li>Tani Sejahtera</li>
              <li>Panen Organik Asli</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  )
}

/* COMPONENTS */

function StatCard({
  title,
  value,
  icon,
}: {
  title: string
  value: string
  icon: React.ReactNode
}) {
  return (
    <div className="rounded-2xl bg-white p-4 ring-1 ring-black/5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs text-foreground/60">{title}</div>
          <div className="mt-2 text-xl font-semibold text-[#674636]">
            {value}
          </div>
        </div>
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#2f6b3b]/10 text-[#2f6b3b]">
          {icon}
        </div>
      </div>
    </div>
  )
}

function Card({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-2xl bg-white p-5 ring-1 ring-black/5 shadow-sm">
      <div className="mb-4 text-sm font-semibold text-[#674636]">
        {title}
      </div>
      {children}
    </div>
  )
}

function ChartCard({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-2xl bg-white p-5 ring-1 ring-black/5 shadow-sm">
      <div className="mb-4 text-sm font-semibold text-[#674636]">
        {title}
      </div>
      {children}
    </div>
  )
}

function StatusChip({
  children,
  color,
}: {
  children: React.ReactNode
  color: "green" | "yellow" | "blue"
}) {
  const colors = {
    green: "bg-green-100 text-green-700",
    yellow: "bg-yellow-100 text-yellow-700",
    blue: "bg-blue-100 text-blue-700",
  }

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-medium ${colors[color]}`}
    >
      {children}
    </span>
  )
}