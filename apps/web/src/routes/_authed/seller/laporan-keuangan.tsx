import { createFileRoute } from "@tanstack/react-router"
import { useServerFn } from "@tanstack/react-start"
import { useCallback, useEffect, useMemo, useState } from "react"
import { toast } from "sonner"

import {
  getMyShopFn,
  getShopBalanceFn,
  getShopLedgerFn,
} from "#/features/seller/api"

export const Route = createFileRoute("/_authed/seller/laporan-keuangan")({
  component: LaporanKeuanganPage,
})

type LedgerItem = {
  id: string
  description?: string | null
  reference?: string | null
  type: "CREDIT" | "DEBIT"
  amount: number | string
  createdAt: string
}

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value)
}

function LaporanKeuanganPage() {
  const getMyShop = useServerFn(getMyShopFn)
  const getBalance = useServerFn(getShopBalanceFn)
  const getLedger = useServerFn(getShopLedgerFn)

  const [shopId, setShopId] = useState<string | null>(null)
  const [balance, setBalance] = useState(0)
  const [ledger, setLedger] = useState<LedgerItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState<"Semua" | "CREDIT" | "DEBIT">(
    "Semua"
  )

  useEffect(() => {
    let mounted = true

    getMyShop()
      .then((res) => {
        const id = res.data?.id ?? res.data?.shop?.id
        if (mounted && id) setShopId(id)
      })
      .catch(() => {
        toast.error("Gagal memuat data toko")
        setLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [getMyShop])

  const fetchData = useCallback(async () => {
    if (!shopId) return

    setLoading(true)
    try {
      const [balanceRes, ledgerRes] = await Promise.all([
        getBalance({ data: { shopId } }),
        getLedger({ data: { shopId, limit: 100 } }),
      ])

      setBalance(Number(balanceRes.data?.balance ?? 0))
      setLedger(ledgerRes.data ?? [])
    } catch {
      toast.error("Gagal memuat data keuangan")
    } finally {
      setLoading(false)
    }
  }, [getBalance, getLedger, shopId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const filteredLedger = useMemo(() => {
    const query = search.toLowerCase()

    return ledger.filter((item) => {
      const matchesSearch =
        item.description?.toLowerCase().includes(query) ||
        item.reference?.toLowerCase().includes(query)
      const matchesType = typeFilter === "Semua" || item.type === typeFilter

      return matchesSearch && matchesType
    })
  }, [ledger, search, typeFilter])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Laporan Keuangan</h1>
        <p className="text-sm text-muted-foreground">
          Pantau saldo dan riwayat transaksi toko Anda.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-black/5">
          <p className="text-sm text-muted-foreground">Saldo Saat Ini</p>
          <p className="text-2xl font-bold text-green-600">
            {formatRupiah(balance)}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-black/5 md:flex-row">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari deskripsi atau referensi"
          className="flex-1 rounded-lg border px-4 py-2 text-sm"
        />
        <select
          value={typeFilter}
          onChange={(e) =>
            setTypeFilter(e.target.value as "Semua" | "CREDIT" | "DEBIT")
          }
          className="rounded-lg border px-3 py-2 text-sm"
        >
          <option value="Semua">Semua Tipe</option>
          <option value="CREDIT">Pemasukan (CREDIT)</option>
          <option value="DEBIT">Pengeluaran (DEBIT)</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-black/5">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3">Tanggal</th>
              <th className="p-3">Deskripsi</th>
              <th className="p-3">Referensi</th>
              <th className="p-3">Tipe</th>
              <th className="p-3">Jumlah</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="p-10 text-center">
                  Memuat...
                </td>
              </tr>
            ) : filteredLedger.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-10 text-center">
                  Tidak ada data
                </td>
              </tr>
            ) : (
              filteredLedger.map((item) => (
                <tr key={item.id} className="border-t">
                  <td className="p-3">
                    {new Date(item.createdAt).toLocaleDateString("id-ID")}
                  </td>
                  <td className="p-3">{item.description ?? "-"}</td>
                  <td className="p-3 font-mono text-xs">
                    {item.reference ?? "-"}
                  </td>
                  <td className="p-3">
                    <span
                      className={[
                        "rounded-full px-2 py-0.5 text-[10px] font-bold",
                        item.type === "CREDIT"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700",
                      ].join(" ")}
                    >
                      {item.type}
                    </span>
                  </td>
                  <td
                    className={[
                      "p-3 font-semibold",
                      item.type === "CREDIT"
                        ? "text-green-600"
                        : "text-red-600",
                    ].join(" ")}
                  >
                    {item.type === "CREDIT" ? "+" : "-"}
                    {formatRupiah(Number(item.amount))}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
