import { createFileRoute } from "@tanstack/react-router"
import { useState } from "react"

export const Route = createFileRoute("/_authed/admin/tokotoko")({
  component: RouteComponent,
})

function RouteComponent() {
  const initialData = [
    { id: "#SHP-00122", name: "FreshHarvest Organics", location: "Bandung", category: "Sayuran Organik", products: 142, active: true, image: "/toko1.png" },
    { id: "#SHP-00125", name: "Fruit Garden Express", location: "Jakarta Selatan", category: "Buah Segar", products: 86, active: true, image: "/toko2.png" },
    { id: "#SHP-00128", name: "Green Dairy Farm", location: "Malang", category: "Produk Susu", products: 45, active: false, image: "/toko3.png" },
    { id: "#SHP-00129", name: "Tani Makmur", location: "Bogor", category: "Alat Pertanian", products: 60, active: true, image: "/toko4.png" },
    { id: "#SHP-00130", name: "Agro Sejahtera", location: "Surabaya", category: "Minuman", products: 25, active: true, image: "/toko5.png" },
    { id: "#SHP-00131", name: "Panen Raya", location: "Semarang", category: "Sayuran Organik", products: 90, active: false, image: "/toko6.png" },
    { id: "#SHP-00132", name: "Fresh Market", location: "Yogyakarta", category: "Buah Segar", products: 110, active: true, image: "/toko7.png" },
    { id: "#SHP-00133", name: "Toko Organik", location: "Medan", category: "Produk Susu", products: 70, active: true, image: "/toko8.png" },
    { id: "#SHP-00134", name: "Petani Hebat", location: "Makassar", category: "Alat Pertanian", products: 40, active: false, image: "/toko9.png" },
    { id: "#SHP-00135", name: "Kebun Nusantara", location: "Bali", category: "Sayuran Organik", products: 150, active: true, image: "/toko10.png" },
  ]

  const [data, setData] = useState(initialData)

  const [categoryFilter, setCategoryFilter] = useState("Semua")
  const [statusFilter, setStatusFilter] = useState("Semua")
  const [sortAZ, setSortAZ] = useState(true)

  const [openCategory, setOpenCategory] = useState(false)
  const [openStatus, setOpenStatus] = useState(false)

  // 🔥 TOGGLE STATUS
  const toggleStatus = (index: number) => {
    const newData = [...data]
    newData[index].active = !newData[index].active
    setData(newData)
  }

  // 🔥 FILTER FIX (SEMUA PASTI MUNCUL)
  const filteredData = data
    .filter((item) => {
      // CATEGORY
      if (categoryFilter !== "Semua" && item.category !== categoryFilter) {
        return false
      }

      // STATUS
      if (statusFilter === "Aktif" && !item.active) return false
      if (statusFilter === "Non-aktif" && item.active) return false

      return true
    })
    .sort((a, b) =>
      sortAZ
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name)
    )
    .slice(0, 10)

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-semibold">
          Manajemen Daftar Toko
        </h1>
      </div>

      {/* FILTER */}
      <div className="bg-white p-4 rounded-xl shadow-sm ring-1 ring-black/5 flex justify-between">

        <div className="flex gap-3">

          {/* CATEGORY */}
          <div className="relative">
            <button
              onClick={() => setOpenCategory(!openCategory)}
              className="px-4 py-2 text-sm border rounded-full bg-gray-50"
            >
              {categoryFilter === "Semua"
                ? "Semua Kategori"
                : categoryFilter}
            </button>

            {openCategory && (
              <div className="absolute mt-2 w-48 bg-white border rounded-xl shadow-lg z-10">
                {[
                  "Semua",
                  "Sayuran Organik",
                  "Buah Segar",
                  "Produk Susu",
                  "Alat Pertanian",
                  "Minuman",
                ].map((item) => (
                  <div
                    key={item}
                    onClick={() => {
                      setCategoryFilter(item)
                      setOpenCategory(false)
                    }}
                    className="px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                  >
                    {item}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* STATUS */}
          <div className="relative">
            <button
              onClick={() => setOpenStatus(!openStatus)}
              className="px-4 py-2 text-sm border rounded-full bg-gray-50"
            >
              Status: {statusFilter}
            </button>

            {openStatus && (
              <div className="absolute mt-2 w-36 bg-white border rounded-xl shadow-lg z-10">
                {["Semua", "Aktif", "Non-aktif"].map((item) => (
                  <div
                    key={item}
                    onClick={() => {
                      setStatusFilter(item)
                      setOpenStatus(false)
                    }}
                    className="px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                  >
                    {item}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* SORT */}
        <button
          onClick={() => setSortAZ(!sortAZ)}
          className="px-4 py-2 text-sm border rounded-full bg-gray-50"
        >
          Urutkan: Nama Toko ({sortAZ ? "A-Z" : "Z-A"})
        </button>

      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow-sm ring-1 ring-black/5 overflow-hidden">

        <table className="w-full text-sm">

          <thead className="bg-gray-50 text-xs text-gray-500">
            <tr>
              <th className="p-3 text-left">SHOP ID</th>
              <th className="p-3 text-left">PHOTO</th>
              <th className="p-3 text-left">TOKO</th>
              <th className="p-3 text-left">KATEGORI</th>
              <th className="p-3 text-left">PRODUK</th>
              <th className="p-3 text-left">STATUS</th>
              <th className="p-3 text-left">AKSI</th>
            </tr>
          </thead>

          <tbody>
            {filteredData.map((item, i) => (
              <tr key={i} className="border-t">

                <td className="p-3 text-xs">{item.id}</td>

                <td className="p-3">
                  <img
                    src={item.image}
                    className="h-10 w-10 rounded-lg object-cover"
                  />
                </td>

                <td className="p-3">
                  <p className="font-medium">{item.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.location}
                  </p>
                </td>

                <td className="p-3">{item.category}</td>

                <td className="p-3">{item.products}</td>

                <td className="p-3">
                  <button
                    onClick={() => toggleStatus(i)}
                    className={`w-10 h-5 flex items-center rounded-full p-1 ${
                      item.active
                        ? "bg-green-500"
                        : "bg-gray-300"
                    }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow transform ${
                        item.active ? "translate-x-5" : ""
                      }`}
                    />
                  </button>
                </td>

                <td className="p-3 text-green-600 cursor-pointer">
                  Lihat Detail →
                </td>

              </tr>
            ))}
          </tbody>

        </table>

      </div>

    </div>
  )
}