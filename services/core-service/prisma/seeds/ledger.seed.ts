import { PrismaClient } from '../../generated/prisma/client'

export async function seedLedgers(prisma: PrismaClient, shopIds: Record<string, string>) {
  const ledgerData: Array<{
    shopOwnerEmail: string
    entries: Array<{ type: 'CREDIT' | 'DEBIT'; amount: number; reference: string; description: string }>
  }> = [
    {
      shopOwnerEmail: 'toko.elektronik@gmail.com',
      entries: [
        { type: 'CREDIT', amount: 637000, reference: 'PAYMENT_TXN001', description: 'Payment for order ORD-001' },
        { type: 'CREDIT', amount: 1176000, reference: 'PAYMENT_TXN002', description: 'Payment for order ORD-002' },
        { type: 'DEBIT', amount: 500000, reference: 'PAYOUT_REQ001', description: 'Payout request approved' },
        { type: 'CREDIT', amount: 441000, reference: 'PAYMENT_TXN003', description: 'Payment for order ORD-003' },
      ],
    },
    {
      shopOwnerEmail: 'fashion.store@gmail.com',
      entries: [
        { type: 'CREDIT', amount: 441000, reference: 'PAYMENT_TXN010', description: 'Payment for order ORD-010' },
        { type: 'CREDIT', amount: 651700, reference: 'PAYMENT_TXN011', description: 'Payment for order ORD-011' },
        { type: 'DEBIT', amount: 300000, reference: 'PAYOUT_REQ002', description: 'Payout request processing' },
        { type: 'CREDIT', amount: 534050, reference: 'PAYMENT_TXN012', description: 'Payment for order ORD-012' },
      ],
    },
    {
      shopOwnerEmail: 'kuliner.nusantara@gmail.com',
      entries: [
        { type: 'CREDIT', amount: 367500, reference: 'PAYMENT_TXN020', description: 'Payment for order ORD-020' },
        { type: 'CREDIT', amount: 406700, reference: 'PAYMENT_TXN021', description: 'Payment for order ORD-021' },
        { type: 'DEBIT', amount: 200000, reference: 'PAYOUT_REQ003', description: 'Payout request pending' },
        { type: 'CREDIT', amount: 294000, reference: 'PAYMENT_TXN022', description: 'Payment for order ORD-022' },
      ],
    },
    {
      shopOwnerEmail: 'sport.gear@gmail.com',
      entries: [
        { type: 'CREDIT', amount: 1176000, reference: 'PAYMENT_TXN030', description: 'Payment for order ORD-030' },
        { type: 'CREDIT', amount: 803600, reference: 'PAYMENT_TXN031', description: 'Payment for order ORD-031' },
        { type: 'DEBIT', amount: 600000, reference: 'PAYOUT_REQ004', description: 'Payout request completed' },
        { type: 'CREDIT', amount: 539000, reference: 'PAYMENT_TXN032', description: 'Payment for order ORD-032' },
      ],
    },
    {
      shopOwnerEmail: 'beauty.shop@gmail.com',
      entries: [
        { type: 'CREDIT', amount: 637000, reference: 'PAYMENT_TXN040', description: 'Payment for order ORD-040' },
        { type: 'CREDIT', amount: 534050, reference: 'PAYMENT_TXN041', description: 'Payment for order ORD-041' },
        { type: 'DEBIT', amount: 450000, reference: 'PAYOUT_REQ005', description: 'Payout request pending' },
        { type: 'CREDIT', amount: 882000, reference: 'PAYMENT_TXN042', description: 'Payment for order ORD-042' },
      ],
    },
  ]

  for (const shop of ledgerData) {
    const shopId = shopIds[shop.shopOwnerEmail]
    if (!shopId) continue

    for (const entry of shop.entries) {
      await prisma.shopLedger.create({
        data: {
          shopId,
          type: entry.type,
          amount: entry.amount,
          reference: entry.reference,
          description: entry.description,
        },
      })
    }
  }

  console.log('✅ Ledgers Seeded Successfully')
}
