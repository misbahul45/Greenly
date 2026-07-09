import { createFileRoute } from "@tanstack/react-router"
import { useMemo, useState, useEffect, useCallback } from "react"
import { useServerFn } from "@tanstack/react-start"
import { firstShopFromPayload, getShopBalanceFn, getShopLedgerFn, getMyShopFn } from "#/features/seller/api"
import { toast } from "sonner"

export const Route = createFileRoute("/_authed/seller/laporan-keuangan")({
  component: LaporanKeuanganPage,
})

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
  const [ledger, setLedger] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("Semua")

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    getMyShop().then(res => {
      if (cancelled) return;
      const shop = firstShopFromPayload(res);
      const id = shop?.id;
      if (id) {
        setShopId(id);
      } else {
        toast.error("Toko seller tidak ditemukan");
        setLoading(false);
      }
    }).catch(() => {
      if (cancelled) return;
      toast.error("Gagal memuat toko seller");
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [getMyShop]);

  const fetchData = useCallback(async () => {
    if (!shopId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [balRes, ledgerRes] = await Promise.all([
        getBalance({ data: { shopId } }),
        getLedger({ data: { shopId, limit: 100 } })
      ]);
      setBalance(Number(balRes.data?.balance ?? 0));
      setLedger(ledgerRes.data);
    } catch (err) {
      toast.error("Gagal memuat data keuangan");
    } finally {
      setLoading(false);
    }
  }, [shopId, getBalance, getLedger]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredLedger = useMemo(() => {
    return ledger.filter(item => {
      const matchesSearch = item.description?.toLowerCase().includes(search.toLowerCase()) ||
                            item.reference?.toLowerCase().includes(search.toLowerCase());
      const matchesType = typeFilter === "Semua" || item.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [ledger, search, typeFilter]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Laporan Keuangan</h1>
        <p className="text-sm text-muted-foreground">Pantau saldo dan riwayat transaksi toko Anda.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm ring-1 ring-black/5">
          <p className="text-sm text-muted-foreground">Saldo Saat Ini</p>
          <p className="text-2xl font-bold text-green-600">{formatRupiah(balance)}</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm ring-1 ring-black/5 flex flex-col md:flex-row gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari deskripsi atau referensi"
          className="flex-1 border rounded-lg px-4 py-2 text-sm"
        />
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm"
        >
          <option value="Semua">Semua Tipe</option>
          <option value="CREDIT">Pemasukan (CREDIT)</option>
          <option value="DEBIT">Pengeluaran (DEBIT)</option>
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm ring-1 ring-black/5 overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3">Tanggal</th>
              <th>Deskripsi</th>
              <th>Referensi</th>
              <th>Tipe</th>
              <th>Jumlah</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="p-10 text-center">Memuat...</td></tr>
            ) : filteredLedger.length === 0 ? (
              <tr><td colSpan={5} className="p-10 text-center">Tidak ada data</td></tr>
            ) : (
              filteredLedger.map((item) => (
                <tr key={item.id} className="border-t">
                  <td className="p-3">{new Date(item.createdAt).toLocaleDateString("id-ID")}</td>
                  <td>{item.description}</td>
                  <td className="font-mono text-xs">{item.reference}</td>
                  <td>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${item.type === 'CREDIT' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {item.type}
                    </span>
                  </td>
                  <td className={`font-semibold ${item.type === 'CREDIT' ? 'text-green-600' : 'text-red-600'}`}>
                    {item.type === 'CREDIT' ? '+' : '-'}{formatRupiah(Number(item.amount))}
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
