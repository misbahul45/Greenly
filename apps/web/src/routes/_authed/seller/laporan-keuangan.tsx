import { createFileRoute } from "@tanstack/react-router"
import { useMemo, useState } from "react"

export const Route = createFileRoute("/_authed/seller/laporan-keuangan")({
  component: LaporanKeuanganPage,
})

const transaksi = [
  {
    id: "TRX-001",
    tanggal: "2026-05-01",
    customer: "Andi Wijaya",
    produk: "Kaos Oversize",
    kategori: "Pemasukan",
    metode: "Transfer Bank",
    status: "Berhasil",
    jumlah: 180000,
  },
  {
    id: "TRX-002",
    tanggal: "2026-05-03",
    customer: "Siska Mawar",
    produk: "Totebag Canvas",
    kategori: "Pemasukan",
    metode: "QRIS",
    status: "Berhasil",
    jumlah: 120000,
  },
  {
    id: "TRX-003",
    tanggal: "2026-05-05",
    customer: "-",
    produk: "Biaya Admin Platform",
    kategori: "Pengeluaran",
    metode: "Saldo",
    status: "Berhasil",
    jumlah: 25000,
  },
  {
    id: "TRX-004",
    tanggal: "2026-05-08",
    customer: "Budi Santoso",
    produk: "Celana Cargo",
    kategori: "Pemasukan",
    metode: "COD",
    status: "Pending",
    jumlah: 300000,
  },
]

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value)
}

function LaporanKeuanganPage() {
  const [search, setSearch] = useState("")
  const [kategori, setKategori] = useState("Semua Kategori")
  const [status, setStatus] = useState("Semua Status")

  const filteredTransaksi = useMemo(() => {
    return transaksi.filter((item) => {
      const matchSearch =
        item.id.toLowerCase().includes(search.toLowerCase()) ||
        item.customer.toLowerCase().includes(search.toLowerCase()) ||
        item.produk.toLowerCase().includes(search.toLowerCase())

      const matchKategori =
        kategori === "Semua Kategori" || item.kategori === kategori

      const matchStatus =
        status === "Semua Status" || item.status === status

      return matchSearch && matchKategori && matchStatus
    })
  }, [search, kategori, status])

  const totalPemasukan = filteredTransaksi
    .filter(
      (item) =>
        item.kategori === "Pemasukan" &&
        item.status === "Berhasil"
    )
    .reduce((total, item) => total + item.jumlah, 0)

  const totalPengeluaran = filteredTransaksi
    .filter(
      (item) =>
        item.kategori === "Pengeluaran" &&
        item.status === "Berhasil"
    )
    .reduce((total, item) => total + item.jumlah, 0)

  const saldoBersih = totalPemasukan - totalPengeluaran

  function exportCSV() {
    const headers = [
      "ID Transaksi",
      "Tanggal",
      "Customer",
      "Produk",
      "Kategori",
      "Metode Pembayaran",
      "Status",
      "Jumlah",
    ]

    const rows = filteredTransaksi.map((item) => [
      item.id,
      item.tanggal,
      item.customer,
      item.produk,
      item.kategori,
      item.metode,
      item.status,
      item.jumlah,
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
    link.download = "laporan-keuangan-seller.csv"
    link.click()

    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-start">

        <div>
          <h1 className="text-xl font-semibold">
            Laporan Keuangan
          </h1>

          <p className="text-sm text-muted-foreground">
            Pantau pemasukan, pengeluaran, dan saldo bersih toko Anda.
          </p>
        </div>

        <button
          onClick={exportCSV}
          className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm"
        >
          Export CSV
        </button>

      </div>

      {/* STATS */}
      <div className="grid md:grid-cols-4 gap-4">

        <div className="bg-white rounded-xl p-4 shadow-sm ring-1 ring-black/5">
          <p className="text-sm text-muted-foreground">
            Total Pemasukan
          </p>

          <p className="text-xl font-bold text-green-600">
            {formatRupiah(totalPemasukan)}
          </p>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm ring-1 ring-black/5">
          <p className="text-sm text-muted-foreground">
            Total Pengeluaran
          </p>

          <p className="text-xl font-bold text-red-600">
            {formatRupiah(totalPengeluaran)}
          </p>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm ring-1 ring-black/5">
          <p className="text-sm text-muted-foreground">
            Saldo Bersih
          </p>

          <p className="text-xl font-bold">
            {formatRupiah(saldoBersih)}
          </p>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm ring-1 ring-black/5">
          <p className="text-sm text-muted-foreground">
            Total Transaksi
          </p>

          <p className="text-xl font-bold">
            {filteredTransaksi.length}
          </p>
        </div>

      </div>

      {/* FILTER */}
      <div className="bg-white p-4 rounded-xl shadow-sm ring-1 ring-black/5 flex flex-col md:flex-row gap-3">

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari ID, customer, atau produk"
          className="flex-1 border rounded-lg px-4 py-2 text-sm"
        />

        <select
          value={kategori}
          onChange={(e) => setKategori(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm"
        >
          <option>Semua Kategori</option>
          <option>Pemasukan</option>
          <option>Pengeluaran</option>
        </select>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm"
        >
          <option>Semua Status</option>
          <option>Berhasil</option>
          <option>Pending</option>
          <option>Gagal</option>
        </select>

      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow-sm ring-1 ring-black/5 overflow-hidden">

        <table className="w-full text-sm">

          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="p-3">ID Transaksi</th>
              <th>Tanggal</th>
              <th>Customer</th>
              <th>Produk</th>
              <th>Kategori</th>
              <th>Metode</th>
              <th>Status</th>
              <th>Jumlah</th>
            </tr>
          </thead>

          <tbody>

            {filteredTransaksi.map((item) => (
              <tr key={item.id} className="border-t">

                <td className="p-3 font-medium">
                  {item.id}
                </td>

                <td>{item.tanggal}</td>

                <td>{item.customer}</td>

                <td>{item.produk}</td>

                <td>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      item.kategori === "Pemasukan"
                        ? "bg-green-100 text-green-600"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {item.kategori}
                  </span>
                </td>

                <td>{item.metode}</td>

                <td>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      item.status === "Berhasil"
                        ? "bg-green-100 text-green-600"
                        : item.status === "Pending"
                        ? "bg-yellow-100 text-yellow-600"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {item.status}
                  </span>
                </td>

                <td className="font-semibold">
                  {formatRupiah(item.jumlah)}
                </td>

              </tr>
            ))}

          </tbody>

        </table>

        {filteredTransaksi.length === 0 && (
          <div className="py-10 text-center text-sm text-gray-500">
            Tidak ada data transaksi.
          </div>
        )}

      </div>

      {/* PAGINATION */}
      <div className="flex justify-between items-center text-sm">

        <p className="text-muted-foreground">
          Showing 1–{filteredTransaksi.length} dari{" "}
          {filteredTransaksi.length} transaksi
        </p>

        <div className="flex gap-2">

          {[1, 2, 3].map((n) => (
            <button
              key={n}
              className={`w-8 h-8 rounded-full ${
                n === 1
                  ? "bg-green-600 text-white"
                  : "border"
              }`}
            >
              {n}
            </button>
          ))}

        </div>

      </div>

    </div>
  )
}