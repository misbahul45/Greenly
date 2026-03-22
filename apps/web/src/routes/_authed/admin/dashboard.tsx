import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_authed/admin/dashboard")({
  component: AdminDashboard,
})

function AdminDashboard() {
  return (
    <div className="space-y-6">

      {/* ===== STATS ===== */}
      <div className="grid md:grid-cols-4 gap-4">

        <Card title="Total Penjualan" value="Rp 128.5M" growth="+12.5%" />
        <Card title="Toko Aktif" value="1,240" growth="+3.2%" />
        <Card title="Total Customer" value="8,542" growth="+5.7%" />
        <Card title="Menunggu Approval" value="42" growth="Segera proses" danger />

      </div>

      {/* ===== GRAPH + SIDE ===== */}
      <div className="grid md:grid-cols-3 gap-6">

        {/* GRAPH */}
        <div className="md:col-span-2 bg-white p-6 rounded-xl shadow-sm ring-1 ring-black/5">

          <div className="flex justify-between mb-4">
            <div>
              <h3 className="font-semibold">Sales Growth</h3>
              <p className="text-sm text-muted-foreground">
                Pertumbuhan penjualan 7 bulan terakhir
              </p>
            </div>
            <span className="text-sm bg-gray-100 px-3 py-1 rounded-lg">
              Tahun 2024
            </span>
          </div>

          {/* CHART FAKE */}
          <div className="flex items-end gap-3 h-40">
            {[40,60,30,80,60,90,110].map((h,i)=>(
              <div
                key={i}
                style={{height:`${h}%`}}
                className="flex-1 bg-green-400 rounded-t"
              />
            ))}
          </div>

        </div>

        {/* TOKO BARU */}
        <div className="bg-white p-6 rounded-xl shadow-sm ring-1 ring-black/5">

          <div className="flex justify-between mb-4">
            <h3 className="font-semibold">Pendaftaran Toko Baru</h3>
            <button className="text-green-600 text-sm">Lihat Semua</button>
          </div>

          <div className="space-y-4">

            {["Tani Jaya Store","Berkah Tani","Sawah Makmur","Agro Mandiri"].map((t,i)=>(
              <div key={i} className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium">{t}</p>
                  <p className="text-xs text-muted-foreground">2 jam lalu</p>
                </div>
                <button className="bg-green-600 text-white px-3 py-1 rounded-lg text-xs">
                  Cek
                </button>
              </div>
            ))}

          </div>

        </div>

      </div>

      {/* ===== TABLE ===== */}
      <div className="bg-white p-6 rounded-xl shadow-sm ring-1 ring-black/5">

        <div className="flex justify-between mb-4">
          <h3 className="font-semibold">Latest Orders</h3>
          <div className="flex gap-2">
            <button className="border px-3 py-1 rounded-lg text-sm">Export CSV</button>
            <button className="bg-green-600 text-white px-3 py-1 rounded-lg text-sm">
              View All
            </button>
          </div>
        </div>

        <table className="w-full text-sm">
          <thead className="text-left text-muted-foreground">
            <tr>
              <th>ID Pesanan</th>
              <th>Pelanggan</th>
              <th>Toko</th>
              <th>Nominal</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>

          <tbody className="divide-y">

            {orders.map((o,i)=>(
              <tr key={i}>
                <td className="py-3">{o.id}</td>
                <td>{o.customer}</td>
                <td>{o.store}</td>
                <td>{o.price}</td>
                <td>
                  <span className={`px-2 py-1 rounded text-xs ${o.color}`}>
                    {o.status}
                  </span>
                </td>
                <td>👁️</td>
              </tr>
            ))}

          </tbody>

        </table>

      </div>

    </div>
  )
}

function Card({title,value,growth,danger=false}:any){
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm ring-1 ring-black/5">
      <p className="text-sm text-muted-foreground">{title}</p>
      <p className="text-xl font-bold mt-1">{value}</p>
      <p className={`text-xs mt-1 ${danger ? "text-red-500" : "text-green-600"}`}>
        {growth}
      </p>
    </div>
  )
}

const orders = [
  {
    id:"#ORD-90231",
    customer:"Budi Santoso",
    store:"Tani Jaya Store",
    price:"Rp 1.450.000",
    status:"SELESAI",
    color:"bg-green-100 text-green-700"
  },
  {
    id:"#ORD-90232",
    customer:"Ani Wijaya",
    store:"Berkah Tani",
    price:"Rp 2.890.000",
    status:"DIPROSES",
    color:"bg-yellow-100 text-yellow-700"
  },
  {
    id:"#ORD-90233",
    customer:"Siti Aminah",
    store:"Agro Mandiri",
    price:"Rp 850.000",
    status:"DIKIRIM",
    color:"bg-blue-100 text-blue-700"
  },
  {
    id:"#ORD-90234",
    customer:"Rudi Hartono",
    store:"Tani Jaya Store",
    price:"Rp 3.120.000",
    status:"SELESAI",
    color:"bg-green-100 text-green-700"
  }
]