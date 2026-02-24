"use client"

import * as React from "react"
import { Link, useRouterState } from "@tanstack/react-router"
import {
  LayoutDashboard,
  Store,
  CheckCircle2,
  PackageSearch,
  Tags,
  Users,
  X,
} from "lucide-react"

type NavItem = {
  label: string
  to: string
  icon: React.ReactNode
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", to: "/admin/dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
  { label: "Approval Toko", to: "/admin/approval", icon: <CheckCircle2 className="h-4 w-4" /> },
  { label: "Toko", to: "/admin/toko", icon: <Store className="h-4 w-4" /> },
  { label: "Pesanan", to: "/admin/pesanan", icon: <PackageSearch className="h-4 w-4" /> },
  { label: "Kategori", to: "/admin/kategori", icon: <Tags className="h-4 w-4" /> },
  { label: "Customer", to: "/admin/customer", icon: <Users className="h-4 w-4" /> },
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
    <div className="relative h-full overflow-hidden">
      {/* BACKGROUND IMAGE */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          backgroundImage: "url('/Sidebar/bgsidebar.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          filter: "saturate(1.15) contrast(1.05)",
        }}
      />

      {/* OVERLAY GRADIENT */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-b from-[#f2f4ea]/35 via-[#f2f4ea]/20 to-[#f2f4ea]/10"
      />

      {/* TEXTURE DOT */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage: "radial-gradient(rgba(0,0,0,0.08) 1px, transparent 1px)",
          backgroundSize: "14px 14px",
        }}
      />

      {/* CONTENT LAYOUT */}
      <div className="relative flex h-full flex-col p-4">
        {/* BRAND (fixed top) */}
        <div className="flex items-center gap-3 rounded-2xl bg-white/70 p-3 ring-1 ring-black/5 backdrop-blur-sm">
          <img
            src="/Sidebar/logoGreenly.png"
            alt="Greenly Mart Logo"
            className="h-14 w-auto object-contain"
          />
          <div className="leading-tight">
            <div className="text-sm font-semibold">Greenly Mart</div>
            <div className="text-xs text-muted-foreground">Admin Panel</div>
          </div>
        </div>

        {/* MENU AREA (scroll only here) */}
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
                    "group flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition",
                    "hover:bg-white/70 hover:ring-1 hover:ring-black/5 backdrop-blur-sm",
                    active
                      ? "bg-white/80 font-semibold ring-1 ring-black/5"
                      : "text-foreground/80",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "grid h-9 w-9 place-items-center rounded-xl transition",
                      active
                        ? "bg-[#2f6b3b] text-white"
                        : "bg-white/60 text-foreground/80 group-hover:bg-white",
                    ].join(" ")}
                  >
                    {item.icon}
                  </span>

                  <span>{item.label}</span>

                  {active && <span className="ml-auto h-2 w-2 rounded-full bg-[#2f6b3b]" />}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* FOOTER (fixed bottom) */}
        <div className="mt-4 rounded-2xl bg-white/70 p-3 text-xs text-muted-foreground ring-1 ring-black/5 backdrop-blur-sm">
          <div className="font-medium text-foreground/80">INI ADMIN UTAMA</div>
          <div className="mt-1">v1.0 • Greenly Mart</div>
        </div>
      </div>
    </div>
  )
}

export default function Sidebar({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname }) ?? "/"

  // lock scroll saat drawer open
  React.useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  // close ESC
  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [onClose])

  return (
    <>
      {/* DESKTOP SIDEBAR: sticky */}
      <aside className="hidden w-[260px] shrink-0 border-r sm:block">
        <div className="sticky top-0 h-screen">
          <SidebarContent pathname={pathname} />
        </div>
      </aside>

      {/* MOBILE DRAWER */}
      <div
        className={[
          "fixed inset-0 z-50 sm:hidden",
          open ? "pointer-events-auto" : "pointer-events-none",
        ].join(" ")}
        aria-hidden={!open}
      >
        {/* overlay */}
        <div
          className={[
            "absolute inset-0 bg-black/30 transition-opacity",
            open ? "opacity-100" : "opacity-0",
          ].join(" ")}
          onClick={onClose}
        />

        {/* panel */}
        <div
          className={[
            "absolute left-0 top-0 h-full w-[85vw] max-w-[320px] border-r bg-white shadow-xl transition-transform",
            open ? "translate-x-0" : "-translate-x-full",
          ].join(" ")}
          role="dialog"
          aria-modal="true"
        >
          {/* header drawer */}
          <div className="flex items-center justify-between border-b bg-white/70 px-4 py-3 backdrop-blur">
            <div className="text-sm font-semibold">Menu</div>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white ring-1 ring-black/5"
              aria-label="Close sidebar"
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