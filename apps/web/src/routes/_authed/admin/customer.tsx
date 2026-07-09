import { CustomerTable } from '#/components/admin/CustomerTable'
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_authed/admin/customer")({
  component: CustomerPage,
})

function CustomerPage() {
  return (
    <div>
      <CustomerTable />
    </div>
  )
}
