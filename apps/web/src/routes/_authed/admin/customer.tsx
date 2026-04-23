import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_authed/admin/customer")({
  component: CustomerPage,
})

function CustomerPage() {
  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold">
          Manajemen Daftar Customer
        </h1>
        <p className="text-sm text-green-600">
          Kelola dan pantau data seluruh customer Greenly Mart secara real-time.
        </p>
      </div>

      {/* STATS */}
      <div className="grid md:grid-cols-3 gap-4">

        <StatCard title="Total Customer" value="8,542" growth="+5.2%" />
        <StatCard title="Customer Baru Bulan Ini" value="450" growth="+12.5%" />
        <StatCard title="Customer Aktif" value="7,200" growth="+2.1%" />

      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow-sm ring-1 ring-black/5 overflow-hidden">

        {/* HEADER TABLE */}
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="font-semibold">List Data Customer</h3>

          <div className="flex gap-2">
            <button className="border px-3 py-1 rounded-lg text-sm">
              Filter
            </button>
            <button className="border px-3 py-1 rounded-lg text-sm">
              Export
            </button>
          </div>
        </div>

        {/* TABLE */}
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-muted-foreground">
            <tr>
              <th className="p-3">Customer ID</th>
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Joined Date</th>
              <th className="p-3">Total Orders</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y">

            {customers.map((c, i) => (
              <tr key={i} className="hover:bg-gray-50">

                <td className="p-3 text-green-600 font-medium">
                  {c.id}
                </td>

                <td className="p-3 flex items-center gap-3">
                  <img
                    src={c.avatar}
                    className="w-8 h-8 rounded-full"
                  />
                  {c.name}
                </td>

                <td className="p-3 text-muted-foreground">
                  {c.email}
                </td>

                <td className="p-3 text-muted-foreground">
                  {c.joined}
                </td>

                <td className="p-3 font-medium">
                  {c.orders} Orders
                </td>

                <td className="p-3">
                  <button className="text-green-600 text-sm">
                    View Detail
                  </button>
                </td>

              </tr>
            ))}

          </tbody>

        </table>

        {/* FOOTER */}
        <div className="flex justify-between items-center p-4 text-sm text-muted-foreground">

          <p>Showing 1 to 5 of 8,542 results</p>

          <div className="flex gap-2">

            <button className="px-3 py-1 border rounded">‹</button>
            <button className="px-3 py-1 bg-green-600 text-white rounded">1</button>
            <button className="px-3 py-1 border rounded">2</button>
            <button className="px-3 py-1 border rounded">3</button>
            <button className="px-3 py-1 border rounded">›</button>

          </div>

        </div>

      </div>

    </div>
  )
}

/* COMPONENT STAT */
function StatCard({ title, value, growth }: any) {
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm ring-1 ring-black/5">
      <p className="text-sm text-muted-foreground">{title}</p>
      <p className="text-2xl font-bold mt-2">{value}</p>
      <p className="text-green-600 text-sm mt-1">{growth}</p>
    </div>
  )
}

/* DATA */
const customers = [
  {
    id: "CUST-001",
    name: "Andi Wijaya",
    email: "andi@email.com",
    joined: "12 Oct 2023",
    orders: 45,
    avatar: "https://i.pravatar.cc/40?img=1",
  },
  {
    id: "CUST-002",
    name: "Siti Aminah",
    email: "siti@email.com",
    joined: "15 Oct 2023",
    orders: 12,
    avatar: "https://i.pravatar.cc/40?img=2",
  },
  {
    id: "CUST-003",
    name: "Budi Santoso",
    email: "budi@email.com",
    joined: "20 Oct 2023",
    orders: 8,
    avatar: "https://i.pravatar.cc/40?img=3",
  },
  {
    id: "CUST-004",
    name: "Rina Putri",
    email: "rina@email.com",
    joined: "22 Oct 2023",
    orders: 23,
    avatar: "https://i.pravatar.cc/40?img=4",
  },
  {
    id: "CUST-005",
    name: "Dewi Lestari",
    email: "dewi@email.com",
    joined: "25 Oct 2023",
    orders: 5,
    avatar: "https://i.pravatar.cc/40?img=5",
  },
]