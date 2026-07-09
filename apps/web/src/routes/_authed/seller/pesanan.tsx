import { OrderTable } from '#/components/seller/OrderTable'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authed/seller/pesanan')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Pesanan Toko</h1>
        <p className="text-sm text-muted-foreground">
          Kelola pesanan masuk dan update status pengiriman.
        </p>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm ring-1 ring-black/5">
        <OrderTable />
      </div>
    </div>
  )
}
