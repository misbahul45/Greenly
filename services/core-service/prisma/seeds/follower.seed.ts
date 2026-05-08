import { PrismaClient } from '../../generated/prisma/client'

export async function seedFollowers(
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

  const followData: Array<{ customerEmail: string; shopOwnerEmail: string }> = [
    { customerEmail: 'budi.santoso@gmail.com', shopOwnerEmail: 'toko.elektronik@gmail.com' },
    { customerEmail: 'budi.santoso@gmail.com', shopOwnerEmail: 'sport.gear@gmail.com' },
    { customerEmail: 'siti.rahayu@gmail.com', shopOwnerEmail: 'fashion.store@gmail.com' },
    { customerEmail: 'siti.rahayu@gmail.com', shopOwnerEmail: 'beauty.shop@gmail.com' },
    { customerEmail: 'agus.wijaya@gmail.com', shopOwnerEmail: 'kuliner.nusantara@gmail.com' },
    { customerEmail: 'agus.wijaya@gmail.com', shopOwnerEmail: 'toko.elektronik@gmail.com' },
    { customerEmail: 'dewi.lestari@gmail.com', shopOwnerEmail: 'beauty.shop@gmail.com' },
    { customerEmail: 'dewi.lestari@gmail.com', shopOwnerEmail: 'fashion.store@gmail.com' },
    { customerEmail: 'rizky.pratama@gmail.com', shopOwnerEmail: 'sport.gear@gmail.com' },
    { customerEmail: 'rizky.pratama@gmail.com', shopOwnerEmail: 'toko.elektronik@gmail.com' },
    { customerEmail: 'maya.putri@gmail.com', shopOwnerEmail: 'beauty.shop@gmail.com' },
    { customerEmail: 'maya.putri@gmail.com', shopOwnerEmail: 'kuliner.nusantara@gmail.com' },
    { customerEmail: 'hendra.kurniawan@gmail.com', shopOwnerEmail: 'fashion.store@gmail.com' },
    { customerEmail: 'hendra.kurniawan@gmail.com', shopOwnerEmail: 'sport.gear@gmail.com' },
    { customerEmail: 'rina.susanti@gmail.com', shopOwnerEmail: 'kuliner.nusantara@gmail.com' },
    { customerEmail: 'rina.susanti@gmail.com', shopOwnerEmail: 'beauty.shop@gmail.com' },
    { customerEmail: 'doni.firmansyah@gmail.com', shopOwnerEmail: 'sport.gear@gmail.com' },
    { customerEmail: 'doni.firmansyah@gmail.com', shopOwnerEmail: 'toko.elektronik@gmail.com' },
    { customerEmail: 'lisa.anggraini@gmail.com', shopOwnerEmail: 'beauty.shop@gmail.com' },
    { customerEmail: 'lisa.anggraini@gmail.com', shopOwnerEmail: 'fashion.store@gmail.com' },
  ]

  for (const f of followData) {
    const userId = userIds[f.customerEmail]
    const shopId = shopIds[f.shopOwnerEmail]
    if (!userId || !shopId) continue

    const existing = await prisma.shopFollower.findUnique({
      where: { userId_shopId: { userId, shopId } },
    })

    if (!existing) {
      await prisma.shopFollower.create({ data: { userId, shopId } })
    }
  }

  console.log('✅ Followers Seeded Successfully')
}
