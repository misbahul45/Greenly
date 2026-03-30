import { useState } from "react";
import { Button } from "#/components/ui/button";
import { Badge } from "#/components/ui/badge";
import { Card, CardContent } from "#/components/ui/card";
import { Separator } from "#/components/ui/separator";
import {
  ShoppingBag,
  BarChart3,
  Bell,
  MessageCircle,
  CheckCircle2,
  TrendingUp,
  Package,
  Truck,
  Trophy,
  Star,
  ArrowRight,
  Leaf,
  Users,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";

// ─── DATA ──────────────────────────────────────────────────────────────────────

const STATS = [
  { value: "12rb+", label: "Seller Aktif Terdaftar" },
  { value: "98%", label: "Seller Puas dengan Platform" },
  { value: "Rp 2M+", label: "Total Transaksi Bulanan" },
  { value: "34+", label: "Kota di Seluruh Indonesia" },
];

const BENEFITS = [
  {
    icon: <Package className="w-6 h-6" />,
    title: "Kelola Produk Mudah",
    desc: "Tambah, edit, dan atur stok produkmu dalam hitungan menit. Antarmuka simpel, cocok untuk pemula sekalipun.",
  },
  {
    icon: <TrendingUp className="w-6 h-6" />,
    title: "Harga Transparan",
    desc: "Tidak ada potongan tersembunyi. Kamu tahu persis berapa yang kamu dapat dari setiap transaksi.",
  },
  {
    icon: <BarChart3 className="w-6 h-6" />,
    title: "Dashboard Statistik",
    desc: "Pantau penjualan, pendapatan, dan tren produkmu secara real-time untuk keputusan bisnis yang tepat.",
  },
  {
    icon: <Bell className="w-6 h-6" />,
    title: "Notifikasi Pesanan",
    desc: "Terima notifikasi langsung setiap ada pesanan masuk. Tidak ada pesanan yang terlewat satu pun.",
  },
  {
    icon: <MessageCircle className="w-6 h-6" />,
    title: "Chat Customer & Admin",
    desc: "Komunikasi langsung dengan pembeli dan tim admin kami yang siap membantu 7 hari seminggu.",
  },
  {
    icon: <ShieldCheck className="w-6 h-6" />,
    title: "Terverifikasi & Terpercaya",
    desc: "Tokomu mendapat badge terverifikasi yang meningkatkan kepercayaan pembeli dan potensi penjualanmu.",
  },
];

const STEPS = [
  {
    num: "1",
    title: "Daftar Gratis",
    desc: "Isi formulir pendaftaran seller. Proses cepat, tidak butuh biaya apapun.",
  },
  {
    num: "2",
    title: "Verifikasi Toko",
    desc: "Tim admin kami verifikasi data dan aktifkan toko Anda dalam 1×24 jam.",
  },
  {
    num: "3",
    title: "Upload Produk",
    desc: "Tambahkan produk dengan foto, deskripsi kandungan, dan harga yang jelas.",
  },
  {
    num: "4",
    title: "Terima Pesanan",
    desc: "Tokomu langsung aktif dan bisa ditemukan ribuan pembeli se-Indonesia!",
  },
];

const FEATURES = [
  {
    icon: <Package className="w-5 h-5" />,
    title: "Manajemen Produk & Stok Real-time",
    desc: "Kelola ratusan produk dengan mudah. Update stok otomatis setiap ada transaksi.",
  },
  {
    icon: <BarChart3 className="w-5 h-5" />,
    title: "Laporan Penjualan Lengkap",
    desc: "Analitik harian, mingguan, dan bulanan untuk memahami performa bisnismu.",
  },
  {
    icon: <Truck className="w-5 h-5" />,
    title: "Integrasi Pengiriman Otomatis",
    desc: "Terhubung dengan berbagai jasa pengiriman. Cetak label langsung dari dashboard.",
  },
  {
    icon: <Trophy className="w-5 h-5" />,
    title: "Program Seller Unggulan",
    desc: "Seller berprestasi mendapat promosi ekstra dan tampil lebih menonjol di halaman utama.",
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
      "Sejak gabung Greenly Mart, omzet saya naik 3x lipat! Pembeli dari luar kota bisa beli beras organik saya dengan mudah. Dashboard-nya sangat membantu pantau penjualan.",
  },
  {
    name: "Siti Rahayu",
    role: "UMKM Sayuran Hidroponik – Surabaya",
    initial: "S",
    quote:
      "Daftar mudah, verifikasi cepat, langsung bisa upload produk. Yang paling suka adalah fitur chat dengan pembeli — jadi lebih personal dan kepercayaan meningkat.",
  },
  {
    name: "Ahmad Fauzi",
    role: "Produsen Rempah Lokal – Bandung",
    initial: "A",
    quote:
      "Transparansi harga dan kandungan produk adalah nilai jual utama saya. Dalam 3 bulan sudah dapat 200+ pesanan tetap dari pelanggan setia!",
  },
];

// ─── SUB-COMPONENTS ─────────────────────────────────────────────────────────────

function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <nav className="sticky top-0 z-50 bg-background border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <Leaf className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg text-primary">Greenly Mart</span>
          </div>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">Beranda</a>
            <a href="#cara-kerja" className="hover:text-foreground transition-colors">Cara Kerja</a>
               <a href="#kontak" className="hover:text-foreground transition-colors">Kontak</a>
            <a href="#keuntungan" className="hover:text-foreground transition-colors">Keuntungan</a>
         
          </div>

          {/* CTA */}
          <div className="bg-green-300">
            <Button size="sm">Daftar Gratis <ArrowRight className="w-4 h-4 ml-1" /></Button>
          </div>

          {/* Hamburger */}
          <button
            className="md:hidden p-2 rounded-md text-muted-foreground hover:text-foreground"
            onClick={() => setOpen(!open)}
          >
            <div className="space-y-1.5">
              <span className={`block h-0.5 w-6 bg-current transition-transform ${open ? "rotate-45 translate-y-2" : ""}`} />
              <span className={`block h-0.5 w-6 bg-current transition-opacity ${open ? "opacity-0" : ""}`} />
              <span className={`block h-0.5 w-6 bg-current transition-transform ${open ? "-rotate-45 -translate-y-2" : ""}`} />
            </div>
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="md:hidden pb-4 space-y-3 text-sm border-t pt-4">
            {["Beranda", "Cara Kerja", "Keuntungan", "Kontak"].map((item) => (
              <a key={item} href="#" className="block text-muted-foreground hover:text-foreground py-1">
                {item}
              </a>
            ))}
            <Button size="sm" className="w-full mt-2">Daftar Gratis</Button>
          </div>
        )}
      </div>
    </nav>
  );
}

function HeroDashboard() {
  return (
    <Card className="shadow-2xl relative">
      {/* Notification bubble */}
      <div className="absolute -top-4 -right-4 bg-background border shadow-lg rounded-2xl px-3 py-2 flex items-center gap-2 z-10">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-base">🛒</div>
        <div>
          <p className="text-xs font-bold text-primary leading-none">Pesanan Baru!</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">Beras Organik 5kg – Rp85.000</p>
        </div>
      </div>

      <CardContent className="p-5">
        {/* Topbar dots */}
        <div className="flex gap-1.5 mb-4">
          <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
          <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
          <span className="text-xs text-muted-foreground ml-2 font-medium">Dashboard Seller — Greenly Mart</span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="bg-muted rounded-xl p-3">
            <p className="text-[10px] text-muted-foreground font-medium mb-1">Total Pendapatan</p>
            <p className="text-xl font-black text-primary">Rp 4,2 Jt</p>
            <p className="text-[10px] text-green-600 font-semibold mt-0.5">↑ +28% bulan ini</p>
          </div>
          <div className="bg-muted rounded-xl p-3">
            <p className="text-[10px] text-muted-foreground font-medium mb-1">Pesanan Masuk</p>
            <p className="text-xl font-black text-primary">143</p>
            <p className="text-[10px] text-green-600 font-semibold mt-0.5">↑ +15 hari ini</p>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-muted rounded-xl p-3 mb-3">
          <p className="text-xs font-bold mb-2">📊 Grafik Penjualan Mingguan</p>
          <div className="flex items-end gap-1 h-12">
            {[35, 55, 45, 70, 90, 65, 80].map((h, i) => (
              <div
                key={i}
                className={`flex-1 rounded-t ${i === 4 ? "bg-primary" : "bg-primary/30"}`}
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
        </div>

        {/* Orders */}
        <p className="text-xs font-bold mb-2">📦 Pesanan Terbaru</p>
        <div className="space-y-1.5">
          {ORDERS.map((o, i) => (
            <div key={i} className="flex items-center justify-between bg-muted/50 rounded-lg px-3 py-2">
              <span className="text-xs font-semibold truncate mr-2">{o.name}</span>
              <span className="text-[10px] text-muted-foreground mr-2 shrink-0">{o.price}</span>
              <Badge variant={o.done ? "default" : "secondary"} className="text-[9px] shrink-0">
                {o.status}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function ProductPanel() {
  return (
    <Card className="shadow-lg">
      <CardContent className="p-5">
        {/* Tabs */}
        <div className="flex gap-1 bg-muted p-1 rounded-lg mb-4">
          {["Produk Saya", "Pesanan", "Laporan"].map((tab, i) => (
            <button
              key={tab}
              className={`flex-1 text-xs font-semibold py-1.5 rounded-md transition-colors ${
                i === 0 ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Products */}
        <div className="space-y-2 mb-3">
          {PRODUCTS.map((p, i) => (
            <div key={i} className="flex items-center gap-3 bg-muted/50 rounded-xl p-2.5">
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-xl shrink-0">
                {p.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold truncate">{p.name}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{p.price}</p>
              </div>
              <span className="text-xs font-bold text-primary shrink-0">Stok: {p.stock}</span>
            </div>
          ))}
        </div>

        {/* Revenue summary */}
        <div className="bg-muted rounded-xl p-3 text-center">
          <p className="text-[10px] text-muted-foreground mb-1">Total Pendapatan Bulan Ini</p>
          <p className="text-2xl font-black text-primary">Rp 4.280.000</p>
          <p className="text-[10px] text-green-600 font-semibold mt-0.5">↑ Naik 28% dari bulan lalu</p>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── MAIN COMPONENT ─────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section className="bg-primary text-primary-foreground overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left */}
            <div>
              <Badge className="mb-5 bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30 hover:bg-primary-foreground/20">
                🌾 Platform Khusus UMKM & Petani Lokal
              </Badge>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight mb-5">
                Jual Produk Tanimu{" "}
                <span className="block opacity-80">Lebih Luas &</span>
                <span className="block opacity-80">Lebih Menguntungkan</span>
              </h1>
              <p className="text-primary-foreground/80 text-base sm:text-lg leading-relaxed mb-8 max-w-lg">
                Bergabunglah dengan ribuan petani dan UMKM yang sudah sukses menjual produk
                pertanian mereka secara transparan. Daftar gratis, langsung jualan!
              </p>
              <div className="flex flex-col sm:flex-row gap-3 mb-8">
                <Button size="lg" variant="secondary" className="font-bold">
                  🚀 Daftar Jadi Seller Sekarang
                </Button>
                <Button size="lg" variant="outline" className="border-primary-foreground/40 text-primary-foreground bg-transparent hover:bg-primary-foreground/10">
                  Lihat Cara Kerjanya
                </Button>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-6">
                {["Pendaftaran 100% Gratis", "UMKM Terverifikasi", "Dukungan Admin Penuh"].map((t) => (
                  <div key={t} className="flex items-center gap-2 text-sm text-primary-foreground/80">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-primary-foreground" />
                    {t}
                  </div>
                ))}
              </div>
            </div>

            {/* Right – Dashboard */}
            <div className="relative pt-4 pr-4">
              <HeroDashboard />
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAND ───────────────────────────────────────────────────────── */}
      <section className="border-b bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {STATS.map((s) => (
              <div key={s.label}>
                <p className="text-3xl sm:text-4xl font-black text-primary">{s.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY / BENEFITS ───────────────────────────────────────────────────── */}
      <section id="keuntungan" className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Badge variant="outline" className="mb-4">🌱 Kenapa Pilih Greenly Mart?</Badge>
          <h2 className="text-3xl sm:text-4xl font-black leading-tight mb-3">
            Keuntungan Nyata<br />untuk Seller UMKM
          </h2>
          <p className="text-muted-foreground max-w-lg mb-12 leading-relaxed">
            Kami dirancang khusus untuk membantu petani dan UMKM lokal tumbuh dan
            menjangkau lebih banyak pembeli.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {BENEFITS.map((b) => (
              <Card key={b.title} className="group hover:shadow-md hover:border-primary/40 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    {b.icon}
                  </div>
                  <h3 className="font-bold text-base mb-2">{b.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{b.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Separator />

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────────── */}
      <section id="cara-kerja" className="py-20 lg:py-28 bg-muted/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Badge variant="outline" className="mb-4">⚙️ Cara Kerja</Badge>
          <h2 className="text-3xl sm:text-4xl font-black leading-tight mb-3">
            Mulai Jualan dalam<br />4 Langkah Mudah
          </h2>
          <p className="text-muted-foreground max-w-lg mb-12 leading-relaxed">
            Proses onboarding yang simpel dan cepat — siap jualan dalam hitungan jam.
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {/* Connector line – desktop only */}
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
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────────────────────── */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left */}
            <div>
              <Badge variant="outline" className="mb-4">🛠️ Fitur Seller</Badge>
              <h2 className="text-3xl sm:text-4xl font-black leading-tight mb-8">
                Semua yang Kamu<br />Butuhkan Ada di Sini
              </h2>
              <div className="space-y-5">
                {FEATURES.map((f) => (
                  <div key={f.title} className="flex gap-4 items-start">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
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

            {/* Right – Product panel */}
            <ProductPanel />
          </div>
        </div>
      </section>

      <Separator />

      {/* ── TESTIMONIALS ─────────────────────────────────────────────────────── */}
      <section className="py-20 lg:py-28 bg-primary text-primary-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Badge className="mb-4 bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30 hover:bg-primary-foreground/20">
            💬 Cerita Seller Kami
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-black leading-tight mb-3">
            Sudah Ribuan UMKM<br />Sukses Bersama Kami
          </h2>
          <p className="text-primary-foreground/70 max-w-lg mb-12 leading-relaxed">
            Kisah nyata dari petani dan pelaku UMKM yang telah merasakan manfaat bergabung di Greenly Mart.
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t) => (
              <Card key={t.name} className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground">
                <CardContent className="p-6">
                  <div className="flex gap-0.5 mb-4">
                    {Array(5).fill(0).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-sm text-primary-foreground/85 leading-relaxed italic mb-5">
                    "{t.quote}"
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center font-black text-base">
                      {t.initial}
                    </div>
                    <div>
                      <p className="font-bold text-sm">{t.name}</p>
                      <p className="text-[11px] text-primary-foreground/55">{t.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ────────────────────────────────────────────────────────── */}
      <section className="py-20 lg:py-28">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
          <Badge variant="outline" className="mb-4">🚀 Mulai Sekarang</Badge>
          <h2 className="text-3xl sm:text-4xl font-black leading-tight mb-4">
            Siap Membawa Produkmu<br />ke Level Berikutnya?
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-8">
            Bergabunglah dengan 12.000+ seller yang sudah mempercayakan bisnis pertanian
            mereka pada Greenly Mart. Daftar gratis hari ini, mulai panen cuan besok!
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
            <Button size="lg" className="font-bold text-base px-8">
              🌾 Daftar Jadi Seller Gratis
            </Button>
            <Button size="lg" variant="outline" className="text-base px-8">
              Hubungi Tim Kami
            </Button>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-muted-foreground">
            {["Gratis selamanya", "Tanpa kartu kredit", "Mulai dalam 24 jam"].map((item, i) => (
              <span key={item} className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────────── */}
      <footer className="border-t py-8 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center">
                <Leaf className="w-3.5 h-3.5 text-primary-foreground" />
              </div>
              <span className="font-bold text-primary">Greenly Mart</span>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              © 2024 Greenly Mart — Marketplace Produk Pertanian Lokal yang Transparan & Terpercaya
            </p>
            <div className="flex gap-4 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">Privasi</a>
              <a href="#" className="hover:text-foreground transition-colors">Syarat</a>
              <a href="#" className="hover:text-foreground transition-colors">Kontak</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}