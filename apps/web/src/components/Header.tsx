"use client"

import * as React from "react"
import { Menu, Search, Bell, ChevronDown, User, LogOut } from "lucide-react"

type HeaderProps = {
  title?: string
  userName?: string
  onOpenSidebar?: () => void
  onSearchClick?: () => void
  onNotificationsClick?: () => void
  onAccountClick?: () => void
  onLogoutClick?: () => void
  avatarUrl?: string
}

export default function Header({
  title = "Dashboard",
  userName = "Admin",
  onOpenSidebar,
  onSearchClick,
  onNotificationsClick,
  onAccountClick,
  onLogoutClick,
  avatarUrl,
}: HeaderProps) {
  const [open, setOpen] = React.useState(false)
  const menuRef = React.useRef<HTMLDivElement | null>(null)

  React.useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!menuRef.current) return
      if (!menuRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", onDocClick)
    return () => document.removeEventListener("mousedown", onDocClick)
  }, [])

  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  return (
    <header className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur">
      <div className="px-3 py-2 sm:px-6 sm:py-3">
        <div className="flex items-center justify-between gap-2">
          {/* LEFT */}
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            {onOpenSidebar && (
              <button
                type="button"
                onClick={onOpenSidebar}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white ring-1 ring-black/5 sm:hidden"
                aria-label="Open sidebar"
              >
                <Menu className="h-5 w-5" />
              </button>
            )}

            <div className="min-w-0">
              <div className="truncate text-base font-semibold sm:text-lg">
                {title}
              </div>

              {/* Hello: tampil kecil di mobile, normal di desktop */}
              <div className="truncate text-xs text-muted-foreground sm:text-sm">
                Hello, {userName}
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search */}
            <button
              type="button"
              onClick={onSearchClick}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/70 ring-1 ring-black/5 transition hover:bg-white sm:h-10 sm:w-10"
              aria-label="Search"
            >
              <Search className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>

            {/* Notifications */}
            <button
              type="button"
              onClick={onNotificationsClick}
              className="relative inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/70 ring-1 ring-black/5 transition hover:bg-white sm:h-10 sm:w-10"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="absolute right-2 top-2 inline-block h-2 w-2 rounded-full bg-[#2f6b3b]" />
            </button>

            {/* Avatar + Dropdown */}
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="inline-flex items-center gap-2 rounded-xl bg-white/70 p-1 ring-1 ring-black/5 transition hover:bg-white"
                aria-haspopup="menu"
                aria-expanded={open}
              >
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="User avatar"
                    className="h-9 w-9 rounded-full object-cover sm:h-10 sm:w-10"
                  />
                ) : (
                  <div className="grid h-9 w-9 place-items-center rounded-full bg-[#2f6b3b] text-sm font-semibold text-white sm:h-10 sm:w-10">
                    {userName?.slice(0, 1)?.toUpperCase() ?? "A"}
                  </div>
                )}

                {/* panah dropdown disembunyiin di mobile biar ga sempit */}
                <ChevronDown className="hidden h-4 w-4 text-foreground/70 sm:block" />
              </button>

              {open && (
                <div
                  role="menu"
                  className="absolute right-0 mt-2 w-44 overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-black/10"
                >
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setOpen(false)
                      onAccountClick?.()
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-black/5"
                  >
                    <User className="h-4 w-4" />
                    Akun Saya
                  </button>

                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setOpen(false)
                      onLogoutClick?.()
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}