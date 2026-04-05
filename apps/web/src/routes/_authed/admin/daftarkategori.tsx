import { createFileRoute } from "@tanstack/react-router"
import {
  Leaf,
  Apple,
  Sprout,
  Package,
  Tractor,
  Pencil,
  Trash2,
} from "lucide-react"

export const Route = createFileRoute("/_authed/admin/daftarkategori")({
  component: RouteComponent,
})

function RouteComponent() {
  const data = [
    {
      name: "Sayuran",
      total: 120,
      new: true,
      active: true,
      icon: <Leaf />,
      bg: "bg-green-100 text-green-600",
    },
    {
      name: "Buah-buahan",
      total: 85,
      active: true,
      icon: <Apple />,
      bg: "bg-orange-100 text-orange-600",
    },
    {
      name: "Benih",
      total: 45,
      active: true,
      icon: <Sprout />,
      bg: "bg-yellow-100 text-yellow-600",
    },
    {
      name: "Pupuk",
      total: 30,
      active: true,
      icon: <Package />,
      bg: "bg-amber-100 text-amber-600",
    },
    {
      name: "Alat Tani",
      total: 15,
      active: false,
      icon: <Tractor />,
      bg: "bg-gray-200 text-gray-600",
    },
  ]

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">
            Manajemen Daftar Kategori
          </h1>
          <p className="text-sm text-muted-foreground">
            Atur dan pantau semua kategori produk pertanian
          </p>
        </div>

        <button className="bg-green-600 text-white px-4 py-2 rounded-full text-sm shadow-sm">
          + Tambah Kategori Baru
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow-sm ring-1 ring-black/5 overflow-hidden">

        <div className="overflow-x-auto">
          <table className="w-full text-sm">

            <thead className="bg-gray-50 text-xs text-gray-500">
              <tr>
                <th className="p-4 text-left">ICON</th>
                <th className="p-4 text-left">CATEGORY NAME</th>
                <th className="p-4 text-left">TOTAL PRODUCTS</th>
                <th className="p-4 text-left">STATUS</th>
                <th className="p-4 text-left">ACTION</th>
              </tr>
            </thead>

            <tbody>
              {data.map((item, i) => (
                <tr key={i} className="border-t">

                  {/* ICON */}
                  <td className="p-4">
                    <div
                      className={`h-12 w-12 rounded-xl flex items-center justify-center ${item.bg}`}
                    >
                      {item.icon}
                    </div>
                  </td>

                  {/* NAME */}
                  <td className="p-4 font-medium">
                    {item.name}
                  </td>

                  {/* TOTAL */}
                  <td className="p-4 text-sm">
                    {item.total} Item{" "}
                    {item.new && (
                      <span className="ml-2 text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded">
                        +12 baru
                      </span>
                    )}
                  </td>

                  {/* TOGGLE */}
                  <td className="p-4">
                    <div
                      className={`w-10 h-5 flex items-center rounded-full p-1 transition ${
                        item.active
                          ? "bg-green-500"
                          : "bg-gray-300"
                      }`}
                    >
                      <div
                        className={`bg-white w-4 h-4 rounded-full shadow transform transition ${
                          item.active ? "translate-x-5" : ""
                        }`}
                      />
                    </div>
                  </td>

                  {/* ACTION */}
                  <td className="p-4 flex gap-3">
                    <button className="text-blue-600 hover:scale-110 transition">
                      <Pencil size={16} />
                    </button>
                    <button className="text-red-500 hover:scale-110 transition">
                      <Trash2 size={16} />
                    </button>
                  </td>

                </tr>
              ))}
            </tbody>

          </table>
        </div>

        {/* FOOTER */}
        <div className="flex justify-between items-center p-4 text-xs text-muted-foreground border-t">
          <p>Menampilkan 1 sampai 5 dari 12 kategori</p>

          <div className="flex gap-2 items-center">
            <button className="px-3 py-1 border rounded-lg">
              Sebelumnya
            </button>
            <button className="bg-green-600 text-white h-7 w-7 rounded-full">
              1
            </button>
            <button className="h-7 w-7 border rounded-full">2</button>
            <button className="px-3 py-1 border rounded-lg">
              Berikutnya
            </button>
          </div>
        </div>

      </div>

    </div>
  )
}