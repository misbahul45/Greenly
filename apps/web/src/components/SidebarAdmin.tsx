"use client"

import * as React from "react"
import { Link, useRouterState } from "@tanstack/react-router"
import {
  LayoutDashboard,
  Store,
  Building2,
  ShoppingCart,
  Shapes,
  Users,
  X,
} from "lucide-react"

type NavItem = {
  label: string
  to: string
  icon: React.ReactNode
}

const NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    to: "/admin/dashboard",
    icon: <LayoutDashboard className="h-4 w-4" />,
  },
  {
    label: "Approval Toko",
    to: "/admin/approval",
    icon: <Store className="h-4 w-4" />,
  },
  {
    label: "Daftar Toko",
    to: "/admin/toko",
    icon: <Building2 className="h-4 w-4" />,
  },
  {
    label: "Daftar Pesanan",
    to: "/admin/pesanan",
    icon: <ShoppingCart className="h-4 w-4" />,
  },
  {
    label: "Daftar Kategori",
    to: "/admin/kategori",
    icon: <Shapes className="h-4 w-4" />,
  },
  {
    label: "Daftar Customer",
    to: "/admin/customer",
    icon: <Users className="h-4 w-4" />,
  },
]

function isActivePath(currentPath: string, target: string) {
  if (target === "/") return currentPath === "/"
  return currentPath === target || currentPath.startsWith(target + "/")
}

function SidebarContent({
  pathname,
  onNavigate,
}: {
  pathname: string
  onNavigate?: () => void
}) {
  return (
    <div className="relative h-full overflow-hidden bg-gradient-to-b from-[#1B5E20] to-[#4CAF50] text-white">
      
      {/* TEXTURE */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.2) 1px, transparent 1px)",
          backgroundSize: "14px 14px",
        }}
      />

      <div className="relative flex h-full flex-col p-4">
        
        {/* BRAND */}
        <div className="flex items-center gap-3 rounded-2xl bg-white/20 backdrop-blur-md p-3">
          <img
            src="/Sidebar/LogoGreenly.png"
            alt="Greenly Mart Logo"
            className="h-12 w-auto object-contain"
          />
          <div className="leading-tight">
            <div className="text-sm font-semibold">Greenly Mart</div>
            <div className="text-xs text-white/80">Admin Penjual</div>
          </div>
        </div>

        {/* MENU */}
        <div className="mt-5 flex-1 overflow-y-auto pr-1 [scrollbar-width:thin]">
          <nav className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => {
              const active = isActivePath(pathname, item.to)

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={onNavigate}
                  className={[
                    "group flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-all duration-200",
                    active
                      ? "bg-white/20 text-white font-semibold backdrop-blur-sm"
                      : "text-white/80 hover:bg-white/10",
                  ].join(" ")}
                >
                  {/* ICON */}
                  <span
                    className={[
                      "grid h-9 w-9 place-items-center rounded-xl transition-all",
                      active
                        ? "bg-white text-[#1B5E20]"
                        : "bg-white/10 text-white group-hover:bg-white/20",
                    ].join(" ")}
                  >
                    {item.icon}
                  </span>

                  {/* LABEL */}
                  <span>{item.label}</span>

                  {/* ACTIVE DOT */}
                  {active && (
                    <span className="ml-auto h-2 w-2 rounded-full bg-white" />
                  )}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* FOOTER */}
        <div className="mt-4 rounded-2xl bg-white/20 backdrop-blur-md p-3 text-xs">
          <div className="font-medium">INI ADMIN UTAMA</div>
          <div className="mt-1 text-white/80">v1.0 • Greenly Mart</div>
        </div>
      </div>
    </div>
  )
}

export default function SidebarAdmin({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const pathname =
    useRouterState({ select: (s) => s.location.pathname }) ?? "/"

  React.useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [onClose])

  return (
    <>
      {/* DESKTOP */}
      <aside className="hidden w-[260px] shrink-0 sm:block">
        <div className="sticky top-0 h-screen">
          <SidebarContent pathname={pathname} />
        </div>
      </aside>

      {/* MOBILE */}
      <div
        className={[
          "fixed inset-0 z-50 sm:hidden",
          open ? "pointer-events-auto" : "pointer-events-none",
        ].join(" ")}
      >
        {/* OVERLAY */}
        <div
          className={[
            "absolute inset-0 bg-black/30 transition-opacity",
            open ? "opacity-100" : "opacity-0",
          ].join(" ")}
          onClick={onClose}
        />

        {/* DRAWER */}
        <div
          className={[
            "absolute left-0 top-0 h-full w-[85vw] max-w-[320px] shadow-xl transition-transform",
            open ? "translate-x-0" : "-translate-x-full",
          ].join(" ")}
        >
          {/* HEADER */}
          <div className="flex items-center justify-between px-4 py-3 text-white bg-gradient-to-b from-[#1B5E20] to-[#4CAF50]">
            <div className="text-sm font-semibold">Menu</div>
            <button
              onClick={onClose}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <SidebarContent pathname={pathname} onNavigate={onClose} />
        </div>
      </div>
    </>
  )
}