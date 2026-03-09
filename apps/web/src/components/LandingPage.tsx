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
  ArrowRight
} from "lucide-react"

function Container({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-7xl mx-auto px-6">
      {children}
    </div>
  )
}

export default function LandingPage() {

  const steps = [
    {
      title: "Daftar Gratis",
      desc: "Buat akun seller dalam hitungan menit tanpa biaya."
    },
    {
      title: "Verifikasi Toko",
      desc: "Tim kami akan memverifikasi usaha Anda."
    },
    {
      title: "Upload Produk",
      desc: "Tambahkan foto dan deskripsi produk Anda."
    },
    {
      title: "Terima Pesanan",
      desc: "Mulai menerima pesanan dari pembeli."
    }
  ]

  const benefits = [
    {
      icon: <Package className="w-6 h-6" />,
      title: "Kelola Produk",
      desc: "Kelola stok, kategori, dan deskripsi produk dengan mudah."
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Harga Transparan",
      desc: "Sistem transparansi harga tanpa biaya tersembunyi."
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Dashboard Bisnis",
      desc: "Analisis performa penjualan secara real-time."
    },
    {
      icon: <Bell className="w-6 h-6" />,
      title: "Notifikasi Instan",
      desc: "Dapatkan notifikasi setiap ada pesanan baru."
    },
    {
      icon: <MessageCircle className="w-6 h-6" />,
      title: "Chat Customer",
      desc: "Komunikasi langsung dengan pembeli."
    },
    {
      icon: <ShieldCheck className="w-6 h-6" />,
      title: "Terverifikasi",
      desc: "Badge seller terpercaya meningkatkan kepercayaan."
    }
  ]
const navItems = [
  { label: "Beranda", href: "#beranda" },
  { label: "Cara Kerja", href: "#cara" },
  { label: "Keuntungan", href: "#keuntungan" },
  { label: "Kontak", href: "#kontak" },
]

const [active, setActive] = useState("Beranda")
  return (
    <div className="min-h-screen bg-white">

      {/* NAVBAR */}
<nav className="border-b sticky top-0 bg-white z-50">
  <Container>
    <div className="flex items-center justify-between h-16">

      {/* LOGO */}
      <div className="flex items-center gap-3">
        <img
          src="/Sidebar/LogoGreenly.png"
          alt="Greenly Mart"
          className="h-12 w-auto object-contain"
        />
        <span className="font-bold text-lg">Greenly Mart</span>
      </div>

      {/* NAV MENU */}
      <div className="bg-gray-100 rounded-full p-1 flex gap-1 border">

        {navItems.map((item) => (
          <a
            key={item.label}
            href={item.href}
            onClick={() => setActive(item.label)}
            className={`px-5 py-2 rounded-full text-sm font-medium transition
            ${
              active === item.label
                ? "bg-white shadow text-green-700"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {item.label}
          </a>
        ))}

      </div>

      {/* CTA */}
      <Button asChild className="bg-green-600 hover:bg-green-700">
        <Link to="/auth/login">
          Daftar Jadi Seller
        </Link>
      </Button>

    </div>
  </Container>
</nav>


      {/* HERO */}

      <section id="beranda" className="py-20">
        <Container>

          <div className="grid lg:grid-cols-2 gap-16 items-center">

            <div>

              <Badge className="bg-green-100 text-green-700 mb-4">
                Platform khusus UMKM & petani lokal
              </Badge>

              <h1 className="text-5xl font-black leading-tight mb-6">
                Jual produk tanimu lebih
                <span className="text-green-600"> luas & untung</span>
              </h1>

              <p className="text-muted-foreground mb-8 text-lg">
                Tingkatkan pendapatan dengan dashboard toko modern,
                transparansi harga, dan dukungan penuh untuk UMKM
                dan petani lokal.
              </p>

              <div className="flex gap-4">

                <Button size="lg" className="bg-green-600 hover:bg-green-700">
                  Daftar Jadi Seller
                </Button>

                <Button variant="outline" size="lg">
                  Lihat Cara Kerja
                </Button>

              </div>

              <div className="flex gap-8 mt-10 text-sm text-muted-foreground">
                <span>1,200+ Petani</span>
                <span>50k+ Produk</span>
                <span>24+ Kota</span>
              </div>

            </div>


            {/* DASHBOARD MOCKUP */}

            <Card className="bg-slate-900 text-white shadow-2xl rounded-3xl">
              <CardContent className="p-6">

                <h3 className="font-bold mb-4">
                  Dashboard Seller
                </h3>

                <div className="grid grid-cols-2 gap-4 mb-6">

                  <div className="bg-slate-800 p-4 rounded-xl">
                    <p className="text-xs text-gray-400">
                      Total Pendapatan
                    </p>
                    <p className="text-xl font-bold">
                      Rp 12.450.000
                    </p>
                  </div>

                  <div className="bg-slate-800 p-4 rounded-xl">
                    <p className="text-xs text-gray-400">
                      Pesanan Masuk
                    </p>
                    <p className="text-xl font-bold text-green-400">
                      42
                    </p>
                  </div>

                </div>


                <div className="flex items-end gap-2 h-20">

                  {[40,60,30,80,90,70].map((h,i)=>(
                    <div
                      key={i}
                      style={{height:`${h}%`}}
                      className="flex-1 bg-green-500 rounded-t"
                    />
                  ))}

                </div>

              </CardContent>
            </Card>

          </div>

        </Container>
      </section>


      {/* CARA KERJA */}

      <section id="cara" className="py-24 bg-muted/30">
        <Container>

          <div className="text-center mb-16">

            <h2 className="text-3xl font-bold">
              Bagaimana Cara Kerja Greenly Mart?
            </h2>

            <p className="text-muted-foreground">
              Mulai berjualan dengan 4 langkah mudah
            </p>

          </div>


          <div className="grid md:grid-cols-4 gap-10 text-center">

            {steps.map((step,index)=>(
              <div key={index}>

                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg">
                  {index+1}
                </div>

                <h3 className="font-semibold mb-2">
                  {step.title}
                </h3>

                <p className="text-sm text-muted-foreground">
                  {step.desc}
                </p>

              </div>
            ))}

          </div>

        </Container>
      </section>


      {/* KEUNTUNGAN */}

      <section id="keuntungan" className="py-24">
        <Container>

          <div className="text-center mb-16">

            <h2 className="text-3xl font-bold">
              Keuntungan Menjadi Mitra
            </h2>

            <p className="text-muted-foreground">
              Fitur lengkap untuk mendukung bisnis Anda
            </p>

          </div>


          <div className="grid md:grid-cols-3 gap-6">

            {benefits.map((b,index)=>(
              <Card key={index}>

                <CardContent className="p-6">

                  <div className="text-green-600 mb-4">
                    {b.icon}
                  </div>

                  <h3 className="font-semibold mb-2">
                    {b.title}
                  </h3>

                  <p className="text-sm text-muted-foreground">
                    {b.desc}
                  </p>

                </CardContent>

              </Card>
            ))}

          </div>

        </Container>
      </section>


      {/* CONTACT */}

      <section id="kontak" className="py-24 bg-green-50">
        <Container>

          <div className="grid md:grid-cols-2 gap-16">

            <div>

              <h2 className="text-3xl font-bold mb-4">
                Hubungi Kami
              </h2>

              <p className="text-muted-foreground mb-6">
                Ada pertanyaan? Tim kami siap membantu
                mengembangkan bisnis pertanian Anda.
              </p>

              <div className="space-y-3 text-sm">

                <p>
                  Email: halo@greenlymart.id
                </p>

                <p>
                  WhatsApp: +62 812 3456 7890
                </p>

                <p>
                  Surabaya, Jawa Timur
                </p>

              </div>

            </div>


            <Card>
              <CardContent className="p-6 space-y-4">

                <Input placeholder="Nama Lengkap" />

                <Input placeholder="Nomor WA" />

                <Input placeholder="Email" />

                <Textarea placeholder="Pesan Anda" />

                <Button className="w-full bg-green-600 hover:bg-green-700">
                  Kirim Pesan Sekarang
                </Button>

              </CardContent>
            </Card>

          </div>

        </Container>
      </section>


      {/* FOOTER */}

      <footer className="bg-slate-900 text-white py-10">
        <Container>

          <div className="grid md:grid-cols-3 gap-10">

            <div>
              <h3 className="font-bold text-lg mb-3">
                Greenly Mart
              </h3>

              <p className="text-sm text-gray-400">
                Marketplace untuk UMKM & petani lokal
                agar dapat menjual produk secara
                transparan dan terpercaya.
              </p>
            </div>


            <div>

              <h4 className="font-semibold mb-3">
                Navigasi
              </h4>

              <ul className="space-y-2 text-sm text-gray-400">
                <li>Beranda</li>
                <li>Cara Kerja</li>
                <li>Keuntungan</li>
                <li>Kontak</li>
              </ul>

            </div>


            <div>

              <h4 className="font-semibold mb-3">
                Layanan
              </h4>

              <ul className="space-y-2 text-sm text-gray-400">
                <li>Pendaftaran Seller</li>
                <li>Pusat Bantuan</li>
                <li>Syarat & Ketentuan</li>
              </ul>

            </div>

          </div>

          <p className="text-center text-gray-500 text-sm mt-10">
            © 2026 Greenly Mart. All rights reserved.
          </p>

        </Container>
      </footer>


    </div>
  )
}