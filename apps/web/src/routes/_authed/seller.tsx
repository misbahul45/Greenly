"use client"

import * as React from "react"
import { Outlet, createFileRoute, redirect } from "@tanstack/react-router"
import SidebarSeller from "../../components/SidebarSeller"
import Header from "../../components/Header"

const SELLER_ROLES = ["SELLER"]
const ADMIN_ROLES = ["ADMIN", "SUPER_ADMIN"]

export const Route = createFileRoute("/_authed/seller")({
  beforeLoad: ({ context }) => {
    const user = (context as any).user
    const roles: string[] = (user?.roles ?? []).map((r: string) =>
      r.trim().toUpperCase()
    )
    const isSeller = roles.some((r) => SELLER_ROLES.includes(r))
    const isAdmin = roles.some((r) => ADMIN_ROLES.includes(r))
    if (!isSeller && !isAdmin) {
      throw redirect({ to: "/auth/login" })
    }
  },
  component: SellerLayout,
})

function SellerLayout() {
  const [sidebarOpen, setSidebarOpen] = React.useState(false)

  return (
    <div className="flex min-h-screen bg-background">
      <SidebarSeller open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex min-h-screen flex-1 flex-col">
        <Header onOpenSidebar={() => setSidebarOpen(true)} />

        <main className="flex-1 px-4 pb-6 pt-4 sm:px-6 sm:pt-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
