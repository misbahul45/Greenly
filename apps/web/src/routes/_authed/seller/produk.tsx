import { ProductTableFull } from '#/components/seller/ProductTable'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authed/seller/produk')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Produk Toko</h1>
        <p className="text-sm text-muted-foreground">
          Kelola katalog produk, stok, dan harga barang Anda.
        </p>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm ring-1 ring-black/5">
        <ProductTableFull />
      </div>
    </div>
  )
}
