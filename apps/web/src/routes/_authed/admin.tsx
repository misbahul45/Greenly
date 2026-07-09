"use client"

import * as React from "react"
import { Outlet, createFileRoute, redirect } from "@tanstack/react-router"
import Header from "#/components/Header"
import SidebarAdmin from "#/components/SidebarAdmin"
import { hasRole } from "#/lib/roles"

export const Route = createFileRoute("/_authed/admin")({
  beforeLoad: ({ context }) => {
    const user = (context as any).user
    const roles: unknown[] = user?.roles ?? []

    if (hasRole(roles, "ADMIN", "SUPER_ADMIN")) return

    if (hasRole(roles, "SELLER")) {
      throw redirect({ to: "/seller/dashboard" })
    }

    throw redirect({ to: "/auth/login" })
  },
  component: AdminLayout,
})

function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = React.useState(false)

  return (
    <div className="flex min-h-screen bg-background">
      <SidebarAdmin open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex min-h-screen flex-1 flex-col">
        <Header onOpenSidebar={() => setSidebarOpen(true)} />

        <main className="flex-1 px-4 pb-6 pt-4 sm:px-6 sm:pt-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
