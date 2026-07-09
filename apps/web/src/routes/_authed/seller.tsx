"use client"

import * as React from "react"
import { Outlet, createFileRoute, redirect } from "@tanstack/react-router"
import SidebarSeller from "../../components/SidebarSeller"
import { hasRole } from "#/lib/roles"

export const Route = createFileRoute("/_authed/seller")({
  beforeLoad: ({ context }) => {
    const user = (context as any).user
    const roles: unknown[] = user?.roles ?? []

    if (hasRole(roles, "ADMIN")) return

    if (hasRole(roles, "SUPER_ADMIN")) {
      throw redirect({ to: "/admin/dashboard" })
    }

    throw redirect({ to: "/auth/login" })
  },
  component: SellerLayout,
})

function SellerLayout() {
  const [sidebarOpen, setSidebarOpen] = React.useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-[#F3F4F6]">
      <SidebarSeller open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        <SellerTopBar onOpenSidebar={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

function SellerTopBar({ onOpenSidebar }: { onOpenSidebar: () => void }) {
  return (
    <header className="shrink-0 border-b bg-white px-4 py-3 sm:hidden">
      <button
        type="button"
        onClick={onOpenSidebar}
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border bg-gray-50"
        aria-label="Buka sidebar"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
    </header>
  )
}
