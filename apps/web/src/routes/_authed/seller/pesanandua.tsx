import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_authed/seller/pesanandua")({
  component: RouteComponent,
})

function RouteComponent() {
  const data = [
    {
      user: "AndiWijaya99",
      product: "Bayam Organik",
      price: "Rp 12.500",
      payment: "GoPay",
      qty: "x1",
      courier: "J&T Express",
      image: "/produk1.png",
      date: "22 Mei 2024",
    },
    {
      user: "Siska_Mawar",
      product: "Tomat Merah",
      price: "Rp 25.000",
      payment: "BCA VA",
      qty: "x2",
      courier: "SiCepat",
      image: "/produk2.png",
      date: "23 Mei 2024",
    },
    {
      user: "Budi_Santoso",
      product: "Bawang Putih",
      price: "Rp 48.200",
      payment: "ShopeePay",
      qty: "x1",
      courier: "GrabExpress",
      image: "/produk3.png",
      date: "23 Mei 2024",
    },
    {
      user: "Fahmi_Gamer",
      product: "Wortel Segar",
      price: "Rp 18.000",
      payment: "OVO",
      qty: "x3",
      courier: "Anter Aja",
      image: "/produk4.png",
      date: "24 Mei 2024",
    },
    {
      user: "Mega_Wulandari",
      product: "Jahe Merah",
      price: "Rp 32.000",
      payment: "Dana",
      qty: "x1",
      courier: "JNE Reguler",
      image: "/produk5.png",
      date: "24 Mei 2024",
    },
  ]

  return (
    <div className=" space-y-3">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-semibold">Pesanan Masuk</h1>
        <p className="text-sm text-gray-500">
          Kelola pesanan toko Anda secara efisien dan cepat.
        </p>
      </div>

      {/* TABS */}
      <div className="flex gap-6 border-b text-sm">
        {[
          "Semua",
          "Belum Bayar",
          "Perlu Dikirim",
          "Dikirim",
          "Selesai",
          "Pembatalan",
          "Pengembalian",
        ].map((tab, i) => (
          <button
            key={i}
            className={`pb-2 ${
              tab === "Perlu Dikirim"
                ? "text-green-600 border-b-2 border-green-600"
                : "text-gray-500"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* FILTER */}
      <div className="bg-white p-4 rounded-xl shadow-sm flex justify-between items-center">

        <input
          placeholder="Cari Pesanan (No, Nama Produk, Username)"
          className="border rounded-lg px-3 py-2 text-sm w-[320px]"
        />

        <div className="flex gap-2">
          <button className="border px-3 py-2 rounded-lg text-sm">
            Waktu Pesanan Dibuat
          </button>
          <button className="border px-3 py-2 rounded-lg text-sm">
            Urutkan
          </button>
          <button className="border px-3 py-2 rounded-lg text-sm">
            Export
          </button>
        </div>

      </div>

      {/* TABLE HEADER */}
      <div className="grid grid-cols-6 text-xs text-gray-500 px-4">
        <p>PRODUK</p>
        <p>JUMLAH HARUS DIBAYAR</p>
        <p>STATUS</p>
        <p>HITUNGAN MUNDUR</p>
        <p>JASA KIRIM</p>
        <p>AKSI</p>
      </div>

      {/* LIST */}
      <div className="space-y-4">

        {data.map((item, i) => (
          <div
            key={i}
            className="bg-white rounded-xl p-4 shadow-sm"
          >

            {/* USER */}
            <div className="flex justify-between mb-3">
              <p className="font-medium text-sm">{item.user}</p>
              <p className="text-xs text-gray-400">
                No. Pesanan: ORD-24059128{i}
              </p>
            </div>

            <div className="grid grid-cols-6 items-center gap-4">

              {/* PRODUK */}
              <div className="flex gap-3 items-center">
                <img
                  src={item.image}
                  className="h-14 w-14 rounded-lg object-cover"
                />
                <div>
                  <p className="text-sm font-medium">
                    {item.product}
                  </p>
                  <p className="text-xs text-gray-500">
                    Variasi: -
                  </p>
                  <p className="text-xs">{item.qty}</p>
                </div>
              </div>

              {/* HARGA */}
              <div>
                <p className="text-xs text-gray-500">
                  TOTAL BAYAR
                </p>
                <p className="text-green-600 font-medium text-sm">
                  {item.price}
                </p>
                <p className="text-xs text-gray-400">
                  {item.payment}
                </p>
              </div>

              {/* STATUS */}
              <div>
                <span className="text-xs bg-orange-100 text-orange-600 px-3 py-1 rounded-full">
                  PERLU DIKIRIM
                </span>
              </div>

              {/* COUNTDOWN */}
              <div className="text-xs text-gray-500">
                Mohon kirim sebelum <br />
                <span className="font-medium text-gray-700">
                  {item.date}
                </span>
              </div>

              {/* KURIR */}
              <div>
                <p className="text-xs text-gray-500">KURIR</p>
                <p className="text-sm font-medium">
                  {item.courier}
                </p>
              </div>

              {/* AKSI */}
              <div>
                <button className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm">
                  Atur Pengiriman
                </button>
              </div>

            </div>

          </div>
        ))}

      </div>

      {/* PAGINATION */}
      <div className="flex justify-between items-center text-sm text-gray-500">
        <p>Menampilkan 5 dari 24 pesanan</p>

        <div className="flex gap-2 items-center">
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
  )
}