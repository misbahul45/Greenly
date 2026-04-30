import { PrismaClient } from '../../generated/prisma/client'

export async function seedBanners(prisma: PrismaClient, promoIds: string[]) {
  const future = new Date('2026-12-31T23:59:59Z')
  const past = new Date('2025-01-01T00:00:00Z')

  const platformBanners = [
    {
      title: 'Harbolnas 12.12 - Diskon Besar-Besaran',
      description: 'Belanja sekarang dan hemat hingga 25% untuk semua kategori produk',
      imageUrl: 'https://source.unsplash.com/1600x600/?sale,shopping',
      promotionId: promoIds[9] ?? null,
      isActive: true,
      position: 1,
      startDate: past,
      endDate: future,
      type: 'PROMO' as const,
    },
    {
      title: 'Welcome Offer - Diskon 10% Pembelian Pertama',
      description: 'Daftar sekarang dan nikmati diskon 10% untuk order pertamamu',
      imageUrl: 'https://source.unsplash.com/1600x600/?online-shopping,ecommerce',
      promotionId: promoIds[0] ?? null,
      isActive: true,
      position: 2,
      startDate: past,
      endDate: future,
      type: 'HOME' as const,
    },
    {
      title: 'Flash Sale Setiap Hari - Hemat 20%',
      description: 'Jangan lewatkan flash sale harian dengan diskon hingga 20%',
      imageUrl: 'https://source.unsplash.com/1600x600/?flash-sale,discount',
      promotionId: promoIds[2] ?? null,
      isActive: true,
      position: 3,
      startDate: past,
      endDate: future,
      type: 'PROMO' as const,
    },
    {
      title: 'Gratis Ongkir Ke Seluruh Indonesia',
      description: 'Nikmati gratis ongkir untuk setiap pembelian di atas Rp 75.000',
      imageUrl: 'https://source.unsplash.com/1600x600/?delivery,shipping',
      promotionId: promoIds[3] ?? null,
      isActive: true,
      position: 4,
      startDate: past,
      endDate: future,
      type: 'HOME' as const,
    },
    {
      title: 'Event Ramadan - Promo Spesial Lebaran',
      description: 'Rayakan lebaran dengan belanja hemat bersama Greenly',
      imageUrl: 'https://source.unsplash.com/1600x600/?ramadan,mosque',
      promotionId: promoIds[4] ?? null,
      isActive: true,
      position: 5,
      startDate: past,
      endDate: future,
      type: 'EVENT' as const,
    },
    {
      title: 'Cashback Rp 100.000 Transaksi di Atas 500K',
      description: 'Belanja lebih dari Rp 500.000 dan dapatkan cashback Rp 100.000',
      imageUrl: 'https://source.unsplash.com/1600x600/?cashback,money',
      promotionId: promoIds[6] ?? null,
      isActive: true,
      position: 6,
      startDate: past,
      endDate: future,
      type: 'PROMO' as const,
    },
    {
      title: 'Weekend Sale - Diskon 5% Setiap Sabtu & Minggu',
      description: 'Manfaatkan akhir pekan untuk belanja lebih hemat',
      imageUrl: 'https://source.unsplash.com/1600x600/?weekend,shopping',
      promotionId: promoIds[7] ?? null,
      isActive: true,
      position: 7,
      startDate: past,
      endDate: future,
      type: 'HOME' as const,
    },
    {
      title: 'New User Special - Diskon 30% untuk Pengguna Baru',
      description: 'Khusus pengguna baru, dapatkan diskon 30% untuk order pertama',
      imageUrl: 'https://source.unsplash.com/1600x600/?new-user,app',
      promotionId: promoIds[5] ?? null,
      isActive: true,
      position: 8,
      startDate: past,
      endDate: future,
      type: 'HOME' as const,
    },
    {
      title: 'Event Kemerdekaan 17 Agustus',
      description: 'Rayakan HUT RI dengan promo spesial dari Greenly',
      imageUrl: 'https://source.unsplash.com/1600x600/?indonesia,flag',
      promotionId: null,
      isActive: false,
      position: 9,
      startDate: new Date('2025-08-01'),
      endDate: new Date('2025-08-31'),
      type: 'EVENT' as const,
    },
    {
      title: 'Hemat Langsung Rp 50.000',
      description: 'Potongan harga langsung Rp 50.000 untuk pembelian di atas Rp 200.000',
      imageUrl: 'https://source.unsplash.com/1600x600/?discount,shopping',
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
      title: 'Promo Toko Elektronik - Gadget Terbaru 2025',
      description: 'Temukan gadget terbaru dengan harga terbaik',
      imageUrl: 'https://source.unsplash.com/1600x600/?electronics,gadget',
      isActive: true,
      position: 1,
      startDate: past,
      endDate: future,
      type: 'HOME' as const,
    },
    {
      title: 'Koleksi Fashion Terbaru - Summer 2025',
      description: 'Update wardrobe kamu dengan koleksi terbaru dari Fashion Store',
      imageUrl: 'https://source.unsplash.com/1600x600/?fashion,clothing',
      isActive: true,
      position: 1,
      startDate: past,
      endDate: future,
      type: 'HOME' as const,
    },
    {
      title: 'Kuliner Nusantara - Cita Rasa Asli Indonesia',
      description: 'Pesan makanan khas nusantara langsung dari dapur kami',
      imageUrl: 'https://source.unsplash.com/1600x600/?indonesian-food',
      isActive: true,
      position: 1,
      startDate: past,
      endDate: future,
      type: 'HOME' as const,
    },
    {
      title: 'Sport Gear - Perlengkapan Olahraga Lengkap',
      description: 'Semua kebutuhan olahraga tersedia di sini',
      imageUrl: 'https://source.unsplash.com/1600x600/?sports,fitness',
      isActive: true,
      position: 1,
      startDate: past,
      endDate: future,
      type: 'HOME' as const,
    },
    {
      title: 'Beauty Shop - Skincare Terpercaya',
      description: 'Produk kecantikan original dan terjamin kualitasnya',
      imageUrl: 'https://source.unsplash.com/1600x600/?skincare,beauty',
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