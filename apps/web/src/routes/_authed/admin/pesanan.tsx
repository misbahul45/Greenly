import { OrderTable } from '#/components/admin/PesananTable'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authed/admin/pesanan')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Seluruh Pesanan</h1>
        <p className="text-sm text-muted-foreground">
          Pantau seluruh aktivitas transaksi di platform Greenly.
        </p>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm ring-1 ring-black/5">
        <OrderTable />
      </div>
    </div>
  )
}
