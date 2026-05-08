import { PrismaClient } from '../../generated/prisma/client'

export async function seedOrders(
  prisma: PrismaClient,
  userIds: Record<string, string>,
  shopIds: Record<string, string>,
) {
  const customerEmails = [
    'budi.santoso@gmail.com',
    'siti.rahayu@gmail.com',
    'agus.wijaya@gmail.com',
    'dewi.lestari@gmail.com',
    'rizky.pratama@gmail.com',
    'maya.putri@gmail.com',
    'hendra.kurniawan@gmail.com',
    'rina.susanti@gmail.com',
    'doni.firmansyah@gmail.com',
    'lisa.anggraini@gmail.com',
  ]

  const shopOwnerEmails = Object.keys(shopIds)

  const ordersData = [
    {
      customerEmail: 'budi.santoso@gmail.com',
      shopOwnerEmail: 'toko.elektronik@gmail.com',
      shopName: 'Toko Elektronik Jaya',
      items: [
        { productId: 'prod-001', productName: 'Headphone Bluetooth', price: 350000, quantity: 1 },
        { productId: 'prod-002', productName: 'Charger USB-C 65W', price: 150000, quantity: 2 },
      ],
      totalAmount: 650000,
      status: 'COMPLETED' as const,
      paymentStatus: 'SUCCESS' as const,
      paymentMethod: 'bank_transfer',
    },
    {
      customerEmail: 'siti.rahayu@gmail.com',
      shopOwnerEmail: 'fashion.store@gmail.com',
      shopName: 'Fashion Store Bandung',
      items: [
        { productId: 'prod-010', productName: 'Dress Batik Modern', price: 280000, quantity: 1 },
        { productId: 'prod-011', productName: 'Hijab Sifon Premium', price: 85000, quantity: 2 },
      ],
      totalAmount: 450000,
      status: 'SHIPPED' as const,
      paymentStatus: 'SUCCESS' as const,
      paymentMethod: 'gopay',
    },
    {
      customerEmail: 'agus.wijaya@gmail.com',
      shopOwnerEmail: 'kuliner.nusantara@gmail.com',
      shopName: 'Kuliner Nusantara',
      items: [
        { productId: 'prod-020', productName: 'Rendang Daging 500gr', price: 120000, quantity: 2 },
        { productId: 'prod-021', productName: 'Sambal Matah Bali', price: 45000, quantity: 3 },
      ],
      totalAmount: 375000,
      status: 'PROCESSING' as const,
      paymentStatus: 'SUCCESS' as const,
      paymentMethod: 'ovo',
    },
    {
      customerEmail: 'dewi.lestari@gmail.com',
      shopOwnerEmail: 'sport.gear@gmail.com',
      shopName: 'Sport Gear Indonesia',
      items: [
        { productId: 'prod-030', productName: 'Sepatu Running Nike', price: 850000, quantity: 1 },
        { productId: 'prod-031', productName: 'Kaos Olahraga Dri-Fit', price: 175000, quantity: 2 },
      ],
      totalAmount: 1200000,
      status: 'PAID' as const,
      paymentStatus: 'SUCCESS' as const,
      paymentMethod: 'credit_card',
    },
    {
      customerEmail: 'rizky.pratama@gmail.com',
      shopOwnerEmail: 'beauty.shop@gmail.com',
      shopName: 'Beauty & Skincare Shop',
      items: [
        { productId: 'prod-040', productName: 'Serum Vitamin C 30ml', price: 220000, quantity: 1 },
        { productId: 'prod-041', productName: 'Sunscreen SPF 50', price: 180000, quantity: 1 },
        { productId: 'prod-042', productName: 'Moisturizer Hyaluronic', price: 250000, quantity: 1 },
      ],
      totalAmount: 650000,
      status: 'COMPLETED' as const,
      paymentStatus: 'SUCCESS' as const,
      paymentMethod: 'dana',
    },
    {
      customerEmail: 'maya.putri@gmail.com',
      shopOwnerEmail: 'toko.elektronik@gmail.com',
      shopName: 'Toko Elektronik Jaya',
      items: [
        { productId: 'prod-003', productName: 'Smart Watch Series 5', price: 1200000, quantity: 1 },
      ],
      totalAmount: 1200000,
      status: 'PENDING' as const,
      paymentStatus: 'PENDING' as const,
      paymentMethod: 'bank_transfer',
    },
    {
      customerEmail: 'hendra.kurniawan@gmail.com',
      shopOwnerEmail: 'fashion.store@gmail.com',
      shopName: 'Fashion Store Bandung',
      items: [
        { productId: 'prod-012', productName: 'Kemeja Flanel Pria', price: 195000, quantity: 2 },
        { productId: 'prod-013', productName: 'Celana Chino Slim', price: 275000, quantity: 1 },
      ],
      totalAmount: 665000,
      status: 'CANCELLED' as const,
      paymentStatus: 'FAILED' as const,
      paymentMethod: 'gopay',
    },
    {
      customerEmail: 'rina.susanti@gmail.com',
      shopOwnerEmail: 'kuliner.nusantara@gmail.com',
      shopName: 'Kuliner Nusantara',
      items: [
        { productId: 'prod-022', productName: 'Kopi Arabika Gayo 250gr', price: 95000, quantity: 3 },
        { productId: 'prod-023', productName: 'Teh Pucuk Harum 1kg', price: 65000, quantity: 2 },
      ],
      totalAmount: 415000,
      status: 'COMPLETED' as const,
      paymentStatus: 'SUCCESS' as const,
      paymentMethod: 'ovo',
    },
    {
      customerEmail: 'doni.firmansyah@gmail.com',
      shopOwnerEmail: 'sport.gear@gmail.com',
      shopName: 'Sport Gear Indonesia',
      items: [
        { productId: 'prod-032', productName: 'Raket Badminton Yonex', price: 650000, quantity: 1 },
        { productId: 'prod-033', productName: 'Shuttlecock Mavis 350', price: 85000, quantity: 2 },
      ],
      totalAmount: 820000,
      status: 'SHIPPED' as const,
      paymentStatus: 'SUCCESS' as const,
      paymentMethod: 'credit_card',
    },
    {
      customerEmail: 'lisa.anggraini@gmail.com',
      shopOwnerEmail: 'beauty.shop@gmail.com',
      shopName: 'Beauty & Skincare Shop',
      items: [
        { productId: 'prod-043', productName: 'Lipstik Matte Wardah', price: 75000, quantity: 3 },
        { productId: 'prod-044', productName: 'Foundation Cushion', price: 320000, quantity: 1 },
      ],
      totalAmount: 545000,
      status: 'PROCESSING' as const,
      paymentStatus: 'SUCCESS' as const,
      paymentMethod: 'dana',
    },
  ]

  for (const o of ordersData) {
    const userId = userIds[o.customerEmail]
    const shopId = shopIds[o.shopOwnerEmail]
    if (!userId || !shopId) continue

    const order = await prisma.order.create({
      data: {
        userId,
        shopId,
        shopName: o.shopName,
        totalAmount: o.totalAmount,
        status: o.status,
        items: {
          create: o.items.map((item) => ({
            productId: item.productId,
            productName: item.productName,
            price: item.price,
            quantity: item.quantity,
          })),
        },
      },
    })

    const grossAmount = o.totalAmount
    const marketplaceFee = grossAmount * 0.02
    const gatewayFee = grossAmount * 0.01
    const netAmount = grossAmount - marketplaceFee - gatewayFee

    const payment = await prisma.payment.create({
      data: {
        orderId: order.id,
        grossAmount,
        gatewayFee,
        marketplaceFee,
        netAmount,
        method: o.paymentMethod,
        status: o.paymentStatus,
        transactionId: o.paymentStatus === 'SUCCESS' ? `TXN-${order.id.slice(-8).toUpperCase()}` : null,
        paidAt: o.paymentStatus === 'SUCCESS' ? new Date() : null,
      },
    })

    if (o.paymentStatus === 'SUCCESS') {
      await prisma.shopLedger.create({
        data: {
          shopId,
          type: 'CREDIT',
          amount: netAmount,
          reference: `PAYMENT_${payment.id}`,
          description: `Payment for order ${order.id}`,
        },
      })
    }
  }

  console.log('✅ Orders Seeded Successfully')
}
