import { PrismaClient } from '../../generated/prisma/client'

export async function seedBanners(prisma: PrismaClient, promoIds: string[]) {
  const future = new Date('2026-12-31T23:59:59Z')
  const past = new Date('2025-01-01T00:00:00Z')

  const platformBanners = [
    {
      title: 'Greenly Eco Fest — Hemat Hingga 25% untuk Produk Hijau',
      description: 'Perayaan gaya hidup berkelanjutan dengan diskon besar untuk semua produk eco-certified',
      imageUrl: 'https://source.unsplash.com/1600x600/?sustainable,eco-lifestyle',
      promotionId: promoIds[9] ?? null,
      isActive: true,
      position: 1,
      startDate: past,
      endDate: future,
      type: 'PROMO' as const,
    },
    {
      title: 'Selamat Datang di Greenly — Diskon 10% Pembelian Pertama',
      description: 'Mulai perjalanan eco-living kamu dengan diskon 10% untuk order pertama',
      imageUrl: 'https://source.unsplash.com/1600x600/?green,nature-shopping',
      promotionId: promoIds[0] ?? null,
      isActive: true,
      position: 2,
      startDate: past,
      endDate: future,
      type: 'HOME' as const,
    },
    {
      title: 'Flash Sale Zero Waste — Diskon 20% Produk Pilihan',
      description: 'Jangan lewatkan flash sale harian untuk produk zero waste terpilih',
      imageUrl: 'https://source.unsplash.com/1600x600/?zero-waste,reusable',
      promotionId: promoIds[2] ?? null,
      isActive: true,
      position: 3,
      startDate: past,
      endDate: future,
      type: 'PROMO' as const,
    },
    {
      title: 'Gratis Ongkir untuk Order di Atas Rp 75.000',
      description: 'Belanja produk eco-friendly lebih hemat dengan gratis ongkir ke seluruh Indonesia',
      imageUrl: 'https://source.unsplash.com/1600x600/?delivery,green-package',
      promotionId: promoIds[3] ?? null,
      isActive: true,
      position: 4,
      startDate: past,
      endDate: future,
      type: 'HOME' as const,
    },
    {
      title: 'Earth Day Every Day — Promo Spesial Produk Organik',
      description: 'Rayakan komitmen terhadap bumi dengan promo spesial produk organik bersertifikat',
      imageUrl: 'https://source.unsplash.com/1600x600/?earth-day,organic',
      promotionId: promoIds[4] ?? null,
      isActive: true,
      position: 5,
      startDate: past,
      endDate: future,
      type: 'EVENT' as const,
    },
    {
      title: 'Cashback Rp 100.000 untuk Transaksi di Atas 500K',
      description: 'Belanja produk eco lebih dari Rp 500.000 dan dapatkan cashback Rp 100.000',
      imageUrl: 'https://source.unsplash.com/1600x600/?cashback,savings-green',
      promotionId: promoIds[6] ?? null,
      isActive: true,
      position: 6,
      startDate: past,
      endDate: future,
      type: 'PROMO' as const,
    },
    {
      title: 'Weekend Eco Sale — Diskon 5% Setiap Sabtu & Minggu',
      description: 'Manfaatkan akhir pekan untuk belanja produk hijau lebih hemat',
      imageUrl: 'https://source.unsplash.com/1600x600/?weekend,sustainable-living',
      promotionId: promoIds[7] ?? null,
      isActive: true,
      position: 7,
      startDate: past,
      endDate: future,
      type: 'HOME' as const,
    },
    {
      title: 'Pengguna Baru — Diskon 30% untuk Order Pertama',
      description: 'Khusus pengguna baru Greenly, mulai eco-living dengan diskon 30% order pertama',
      imageUrl: 'https://source.unsplash.com/1600x600/?new-user,green-app',
      promotionId: promoIds[5] ?? null,
      isActive: true,
      position: 8,
      startDate: past,
      endDate: future,
      type: 'HOME' as const,
    },
    {
      title: 'Hari Lingkungan Hidup — Promo Spesial 5 Juni',
      description: 'Peringati Hari Lingkungan Hidup Sedunia dengan promo eco produk pilihan',
      imageUrl: 'https://source.unsplash.com/1600x600/?environment-day,green-earth',
      promotionId: null,
      isActive: true,
      position: 9,
      startDate: new Date('2026-06-01'),
      endDate: new Date('2026-06-07'),
      type: 'EVENT' as const,
    },
    {
      title: 'Potongan Langsung Rp 50.000 untuk Produk Organik',
      description: 'Pembelian produk organik di atas Rp 200.000 langsung hemat Rp 50.000',
      imageUrl: 'https://source.unsplash.com/1600x600/?organic-food,natural-products',
      promotionId: promoIds[1] ?? null,
      isActive: true,
      position: 10,
      startDate: past,
      endDate: future,
      type: 'PROMO' as const,
    },
  ]

  for (const b of platformBanners) {
    const existing = await prisma.banner.findFirst({ where: { title: b.title, deletedAt: null } })
    if (existing) continue

    await prisma.banner.create({
      data: {
        title: b.title,
        description: b.description,
        imageUrl: b.imageUrl,
        promotionId: b.promotionId,
        isActive: b.isActive,
        position: b.position,
        startDate: b.startDate,
        endDate: b.endDate,
        type: b.type,
      },
    })
  }

  const shopBanners = [
    {
      title: 'EcoWare Indonesia — Zero Waste Lifestyle Starts Here',
      description: 'Temukan produk daur ulang terbaik: botol stainless, tumbler bambu, tas kanvas organik',
      imageUrl: 'https://source.unsplash.com/1600x600/?zero-waste,reusable-bottle',
      isActive: true,
      position: 1,
      startDate: past,
      endDate: future,
      type: 'HOME' as const,
    },
    {
      title: 'Bumi Hijau Fashion — Tampil Stylish, Jaga Bumi',
      description: 'Koleksi fashion sustainable terbaru: kaos GOTS, celana linen, jaket hemp organik',
      imageUrl: 'https://source.unsplash.com/1600x600/?sustainable-fashion,organic-clothing',
      isActive: true,
      position: 1,
      startDate: past,
      endDate: future,
      type: 'HOME' as const,
    },
    {
      title: 'Organik Nusantara — Dari Alam untuk Kesehatan',
      description: 'Produk pangan organik bersertifikat langsung dari petani lokal Indonesia',
      imageUrl: 'https://source.unsplash.com/1600x600/?organic-food,farm-to-table',
      isActive: true,
      position: 1,
      startDate: past,
      endDate: future,
      type: 'HOME' as const,
    },
    {
      title: 'Pure Nature Beauty — Cantik Alami, Ramah Bumi',
      description: 'Skincare dan perawatan diri dari bahan alami organik murni bersertifikat',
      imageUrl: 'https://source.unsplash.com/1600x600/?natural-skincare,organic-beauty',
      isActive: true,
      position: 1,
      startDate: past,
      endDate: future,
      type: 'HOME' as const,
    },
    {
      title: 'Green Tech Solutions — Teknologi untuk Masa Depan',
      description: 'Panel surya portable dan solusi hemat energi untuk rumah dan outdoor',
      imageUrl: 'https://source.unsplash.com/1600x600/?solar-panel,green-technology',
      isActive: true,
      position: 1,
      startDate: past,
      endDate: future,
      type: 'HOME' as const,
    },
  ]

  for (const b of shopBanners) {
    const existing = await prisma.banner.findFirst({ where: { title: b.title, deletedAt: null } })
    if (existing) continue

    await prisma.banner.create({
      data: {
        title: b.title,
        description: b.description,
        imageUrl: b.imageUrl,
        isActive: b.isActive,
        position: b.position,
        startDate: b.startDate,
        endDate: b.endDate,
        type: b.type,
      },
    })
  }

  console.log('✅ Banners Seeded Successfully')
}
