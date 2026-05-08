import { CustomerTableDummy } from '#/components/admin/CistomerTable'
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_authed/admin/customer")({
  component: CustomerPage,
})

function CustomerPage() {
  return (
    <div>
      <CustomerTableDummy />
    </div>
  )
}
