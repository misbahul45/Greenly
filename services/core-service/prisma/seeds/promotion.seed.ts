import { PrismaClient } from '../../generated/prisma/client'

export async function seedPromotions(
  prisma: PrismaClient,
  shopIds: Record<string, string>,
) {
  const future = new Date('2026-12-31T23:59:59Z')
  const past = new Date('2025-01-01T00:00:00Z')

  const promotions = [
    {
      code: 'ECOLIVING10',
      name: 'Eco Living Welcome 10%',
      description: 'Diskon 10% untuk pembelian pertama produk eco-friendly',
      discountVal: 10,
      type: 'PERCENTAGE' as const,
      minPurchaseAmount: 50000,
      maxDiscountAmount: 25000,
      usageLimit: 1000,
      userLimit: 1,
      startDate: past,
      endDate: future,
      isActive: true,
    },
    {
      code: 'HEMAT50K',
      name: 'Hemat 50 Ribu Eco',
      description: 'Potongan langsung Rp 50.000 untuk produk organik',
      discountVal: 50000,
      type: 'FIXED' as const,
      minPurchaseAmount: 200000,
      maxDiscountAmount: null,
      usageLimit: 500,
      userLimit: 1,
      startDate: past,
      endDate: future,
      isActive: true,
    },
    {
      code: 'ZEROWASTE20',
      name: 'Zero Waste Flash Sale 20%',
      description: 'Diskon 20% flash sale untuk produk zero waste',
      discountVal: 20,
      type: 'PERCENTAGE' as const,
      minPurchaseAmount: 100000,
      maxDiscountAmount: 75000,
      usageLimit: 200,
      userLimit: 1,
      startDate: past,
      endDate: future,
      isActive: true,
    },
    {
      code: 'ONGKIRECO25K',
      name: 'Gratis Ongkir Eco 25K',
      description: 'Subsidi ongkir Rp 25.000 untuk produk ramah lingkungan',
      discountVal: 25000,
      type: 'FIXED' as const,
      minPurchaseAmount: 75000,
      maxDiscountAmount: null,
      usageLimit: 300,
      userLimit: 2,
      startDate: past,
      endDate: future,
      isActive: true,
    },
    {
      code: 'EARTHDAY15',
      name: 'Earth Day 15%',
      description: 'Diskon spesial 15% peringatan Hari Bumi',
      discountVal: 15,
      type: 'PERCENTAGE' as const,
      minPurchaseAmount: 150000,
      maxDiscountAmount: 100000,
      usageLimit: 1000,
      userLimit: 1,
      startDate: past,
      endDate: future,
      isActive: true,
    },
    {
      code: 'NEWGREENIE30',
      name: 'New Greenie 30%',
      description: 'Diskon 30% khusus pengguna baru Greenly',
      discountVal: 30,
      type: 'PERCENTAGE' as const,
      minPurchaseAmount: 100000,
      maxDiscountAmount: 150000,
      usageLimit: 500,
      userLimit: 1,
      startDate: past,
      endDate: future,
      isActive: true,
    },
    {
      code: 'CASHBACK100K',
      name: 'Cashback Eco 100K',
      description: 'Cashback Rp 100.000 untuk transaksi eco di atas 500K',
      discountVal: 100000,
      type: 'FIXED' as const,
      minPurchaseAmount: 500000,
      maxDiscountAmount: null,
      usageLimit: 100,
      userLimit: 1,
      startDate: past,
      endDate: future,
      isActive: true,
    },
    {
      code: 'WEEKEND5',
      name: 'Weekend Eco Sale 5%',
      description: 'Diskon 5% setiap akhir pekan untuk semua produk hijau',
      discountVal: 5,
      type: 'PERCENTAGE' as const,
      minPurchaseAmount: 50000,
      maxDiscountAmount: 20000,
      usageLimit: 2000,
      userLimit: 3,
      startDate: past,
      endDate: future,
      isActive: true,
    },
    {
      code: 'EXPIRED10',
      name: 'Promo Lama (Tidak Aktif)',
      description: 'Promo yang sudah tidak aktif',
      discountVal: 10,
      type: 'PERCENTAGE' as const,
      minPurchaseAmount: null,
      maxDiscountAmount: null,
      usageLimit: 100,
      userLimit: 1,
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-06-30'),
      isActive: false,
    },
    {
      code: 'ECOFEST25',
      name: 'Greenly Eco Fest 25%',
      description: 'Diskon besar festival eco-friendly Greenly',
      discountVal: 25,
      type: 'PERCENTAGE' as const,
      minPurchaseAmount: 200000,
      maxDiscountAmount: 200000,
      usageLimit: 5000,
      userLimit: 1,
      startDate: past,
      endDate: future,
      isActive: true,
    },
  ]

  const shopIdList = Object.values(shopIds)
  const createdPromoIds: string[] = []

  for (const p of promotions) {
    const promo = await prisma.promotion.upsert({
      where: {
        code: p.code,
      },
      update: {
        name: p.name,
        description: p.description,
        discountVal: p.discountVal,
        type: p.type,
        minPurchaseAmount: p.minPurchaseAmount ?? null,
        maxDiscountAmount: p.maxDiscountAmount ?? null,
        usageLimit: p.usageLimit ?? null,
        userLimit: p.userLimit ?? 1,
        startDate: p.startDate,
        endDate: p.endDate,
        isActive: p.isActive,
      },
      create: {
        code: p.code,
        name: p.name,
        description: p.description,
        discountVal: p.discountVal,
        type: p.type,
        minPurchaseAmount: p.minPurchaseAmount ?? null,
        maxDiscountAmount: p.maxDiscountAmount ?? null,
        usageLimit: p.usageLimit ?? null,
        userLimit: p.userLimit ?? 1,
        startDate: p.startDate,
        endDate: p.endDate,
        isActive: p.isActive,
        usedCount: 0,
      },
    })

    createdPromoIds.push(promo.id)

    if (p.isActive && shopIdList.length > 0) {
      for (const shopId of shopIdList.slice(0, 2)) {
        await prisma.promotionShop.upsert({
          where: {
            promotionId_shopId: {
              promotionId: promo.id,
              shopId,
            },
          },
          update: {},
          create: {
            promotionId: promo.id,
            shopId,
          },
        })
      }
    }
  }

  console.log('✅ Promotions Seeded Successfully')
  return createdPromoIds
}
