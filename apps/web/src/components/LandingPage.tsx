import { useState } from "react"
import { Button } from "#/components/ui/button"
import { Badge } from "#/components/ui/badge"
import { Card, CardContent } from "#/components/ui/card"
import { Input } from "#/components/ui/input"
import { Textarea } from "#/components/ui/textarea"
import { Link } from "@tanstack/react-router"
import {
  Package,
  TrendingUp,
  BarChart3,
  Bell,
  MessageCircle,
  ShieldCheck,
  Menu,
  X,
} from "lucide-react"

function Container({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">{children}</div>
}

export default function LandingPage() {
  const [showPopup, setShowPopup] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const [nama, setNama] = useState("")
  const [wa, setWa] = useState("")
  const [email, setEmail] = useState("")
  const [pesan, setPesan] = useState("")

  const steps = [
    {
      title: "Daftar Gratis",
      desc: "Buat akun seller dalam hitungan menit tanpa biaya.",
    },
    {
      title: "Verifikasi Toko",
      desc: "Tim kami akan memverifikasi usaha Anda.",
    },
    {
      title: "Upload Produk",
      desc: "Tambahkan foto dan deskripsi produk Anda.",
    },
    {
      title: "Terima Pesanan",
      desc: "Mulai menerima pesanan dari pembeli.",
    },
  ]

  const benefits = [
    {
      icon: <Package className="h-6 w-6" />,
      title: "Kelola Produk",
      desc: "Kelola stok, kategori, dan deskripsi produk dengan mudah.",
    },
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: "Harga Transparan",
      desc: "Sistem transparansi harga tanpa biaya tersembunyi.",
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: "Dashboard Bisnis",
      desc: "Analisis performa penjualan secara real-time.",
    },
    {
      icon: <Bell className="h-6 w-6" />,
      title: "Notifikasi Instan",
      desc: "Dapatkan notifikasi setiap ada pesanan baru.",
    },
    {
      icon: <MessageCircle className="h-6 w-6" />,
      title: "Chat Customer",
      desc: "Komunikasi langsung dengan pembeli.",
    },
    {
      icon: <ShieldCheck className="h-6 w-6" />,
      title: "Terverifikasi",
      desc: "Badge seller terpercaya meningkatkan kepercayaan.",
    },
  ]

  const navItems = [
    { label: "Beranda", href: "#beranda" },
    { label: "Cara Kerja", href: "#cara" },
    { label: "Keuntungan", href: "#keuntungan" },
    { label: "Kontak", href: "#kontak" },
  ]

  const [active, setActive] = useState("Beranda")

  const handleNavClick = (label: string) => {
    setActive(label)
    setIsMobileMenuOpen(false)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur">
        <Container>
          <div className="flex h-16 items-center justify-between lg:h-20">
            {/* LOGO */}
            <div className="flex min-w-0 items-center gap-2 sm:gap-3">
              <img
                src="/Sidebar/LogoGreenly.png"
                alt="Greenly Mart"
                className="h-9 w-auto object-contain sm:h-10 lg:h-12"
              />
              <span className="truncate text-sm font-bold sm:text-base lg:text-lg">
                Greenly Mart
              </span>
            </div>

            {/* DESKTOP NAV */}
            <div className="hidden lg:flex items-center rounded-full border bg-gray-100 p-1 gap-1">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() => handleNavClick(item.label)}
                  className={`rounded-full px-4 xl:px-5 py-2 text-sm font-medium transition ${
                    active === item.label
                      ? "bg-white text-green-700 shadow"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {item.label}
                </a>
              ))}
            </div>

            {/* RIGHT SIDE */}
            <div className="flex items-center gap-2">
              <Button
                asChild
                className="hidden sm:inline-flex bg-green-600 hover:bg-green-700"
              >
                <Link to="/auth/login">Daftar Jadi Seller</Link>
              </Button>

              <button
                type="button"
                className="inline-flex items-center justify-center rounded-md p-2 text-slate-700 lg:hidden"
                onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>

          {/* MOBILE/TABLET MENU */}
          {isMobileMenuOpen && (
            <div className="border-t pb-4 pt-3 lg:hidden">
              <div className="flex flex-col gap-2">
                {navItems.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    onClick={() => handleNavClick(item.label)}
                    className={`rounded-xl px-4 py-3 text-sm font-medium transition ${
                      active === item.label
                        ? "bg-green-50 text-green-700"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    {item.label}
                  </a>
                ))}

                <Button
                  asChild
                  className="mt-2 w-full bg-green-600 hover:bg-green-700 sm:hidden"
                >
                  <Link to="/auth/login">Daftar Jadi Seller</Link>
                </Button>
              </div>
            </div>
          )}
        </Container>
      </nav>

      {/* HERO */}
      <section id="beranda" className="py-12 sm:py-16 lg:py-20">
        <Container>
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <div className="order-2 lg:order-1">
              <Badge className="mb-4 bg-green-100 text-green-700">
                Platform khusus UMKM & petani lokal
              </Badge>

              <h1 className="mb-6 text-3xl font-black leading-tight sm:text-4xl lg:text-5xl xl:text-6xl">
                Jual produk tanimu lebih
                <span className="text-green-600"> luas & untung</span>
              </h1>

              <p className="mb-8 max-w-xl text-sm text-muted-foreground sm:text-base lg:text-lg">
                Tingkatkan pendapatan dengan dashboard toko modern,
                transparansi harga, dan dukungan penuh untuk UMKM dan petani
                lokal.
              </p>

              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
                <Button
                  size="lg"
                  className="w-full bg-green-600 hover:bg-green-700 sm:w-auto"
                  asChild
                >
                  <Link to="/auth/login">Daftar Jadi Seller</Link>
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto"
                  onClick={() =>
                    document
                      .getElementById("cara")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                >
                  Lihat Cara Kerja
                </Button>
              </div>
            </div>

            {/* DASHBOARD MOCKUP */}
            <Card className="order-1 rounded-3xl bg-slate-900 text-white shadow-2xl lg:order-2">
              <CardContent className="p-4 sm:p-6">
                <h3 className="mb-4 text-base font-bold sm:text-lg">
                  Dashboard Seller
                </h3>

                <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="rounded-xl bg-slate-800 p-4">
                    <p className="text-xs text-gray-400">Total Pendapatan</p>
                    <p className="text-lg font-bold sm:text-xl">
                      Rp 12.450.000
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-800 p-4">
                    <p className="text-xs text-gray-400">Pesanan Masuk</p>
                    <p className="text-lg font-bold text-green-400 sm:text-xl">
                      42
                    </p>
                  </div>
                </div>

                <div className="flex h-20 items-end gap-2 sm:h-24">
                  {[40, 60, 30, 80, 90, 70].map((h, i) => (
                    <div
                      key={i}
                      style={{ height: `${h}%` }}
                      className="flex-1 rounded-t bg-green-500"
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </Container>
      </section>

      {/* CARA KERJA */}
      <section id="cara" className="bg-muted/30 py-16 sm:py-20 lg:py-24">
        <Container>
          <div className="mb-12 text-center sm:mb-16">
            <h2 className="text-2xl font-bold sm:text-3xl">
              Bagaimana Cara Kerja Greenly Mart?
            </h2>
            <p className="mt-2 text-sm text-muted-foreground sm:text-base">
              Mulai berjualan dengan 4 langkah mudah
            </p>
          </div>

          <div className="relative grid grid-cols-1 gap-8 text-center sm:grid-cols-2 md:grid-cols-4 md:gap-10">
            <div className="absolute left-[12.5%] right-[12.5%] top-8 z-0 hidden h-[2px] bg-green-200 md:block"></div>

            {steps.map((step, index) => (
              <div key={index} className="relative z-10">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-base font-bold text-green-600 sm:h-16 sm:w-16 sm:text-lg">
                  {index + 1}
                </div>

                <h3 className="mb-2 text-base font-semibold">{step.title}</h3>

                <p className="mx-auto max-w-xs text-sm text-muted-foreground">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* KEUNTUNGAN */}
      <section id="keuntungan" className="py-16 sm:py-20 lg:py-24">
        <Container>
          <div className="mb-12 text-center sm:mb-16">
            <h2 className="text-2xl font-bold sm:text-3xl">
              Keuntungan Menjadi Mitra
            </h2>
            <p className="mt-2 text-sm text-muted-foreground sm:text-base">
              Fitur lengkap untuk mendukung bisnis Anda
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {benefits.map((b, index) => (
              <Card
                key={index}
                className="group cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:scale-[1.02] hover:shadow-xl"
              >
                <CardContent className="p-5 sm:p-6">
                  <div className="mb-4 text-green-600 transition group-hover:text-green-700">
                    {b.icon}
                  </div>

                  <h3 className="mb-2 text-base font-semibold">{b.title}</h3>

                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {b.desc}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* CONTACT */}
      <section id="kontak" className="bg-green-50 py-16 sm:py-20 lg:py-24">
        <Container>
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-16">
            {/* LEFT */}
            <div>
              <h2 className="mb-4 text-2xl font-bold sm:text-3xl">
                Hubungi Kami
              </h2>

              <p className="mb-6 max-w-lg text-sm text-muted-foreground sm:text-base">
                Ada pertanyaan? Tim kami siap membantu mengembangkan bisnis
                pertanian Anda.
              </p>

              <div className="space-y-3 text-sm sm:text-base">
                <p>Email: halo@greenlymart.id</p>
                <p>WhatsApp: +62 812 3456 7890</p>
                <p>Surabaya, Jawa Timur</p>
              </div>
            </div>

            {/* FORM */}
            <Card>
              <CardContent className="space-y-4 p-5 sm:p-6">
                <Input
                  placeholder="Nama Lengkap"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                />

                <Input
                  placeholder="Nomor WA"
                  value={wa}
                  onChange={(e) => setWa(e.target.value)}
                />

                <Input
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />

                <Textarea
                  placeholder="Pesan Anda"
                  value={pesan}
                  onChange={(e) => setPesan(e.target.value)}
                />

                <Button
                  className="w-full bg-green-600 hover:bg-green-700"
                  onClick={() => {
                    setShowPopup(true)
                    setNama("")
                    setWa("")
                    setEmail("")
                    setPesan("")
                  }}
                >
                  Kirim Pesan Sekarang
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* POPUP */}
          {showPopup && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
              <div className="w-full max-w-sm rounded-xl bg-white p-6 text-center shadow-lg sm:p-8">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border-2 border-green-300">
                  <span className="text-3xl text-green-500">✔</span>
                </div>

                <h2 className="mb-2 text-xl font-bold">Berhasil!</h2>

                <p className="mb-6 text-sm text-gray-500">
                  Pesan Anda berhasil dikirim
                </p>

                <Button
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => setShowPopup(false)}
                >
                  OK
                </Button>
              </div>
            </div>
          )}
        </Container>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-900 py-10 text-white">
        <Container>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-10">
            <div>
              <h3 className="mb-3 text-lg font-bold">Greenly Mart</h3>

              <p className="text-sm leading-relaxed text-gray-400">
                Marketplace untuk UMKM & petani lokal agar dapat menjual produk
                secara transparan dan terpercaya.
              </p>
            </div>

            <div>
              <h4 className="mb-3 font-semibold">Navigasi</h4>

              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <a href="#beranda" className="transition hover:text-white">
                    Beranda
                  </a>
                </li>
                <li>
                  <a href="#cara" className="transition hover:text-white">
                    Cara Kerja
                  </a>
                </li>
                <li>
                  <a href="#keuntungan" className="transition hover:text-white">
                    Keuntungan
                  </a>
                </li>
                <li>
                  <a href="#kontak" className="transition hover:text-white">
                    Kontak
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="mb-3 font-semibold">Layanan</h4>

              <ul className="space-y-2 text-sm text-gray-400">
                <li>Pendaftaran Seller</li>
                <li>Pusat Bantuan</li>
                <li>Syarat & Ketentuan</li>
              </ul>
            </div>
          </div>

          <p className="mt-10 text-center text-sm text-gray-500">
            © 2026 Greenly Mart. All rights reserved.
          </p>
        </Container>
      </footer>
    </div>
  )
}