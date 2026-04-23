import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_authed/seller/produkdua")({
  component: RouteComponent,
})

function RouteComponent() {
  const data = [
    {
      name: "Bayam Organik Fresh",
      sku: "GM-001",
      price1: "Rp25.000",
      price2: "Rp45.000",
      stock: 125,
      sold: 210,
      status: "Aktif",
      image: "/produk1.png",
      variants: [
        { name: "250g Pack", sku: "GM-001-1", price: "Rp25.000", stock: 50, sold: 120 },
        { name: "500g Pack", sku: "GM-001-2", price: "Rp45.000", stock: 75, sold: 90 },
      ],
    },
    {
      name: "Wortel Berastagi Super",
      sku: "GM-005-A",
      price1: "Rp18.500",
      price2: null,
      stock: 340,
      sold: 1245,
      status: "Aktif",
      image: "/produk2.png",
      variants: [],
    },
  ]

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-semibold">Produk</h1>
        <p className="text-sm text-gray-500">
          Kelola produk toko Anda secara efisien.
        </p>
      </div>

      {/* TAB */}
      <div className="flex gap-6 border-b text-sm">
        {["Semua", "Habis", "Diblokir", "Diarsipkan"].map((tab, i) => (
          <button
            key={i}
            className={`pb-2 ${
              tab === "Semua"
                ? "text-green-600 border-b-2 border-green-600"
                : "text-gray-500"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* FILTER */}
      <div className="bg-white p-4 rounded-xl shadow-sm grid grid-cols-5 gap-4">

        <input
          placeholder="Cari nama produk..."
          className="border rounded-lg px-3 py-2 text-sm col-span-2"
        />

        <input
          placeholder="Stok Min"
          className="border rounded-lg px-3 py-2 text-sm"
        />
        <input
          placeholder="Stok Max"
          className="border rounded-lg px-3 py-2 text-sm"
        />

        <select className="border rounded-lg px-3 py-2 text-sm">
          <option>Semua Kategori</option>
          <option>Sayuran</option>
          <option>Buah</option>
          <option>Minuman</option>
        </select>

        <div className="col-span-5 flex justify-end gap-2 mt-2">
          <button className="text-sm text-gray-500">Atur Ulang</button>
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm">
            Cari
          </button>
        </div>

      </div>

      {/* ACTION BAR */}
      <div className="flex justify-between items-center">

        <p className="text-sm">
          <span className="font-semibold">168 Produk</span>{" "}
          <span className="text-gray-400">168 / 10.000</span>
        </p>

        <div className="flex gap-2">
          <button className="border px-3 py-2 rounded-lg text-sm">
            Edit Secara Massal
          </button>

          <button className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm">
            + Tambah Produk Baru
          </button>
        </div>

      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">

        {/* HEADER */}
        <div className="grid grid-cols-8 text-xs text-gray-500 p-4 bg-gray-50">
          <p>Nama Produk</p>
          <p>SKU</p>
          <p>Variasi</p>
          <p>Harga</p>
          <p>Stok</p>
          <p>Penjualan</p>
          <p>Status</p>
          <p>Aksi</p>
        </div>

        {/* BODY */}
        {data.map((item, i) => (
          <div key={i} className="border-t">

            {/* MAIN ROW */}
            <div className="grid grid-cols-8 items-center p-4">

              <div className="flex gap-3 items-center">
                <img
                  src={item.image}
                  className="h-12 w-12 rounded-lg object-cover"
                />
                <div>
                  <p className="text-sm font-medium">{item.name}</p>
                  <p className="text-xs text-gray-400">
                    SKU Induk: {item.sku}
                  </p>
                </div>
              </div>

              <p className="text-sm">-</p>

              <p className="text-sm">
                {item.variants.length > 0 ? "2 Variasi" : "None"}
              </p>

              <div className="text-sm">
                <p>{item.price1}</p>
                {item.price2 && <p>{item.price2}</p>}
              </div>

              <p className="text-sm">{item.stock}</p>
              <p className="text-sm">{item.sold}</p>

              <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full w-fit">
                {item.status}
              </span>

              <button className="text-green-600 text-sm">Ubah</button>

            </div>

            {/* VARIANTS */}
            {item.variants.map((v, idx) => (
              <div
                key={idx}
                className="grid grid-cols-8 items-center px-4 py-3 text-sm bg-gray-50"
              >
                <p className="pl-12 text-gray-600">• {v.name}</p>
                <p>{v.sku}</p>
                <p>-</p>
                <p>{v.price}</p>
                <p>{v.stock}</p>
                <p>{v.sold}</p>
                <p>-</p>
                <p className="text-gray-400">✏️</p>
              </div>
            ))}

          </div>
        ))}

        {/* FOOTER */}
        <div className="flex justify-between items-center p-4 text-sm text-gray-500">
          <p>Menampilkan 1-10 dari 168 produk</p>

          <div className="flex gap-2">
            <button className="px-2">‹</button>
            <button className="bg-green-600 text-white h-7 w-7 rounded">
              1
            </button>
            <button className="h-7 w-7 border rounded">2</button>
            <button className="h-7 w-7 border rounded">3</button>
            <button className="px-2">›</button>
          </div>
        </div>

      </div>

    </div>
  )
}