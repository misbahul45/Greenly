import { ShopTable } from '#/components/admin/TokoTable'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authed/admin/toko')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Toko</h1>
        <p className="text-sm text-muted-foreground">
          Daftar seluruh toko yang terdaftar di platform Greenly.
        </p>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm ring-1 ring-black/5">
        <ShopTable />
      </div>
    </div>
  )
}
