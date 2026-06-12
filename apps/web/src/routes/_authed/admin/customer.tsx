import { CustomerTable } from '#/components/admin/CustomerTable'
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_authed/admin/customer")({
  component: CustomerPage,
})

function CustomerPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Customer</h1>
        <p className="text-sm text-muted-foreground">
          Kelola data pelanggan untuk memantau aktivitas dan status akun mereka.
        </p>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm ring-1 ring-black/5">
        <CustomerTable />
      </div>
    </div>
  )
}
