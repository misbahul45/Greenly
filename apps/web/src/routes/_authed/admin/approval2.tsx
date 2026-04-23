import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_authed/admin/approval2")({
  component: RouteComponent,
})

function RouteComponent() {
  const data = [
    {
      id: "#TR-2024-001",
      name: "Fresh Farm",
      owner: "Andi Wijaya",
      date: "20 Oct 2023",
      status: "Pending Review",
      initials: "FF",
    },
    {
      id: "#TR-2024-002",
      name: "Organic Life",
      owner: "Siti Aminah",
      date: "20 Oct 2023",
      status: "Waiting for Document",
      initials: "OL",
    },
    {
      id: "#TR-2024-003",
      name: "Green Garden",
      owner: "Budi Santoso",
      date: "19 Oct 2023",
      status: "Pending Review",
      initials: "GG",
    },
    {
      id: "#TR-2024-004",
      name: "Eco Store",
      owner: "Dewi Lestari",
      date: "19 Oct 2023",
      status: "Pending Review",
      initials: "ES",
    },
  ]

  const getStatusStyle = (status: string) => {
    if (status === "Pending Review")
      return "bg-yellow-100 text-yellow-700"
    if (status === "Waiting for Document")
      return "bg-blue-100 text-blue-700"
    return ""
  }

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-semibold">Approval Toko</h1>
        <p className="text-sm text-muted-foreground">
          Kelola Toko yang ingin mendaftar di Greenly Mart
        </p>
      </div>

      {/* STATS */}
      <div className="grid md:grid-cols-3 gap-4">

        <div className="bg-white p-5 rounded-xl shadow-sm ring-1 ring-black/5">
          <p className="text-sm text-muted-foreground">Total Pending</p>
          <p className="text-2xl font-bold mt-2">24</p>
          <p className="text-xs text-green-600 mt-1">+5% from last week</p>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm ring-1 ring-black/5">
          <p className="text-sm text-muted-foreground">Approved Today</p>
          <p className="text-2xl font-bold mt-2">12</p>
          <p className="text-xs text-green-600 mt-1">+2% from yesterday</p>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm ring-1 ring-black/5">
          <p className="text-sm text-muted-foreground">Rejected Today</p>
          <p className="text-2xl font-bold mt-2">03</p>
          <p className="text-xs text-red-500 mt-1">-1% from yesterday</p>
        </div>

      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow-sm ring-1 ring-black/5 overflow-hidden">

        {/* HEADER TABLE */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="font-semibold">Shop Registration Requests</h2>

          <div className="flex gap-2">
            <button className="px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-50">
              Filter
            </button>
            <button className="px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-50">
              Export
            </button>
          </div>
        </div>

        {/* TABLE CONTENT */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs">
              <tr>
                <th className="text-left p-3">ID</th>
                <th className="text-left p-3">Shop Name</th>
                <th className="text-left p-3">Owner Name</th>
                <th className="text-left p-3">Date</th>
                <th className="text-left p-3">Status</th>
                <th className="text-left p-3">Documents</th>
                <th className="text-left p-3">Action</th>
              </tr>
            </thead>

            <tbody>
              {data.map((item, i) => (
                <tr key={i} className="border-t">

                  <td className="p-3">{item.id}</td>

                  {/* SHOP */}
                  <td className="p-3 flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold">
                      {item.initials}
                    </div>
                    {item.name}
                  </td>

                  <td className="p-3">{item.owner}</td>
                  <td className="p-3">{item.date}</td>

                  {/* STATUS */}
                  <td className="p-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs ${getStatusStyle(
                        item.status
                      )}`}
                    >
                      {item.status}
                    </span>
                  </td>

                  {/* DOC */}
                  <td className="p-3">
                    <button className="text-green-600 text-sm">
                      View Doc
                    </button>
                  </td>

                  {/* ACTION */}
                  <td className="p-3 flex gap-2">
                    <button className="bg-green-600 text-white px-3 py-1 rounded-full text-xs">
                      Approve
                    </button>
                    <button className="border border-red-500 text-red-500 px-3 py-1 rounded-full text-xs">
                      Reject
                    </button>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* FOOTER */}
        <div className="flex justify-between items-center p-4 text-xs text-muted-foreground border-t">
          <p>Showing 1 to 4 of 24 entries</p>

          <div className="flex gap-2 items-center">
            <button className="px-2">‹</button>
            <button className="bg-green-600 text-white h-6 w-6 rounded-full">
              1
            </button>
            <button className="h-6 w-6 rounded-full border">2</button>
            <button className="h-6 w-6 rounded-full border">3</button>
            <button className="px-2">›</button>
          </div>
        </div>

      </div>

    </div>
  )
}