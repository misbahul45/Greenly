import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/seller/dashboard")({
  component: SellerDashboard,
})

function SellerDashboard() {
  return (
    <div className="rounded-2xl bg-white p-6 ring-1 ring-black/5">
      <h1 className="text-xl font-semibold">Seller Dashboard</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Ini halaman dashboard penjual.
      </p>
    </div>
  )
}