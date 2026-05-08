import { PrismaClient } from '../../generated/prisma/client'

export async function seedPayouts(prisma: PrismaClient, shopIds: Record<string, string>) {
  const payoutsData = [
    { shopOwnerEmail: 'toko.elektronik@gmail.com', amount: 1000000, status: 'COMPLETED' as const, paidAt: new Date('2025-02-01') },
    { shopOwnerEmail: 'toko.elektronik@gmail.com', amount: 500000, status: 'COMPLETED' as const, paidAt: new Date('2025-03-01') },
    { shopOwnerEmail: 'fashion.store@gmail.com', amount: 750000, status: 'COMPLETED' as const, paidAt: new Date('2025-02-15') },
    { shopOwnerEmail: 'fashion.store@gmail.com', amount: 300000, status: 'PROCESSING' as const, paidAt: null },
    { shopOwnerEmail: 'kuliner.nusantara@gmail.com', amount: 400000, status: 'COMPLETED' as const, paidAt: new Date('2025-03-10') },
    { shopOwnerEmail: 'kuliner.nusantara@gmail.com', amount: 200000, status: 'PENDING' as const, paidAt: null },
    { shopOwnerEmail: 'sport.gear@gmail.com', amount: 600000, status: 'COMPLETED' as const, paidAt: new Date('2025-02-20') },
    { shopOwnerEmail: 'sport.gear@gmail.com', amount: 350000, status: 'FAILED' as const, paidAt: null },
    { shopOwnerEmail: 'beauty.shop@gmail.com', amount: 900000, status: 'COMPLETED' as const, paidAt: new Date('2025-03-05') },
    { shopOwnerEmail: 'beauty.shop@gmail.com', amount: 450000, status: 'PENDING' as const, paidAt: null },
  ]

  for (const p of payoutsData) {
    const shopId = shopIds[p.shopOwnerEmail]
    if (!shopId) continue

    await prisma.payout.create({
      data: {
        shopId,
        amount: p.amount,
        status: p.status,
        paidAt: p.paidAt,
      },
    })

    await prisma.shopLedger.create({
      data: {
        shopId,
        type: 'DEBIT',
        amount: p.amount,
        reference: `PAYOUT_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        description: `Payout request - status: ${p.status}`,
      },
    })
  }

  console.log('✅ Payouts Seeded Successfully')
}
