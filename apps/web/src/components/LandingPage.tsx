import { useMemo, useState } from "react";
import { Button } from "#/components/ui/button";
import { Badge } from "#/components/ui/badge";
import { Link } from "@tanstack/react-router";
import { Card, CardContent } from "#/components/ui/card";
import { Separator } from "#/components/ui/separator";
import {
  BarChart3,
  Bell,
  CheckCircle2,
  ChevronRight,
  Leaf,
  MessageCircle,
  Package,
  ShieldCheck,
  TrendingUp,
  Truck,
  Trophy,
  ArrowRight,
  Star,
} from "lucide-react";

/** ---------------- DATA ---------------- */

const STATS = [
  { value: "12rb+", label: "Seller aktif terdaftar" },
  { value: "98%", label: "Seller puas dengan platform" },
  { value: "Rp 2M+", label: "Total transaksi bulanan" },
  { value: "34+", label: "Kota terjangkau" },
];

const BENEFITS = [
  {
    icon: <Package className="w-6 h-6" />,
    title: "Kelola Produk Mudah",
    desc: "Tambah, edit, dan atur stok dalam hitungan menit. Simpel & ramah pemula.",
  },
  {
    icon: <TrendingUp className="w-6 h-6" />,
    title: "Harga Transparan",
    desc: "Tidak ada potongan tersembunyi. Kamu tahu persis margin dari setiap transaksi.",
  },
  {
    icon: <BarChart3 className="w-6 h-6" />,
    title: "Dashboard Statistik",
    desc: "Pantau performa penjualan real-time untuk keputusan yang lebih tepat.",
  },
  {
    icon: <Bell className="w-6 h-6" />,
    title: "Notifikasi Pesanan",
    desc: "Notif instan untuk pesanan masuk—biar responsmu selalu cepat.",
  },
  {
    icon: <MessageCircle className="w-6 h-6" />,
    title: "Chat Customer & Admin",
    desc: "Komunikasi langsung dengan pembeli dan admin. Support 7 hari seminggu.",
  },
  {
    icon: <ShieldCheck className="w-6 h-6" />,
    title: "Terverifikasi & Terpercaya",
    desc: "Badge verifikasi meningkatkan trust pembeli dan peluang repeat order.",
  },
];

const STEPS = [
  { num: "1", title: "Daftar Gratis", desc: "Isi formulir seller. Cepat, tanpa biaya, tanpa ribet." },
  { num: "2", title: "Verifikasi Toko", desc: "Tim kami verifikasi data dan aktifkan toko maksimal 1×24 jam." },
  { num: "3", title: "Upload Produk", desc: "Masukkan foto, deskripsi, kandungan, harga, dan stok." },
  { num: "4", title: "Terima Pesanan", desc: "Tokomu tampil ke pembeli—mulai terima order dari berbagai kota." },
];

const FEATURES = [
  {
    icon: <Package className="w-5 h-5" />,
    title: "Manajemen Produk & Stok Real-time",
    desc: "Kelola banyak produk dengan mudah. Stok otomatis berkurang saat transaksi terjadi.",
  },
  {
    icon: <BarChart3 className="w-5 h-5" />,
    title: "Laporan Penjualan Lengkap",
    desc: "Analitik harian, mingguan, dan bulanan untuk mengukur performa bisnismu.",
  },
  {
    icon: <Truck className="w-5 h-5" />,
    title: "Pengiriman Terintegrasi",
    desc: "Pilih kurir, cetak label, dan tracking langsung dari dashboard.",
  },
  {
    icon: <Trophy className="w-5 h-5" />,
    title: "Program Seller Unggulan",
    desc: "Seller terbaik dapat exposure ekstra: badge, highlight, dan promosi khusus.",
  },
];

const PRODUCTS = [
  { emoji: "🌾", name: "Beras Merah Organik 5kg", price: "Rp 85.000 / karung", stock: 48 },
  { emoji: "🥬", name: "Sayur Bayam Segar 500g", price: "Rp 12.000 / ikat", stock: 120 },
  { emoji: "🌶️", name: "Cabai Merah Keriting 1kg", price: "Rp 45.000 / kg", stock: 35 },
  { emoji: "🍅", name: "Tomat Cherry Organik", price: "Rp 22.000 / 250g", stock: 60 },
];

const ORDERS = [
  { name: "Beras Merah Organik", price: "Rp 85.000", status: "Selesai", done: true },
  { name: "Sayur Bayam 500g", price: "Rp 12.000", status: "Diproses", done: false },
  { name: "Cabai Merah 1kg", price: "Rp 45.000", status: "Selesai", done: true },
];

const TESTIMONIALS = [
  {
    name: "Budi Santoso",
    role: "Petani Beras Organik – Jawa Tengah",
    initial: "B",
    quote:
      "Sejak gabung Greenly Mart, omzet saya naik 3x. Pembeli dari luar kota jadi gampang order, dan dashboardnya membantu banget.",
  },
  {
    name: "Siti Rahayu",
    role: "UMKM Sayur Hidroponik – Surabaya",
    initial: "S",
    quote:
      "Daftar mudah, verifikasi cepat. Fitur chat bikin transaksi lebih personal dan kepercayaan meningkat.",
  },
  {
    name: "Ahmad Fauzi",
    role: "Produsen Rempah Lokal – Bandung",
    initial: "A",
    quote:
      "Transparansi harga & info produk jadi nilai jual utama saya. Dalam 3 bulan sudah dapat pelanggan tetap.",
  },
];

/** ---------------- UI HELPERS ---------------- */

function Container({ children }: { children: React.ReactNode }) {
  return <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">{children}</div>;
}

function SectionTitle({
  badge,
  title,
  subtitle,
  align = "left",
}: {
  badge: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  align?: "left" | "center";
}) {
  return (
    <div className={align === "center" ? "text-center" : ""}>
      <Badge variant="outline" className="mb-4">
        {badge}
      </Badge>
      <h2 className="text-3xl sm:text-4xl font-black leading-tight tracking-tight">
        {title}
      </h2>
      {subtitle ? (
        <p className={`mt-3 text-muted-foreground leading-relaxed ${align === "center" ? "mx-auto" : ""} max-w-xl`}>
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}

/** ---------------- SUB COMPONENTS ---------------- */

function Navbar() {
  const [open, setOpen] = useState(false);

  const links = useMemo(
    () => [
      { label: "Beranda", href: "#beranda" },
      { label: "Cara Kerja", href: "#cara-kerja" },
      { label: "Keuntungan", href: "#keuntungan" },
      { label: "Kontak", href: "#kontak" },
    ],
    []
  );

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur border-b">
      <Container>
        <div className="flex items-center justify-between h-16">
          <a href="#beranda" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl bg-primary/10 text-primary flex items-center justify-center ring-1 ring-primary/15">
              <Leaf className="w-4 h-4" />
            </div>
            <span className="font-black text-lg tracking-tight">Greenly Mart</span>
          </a>

          <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            {links.map((l) => (
              <a key={l.href} href={l.href} className="hover:text-foreground transition-colors">
                {l.label}
              </a>
            ))}
          </div>

          <div className="hidden md:block">
            <Button size="sm" className="font-semibold">
              Daftar Gratis <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          <button
            className="md:hidden p-2 rounded-md text-muted-foreground hover:text-foreground"
            onClick={() => setOpen(!open)}
            aria-label="Open menu"
          >
            <div className="space-y-1.5">
              <span className={`block h-0.5 w-6 bg-current transition-transform ${open ? "rotate-45 translate-y-2" : ""}`} />
              <span className={`block h-0.5 w-6 bg-current transition-opacity ${open ? "opacity-0" : ""}`} />
              <span className={`block h-0.5 w-6 bg-current transition-transform ${open ? "-rotate-45 -translate-y-2" : ""}`} />
            </div>
          </button>
        </div>

        {open && (
          <div className="md:hidden pb-4 space-y-2 text-sm border-t pt-4">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="block text-muted-foreground hover:text-foreground py-2"
                onClick={() => setOpen(false)}
              >
                {l.label}
              </a>
            ))}
            

<Button
  asChild
  size="sm"
  className="w-full mt-2 font-semibold"
>
  <Link to="/auth/login">
    Daftar Gratis
  </Link>
</Button>
          </div>
        )}
      </Container>
    </nav>
  );
}

function HeroDashboard() {
  return (
    <div className="relative">
      {/* Glow */}
      <div className="absolute -inset-6 rounded-[32px] bg-gradient-to-br from-primary/20 via-transparent to-primary/10 blur-2xl" />

      <Card className="relative shadow-2xl rounded-3xl border bg-background/90 backdrop-blur">
        {/* Bubble */}
        <div className="absolute -top-4 -right-4 bg-background border shadow-lg rounded-2xl px-3 py-2 flex items-center gap-2 z-10">
          <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-base">🛒</div>
          <div>
            <p className="text-xs font-bold text-primary leading-none">Pesanan Baru!</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Beras Organik 5kg – Rp85.000</p>
          </div>
        </div>

        <CardContent className="p-6">
          {/* Topbar */}
          <div className="flex items-center gap-2 mb-5">
            <div className="flex gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
              <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
            </div>
            <span className="text-xs text-muted-foreground font-medium">
              Dashboard Seller — Greenly Mart
            </span>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="rounded-2xl p-4 bg-muted/60 ring-1 ring-border">
              <p className="text-[11px] text-muted-foreground font-medium mb-1">Total Pendapatan</p>
              <p className="text-2xl font-black tracking-tight">Rp 4,2 Jt</p>
              <p className="text-[11px] text-green-600 font-semibold mt-1">↑ +28% bulan ini</p>
            </div>
            <div className="rounded-2xl p-4 bg-muted/60 ring-1 ring-border">
              <p className="text-[11px] text-muted-foreground font-medium mb-1">Pesanan Masuk</p>
              <p className="text-2xl font-black tracking-tight">143</p>
              <p className="text-[11px] text-green-600 font-semibold mt-1">↑ +15 hari ini</p>
            </div>
          </div>

          {/* Chart */}
          <div className="rounded-2xl p-4 bg-muted/60 ring-1 ring-border mb-4">
            <p className="text-sm font-bold mb-3">📊 Grafik Penjualan Mingguan</p>
            <div className="flex items-end gap-1.5 h-16">
              {[35, 55, 45, 70, 90, 65, 80].map((h, i) => (
                <div
                  key={i}
                  className={`flex-1 rounded-t-xl ${i === 4 ? "bg-primary" : "bg-primary/25"}`}
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          </div>

          {/* Orders */}
          <p className="text-sm font-bold mb-3">📦 Pesanan Terbaru</p>
          <div className="space-y-2">
            {ORDERS.map((o, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-2xl px-4 py-3 bg-muted/50 ring-1 ring-border"
              >
                <span className="text-sm font-semibold truncate mr-2">{o.name}</span>
                <span className="text-xs text-muted-foreground mr-2 shrink-0">{o.price}</span>
                <Badge variant={o.done ? "default" : "secondary"} className="text-[10px] shrink-0">
                  {o.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ProductPanel() {
  return (
    <Card className="shadow-xl rounded-3xl border bg-background">
      <CardContent className="p-6">
        <div className="flex gap-1 bg-muted p-1 rounded-2xl mb-5 ring-1 ring-border">
          {["Produk Saya", "Pesanan", "Laporan"].map((tab, i) => (
            <button
              key={tab}
              className={`flex-1 text-xs font-semibold py-2 rounded-xl transition-colors ${
                i === 0 ? "bg-background text-foreground shadow-sm ring-1 ring-border" : "text-muted-foreground"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="space-y-3 mb-5">
          {PRODUCTS.map((p, i) => (
            <div key={i} className="flex items-center gap-3 rounded-2xl p-3 bg-muted/50 ring-1 ring-border">
              <div className="w-11 h-11 rounded-2xl bg-background ring-1 ring-border flex items-center justify-center text-xl shrink-0">
                {p.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate">{p.name}</p>
                <p className="text-xs text-muted-foreground mt-1">{p.price}</p>
              </div>
              <span className="text-sm font-black text-primary shrink-0">Stok: {p.stock}</span>
            </div>
          ))}
        </div>

        <div className="rounded-2xl p-4 text-center bg-muted/60 ring-1 ring-border">
          <p className="text-xs text-muted-foreground mb-1">Total Pendapatan Bulan Ini</p>
          <p className="text-3xl font-black tracking-tight">Rp 4.280.000</p>
          <p className="text-xs text-green-600 font-semibold mt-1">↑ Naik 28% dari bulan lalu</p>
        </div>
      </CardContent>
    </Card>
  );
}

/** ---------------- MAIN ---------------- */

export default function LandingPage() {
  return (
    <div id="beranda" className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* HERO */}
      <section className="relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-background to-background" />
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-primary/15 blur-3xl" />

        <Container>
          <div className="relative py-14 lg:py-20">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              {/* Left */}
              <div>
                <Badge className="mb-5 bg-primary/10 text-primary border-primary/20 hover:bg-primary/10">
                  🌾 Platform khusus UMKM & petani lokal
                </Badge>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.05] tracking-tight mb-5">
                  Jual produk tanimu
                  <span className="block text-primary mt-2">lebih luas & lebih untung</span>
                </h1>

                <p className="text-muted-foreground text-base sm:text-lg leading-relaxed mb-8 max-w-xl">
                  Marketplace yang dirancang untuk petani dan UMKM: transparansi harga, dashboard penjualan,
                  dan support admin yang responsif. Daftar gratis dan mulai jualan hari ini.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 mb-7">
                  <Button size="lg" className="font-bold">
                    🚀 Daftar Jadi Seller <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="font-semibold"
                    onClick={() => document.getElementById("cara-kerja")?.scrollIntoView({ behavior: "smooth" })}
                  >
                    Lihat Cara Kerja
                  </Button>
                </div>

                <div className="grid sm:grid-cols-3 gap-3 max-w-xl">
                  {["Pendaftaran 100% gratis", "Toko terverifikasi", "Dukungan admin penuh"].map((t) => (
                    <div key={t} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-primary" />
                      <span>{t}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right */}
              <div className="relative lg:pl-6">
                <HeroDashboard />
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* STATS */}
      <section className="border-y bg-background">
        <Container>
          <div className="py-12 grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {STATS.map((s) => (
              <div key={s.label} className="rounded-3xl p-4">
                <p className="text-3xl sm:text-4xl font-black text-primary tracking-tight">{s.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* BENEFITS */}
      <section id="keuntungan" className="py-18 lg:py-24">
        <Container>
          <SectionTitle
            badge="🌱 Kenapa Greenly Mart?"
            title={
              <>
                Keuntungan nyata <br className="hidden sm:block" /> untuk seller UMKM
              </>
            }
            subtitle="Dibuat khusus agar petani dan UMKM lokal bisa tumbuh, dipercaya, dan menjangkau pembeli lebih luas."
          />

          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {BENEFITS.map((b) => (
              <Card
                key={b.title}
                className="group rounded-3xl border bg-background hover:shadow-lg transition-all"
              >
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4 ring-1 ring-primary/15 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    {b.icon}
                  </div>
                  <h3 className="font-bold text-base mb-2">{b.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{b.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      <Separator />

      {/* HOW IT WORKS */}
      <section id="cara-kerja" className="py-18 lg:py-24 bg-muted/30">
        <Container>
          <SectionTitle
            badge="⚙️ Cara Kerja"
            title={
              <>
                Mulai jualan dalam <br className="hidden sm:block" /> 4 langkah mudah
              </>
            }
            subtitle="Onboarding cepat dan simpel — fokus ke jualan, bukan ribet pengaturan."
          />

          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            <div className="hidden lg:block absolute top-7 left-[12.5%] right-[12.5%] h-0.5 bg-primary/20 z-0" />

            {STEPS.map((s, i) => (
              <div key={s.num} className="relative z-10 text-center flex flex-col items-center">
                <div className="w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-black mb-4 shadow-lg">
                  {s.num}
                </div>
                <h3 className="font-bold text-base mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
                {i < STEPS.length - 1 && (
                  <ChevronRight className="lg:hidden w-6 h-6 text-primary/40 mt-4 rotate-90" />
                )}
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* FEATURES */}
      <section className="py-18 lg:py-24">
        <Container>
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <SectionTitle
                badge="🛠️ Fitur Seller"
                title={
                  <>
                    Semua yang kamu <br className="hidden sm:block" /> butuhkan ada di sini
                  </>
                }
                subtitle="Dari stok sampai laporan, semuanya rapi dalam satu dashboard."
              />

              <div className="mt-10 space-y-5">
                {FEATURES.map((f) => (
                  <div key={f.title} className="flex gap-4 items-start">
                    <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5 ring-1 ring-primary/15">
                      {f.icon}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm mb-1">{f.title}</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <ProductPanel />
          </div>
        </Container>
      </section>

      <Separator />

      {/* TESTIMONIALS */}
      <section className="py-18 lg:py-24 bg-primary text-primary-foreground">
        <Container>
          <SectionTitle
            badge="💬 Cerita Seller"
            title={
              <>
                Ribuan UMKM <br className="hidden sm:block" /> sukses bersama kami
              </>
            }
            subtitle="Kisah nyata seller yang bertumbuh setelah bergabung."
          />

          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t) => (
              <Card key={t.name} className="rounded-3xl bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground">
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-4">
                    {Array(5)
                      .fill(0)
                      .map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                  </div>
                  <p className="text-sm text-primary-foreground/85 leading-relaxed italic mb-5">
                    “{t.quote}”
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center font-black text-base">
                      {t.initial}
                    </div>
                    <div>
                      <p className="font-bold text-sm">{t.name}</p>
                      <p className="text-[11px] text-primary-foreground/60">{t.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section id="kontak" className="py-18 lg:py-24">
        <Container>
          <div className="max-w-2xl mx-auto text-center">
            <Badge variant="outline" className="mb-4">
              🚀 Mulai Sekarang
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-black leading-tight tracking-tight mb-4">
              Siap bawa produkmu <br className="hidden sm:block" /> ke level berikutnya?
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-8">
              Daftar gratis hari ini. Tanpa kartu kredit. Toko aktif cepat dan siap menerima pesanan.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-7">
              <Button size="lg" className="font-bold text-base px-8">
                🌾 Daftar Seller Gratis
              </Button>
              <Button size="lg" variant="outline" className="text-base px-8 font-semibold">
                Hubungi Tim Kami
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-muted-foreground">
              {["Gratis selamanya", "Tanpa kartu kredit", "Mulai dalam 24 jam"].map((item) => (
                <span key={item} className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  {item}
                </span>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* FOOTER */}
      <footer className="border-t py-8 bg-muted/20">
        <Container>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <a href="#beranda" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-2xl bg-primary/10 text-primary flex items-center justify-center ring-1 ring-primary/15">
                <Leaf className="w-4 h-4" />
              </div>
              <span className="font-black">Greenly Mart</span>
            </a>

            <p className="text-sm text-muted-foreground text-center">
              © 2026 Greenly Mart — Marketplace produk pertanian lokal yang transparan & terpercaya
            </p>

            <div className="flex gap-4 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">
                Privasi
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                Syarat
              </a>
              <a href="#kontak" className="hover:text-foreground transition-colors">
                Kontak
              </a>
            </div>
          </div>
        </Container>
      </footer>
    </div>
  );
}