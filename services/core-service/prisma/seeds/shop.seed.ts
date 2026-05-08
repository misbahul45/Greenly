import { PrismaClient } from '../../generated/prisma/client'

export async function seedShops(prisma: PrismaClient, userIds: Record<string, string>) {
  const shopsData = [
    {
      ownerEmail: 'toko.elektronik@gmail.com',
      name: 'Toko Elektronik Jaya',
      description: 'Menjual berbagai produk elektronik berkualitas tinggi',
      status: 'APPROVED' as const,
      balance: 5000000,
      followerCount: 120,
      application: {
        idCardUrl: 'https://imagekit.io/idcard/toko-elektronik.jpg',
        selfieUrl: 'https://imagekit.io/selfie/toko-elektronik.jpg',
        nib: '1234567890123',
        npwp: '12.345.678.9-012.000',
        bankName: 'BCA',
        bankAccount: '1234567890',
        accountName: 'Ahmad Fauzi',
        status: 'APPROVED' as const,
        reviewedAt: new Date('2024-01-15'),
      },
    },
    {
      ownerEmail: 'fashion.store@gmail.com',
      name: 'Fashion Store Bandung',
      description: 'Koleksi fashion terkini untuk pria dan wanita',
      status: 'APPROVED' as const,
      balance: 3200000,
      followerCount: 85,
      application: {
        idCardUrl: 'https://imagekit.io/idcard/fashion-store.jpg',
        selfieUrl: 'https://imagekit.io/selfie/fashion-store.jpg',
        nib: '2345678901234',
        npwp: '23.456.789.0-123.000',
        bankName: 'Mandiri',
        bankAccount: '2345678901',
        accountName: 'Sari Dewi',
        status: 'APPROVED' as const,
        reviewedAt: new Date('2024-02-10'),
      },
    },
    {
      ownerEmail: 'kuliner.nusantara@gmail.com',
      name: 'Kuliner Nusantara',
      description: 'Aneka makanan dan minuman khas nusantara',
      status: 'APPROVED' as const,
      balance: 1800000,
      followerCount: 200,
      application: {
        idCardUrl: 'https://imagekit.io/idcard/kuliner-nusantara.jpg',
        selfieUrl: 'https://imagekit.io/selfie/kuliner-nusantara.jpg',
        nib: '3456789012345',
        npwp: '34.567.890.1-234.000',
        bankName: 'BNI',
        bankAccount: '3456789012',
        accountName: 'Bambang Sutrisno',
        status: 'APPROVED' as const,
        reviewedAt: new Date('2024-03-05'),
      },
    },
    {
      ownerEmail: 'sport.gear@gmail.com',
      name: 'Sport Gear Indonesia',
      description: 'Perlengkapan olahraga lengkap dan berkualitas',
      status: 'APPROVED' as const,
      balance: 2500000,
      followerCount: 60,
      application: {
        idCardUrl: 'https://imagekit.io/idcard/sport-gear.jpg',
        selfieUrl: 'https://imagekit.io/selfie/sport-gear.jpg',
        nib: '4567890123456',
        npwp: '45.678.901.2-345.000',
        bankName: 'BRI',
        bankAccount: '4567890123',
        accountName: 'Indra Gunawan',
        status: 'APPROVED' as const,
        reviewedAt: new Date('2024-03-20'),
      },
    },
    {
      ownerEmail: 'beauty.shop@gmail.com',
      name: 'Beauty & Skincare Shop',
      description: 'Produk kecantikan dan perawatan kulit terpercaya',
      status: 'APPROVED' as const,
      balance: 4100000,
      followerCount: 310,
      application: {
        idCardUrl: 'https://imagekit.io/idcard/beauty-shop.jpg',
        selfieUrl: 'https://imagekit.io/selfie/beauty-shop.jpg',
        nib: '5678901234567',
        npwp: '56.789.012.3-456.000',
        bankName: 'CIMB',
        bankAccount: '5678901234',
        accountName: 'Putri Handayani',
        status: 'APPROVED' as const,
        reviewedAt: new Date('2024-04-01'),
      },
    },
  ]

  const createdShops: Record<string, string> = {}

  for (const s of shopsData) {
    const ownerId = userIds[s.ownerEmail]
    if (!ownerId) continue

    const existing = await prisma.shop.findFirst({ where: { ownerId, name: s.name } })

    let shop
    if (existing) {
      shop = await prisma.shop.update({
        where: { id: existing.id },
        data: { status: s.status, balance: s.balance, followerCount: s.followerCount },
      })
    } else {
      shop = await prisma.shop.create({
        data: {
          ownerId,
          name: s.name,
          description: s.description,
          status: s.status,
          balance: s.balance,
          followerCount: s.followerCount,
        },
      })
    }

    await prisma.shopApplication.upsert({
      where: { shopId: shop.id },
      update: { status: s.application.status, reviewedAt: s.application.reviewedAt },
      create: {
        shopId: shop.id,
        idCardUrl: s.application.idCardUrl,
        selfieUrl: s.application.selfieUrl,
        nib: s.application.nib,
        npwp: s.application.npwp,
        bankName: s.application.bankName,
        bankAccount: s.application.bankAccount,
        accountName: s.application.accountName,
        status: s.application.status,
        reviewedAt: s.application.reviewedAt,
      },
    })

    await prisma.shopMember.upsert({
      where: { shopId_userId: { shopId: shop.id, userId: ownerId } },
      update: {},
      create: { shopId: shop.id, userId: ownerId, role: 'OWNER' },
    })

    createdShops[s.ownerEmail] = shop.id
  }

  console.log('✅ Shops Seeded Successfully')
  return createdShops
}
