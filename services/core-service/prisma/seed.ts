import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import 'dotenv/config'

export function createPrismaAdapter() {
  return new PrismaMariaDb({
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT || '3306'),
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    connectionLimit: 5,
  })
}

import { PrismaClient } from '../generated/prisma/client'
import { seedRbac } from './seeds/role.seed'
import { seedUsers } from './seeds/user.seed'
import { seedShops } from './seeds/shop.seed'
import { seedPromotions } from './seeds/promotion.seed'
import { seedOrders } from './seeds/order.seed'
import { seedPayouts } from './seeds/payout.seed'
import { seedLedgers } from './seeds/ledger.seed'
import { seedFollowers } from './seeds/follower.seed'
import { seedNotifications } from './seeds/notification.seed'
import { seedBanners } from './seeds/banner.seed'
import * as dotenv from 'dotenv'

dotenv.config()

const prisma = new PrismaClient({
  adapter: createPrismaAdapter(),
})

async function main() {
  await prisma.$connect()

  await seedRbac(prisma)

  const userIds = await seedUsers(prisma)

  const shopIds = await seedShops(prisma, userIds)

  const promoIds = await seedPromotions(prisma, shopIds)
  await seedOrders(prisma, userIds, shopIds)
  await seedPayouts(prisma, shopIds)
  await seedLedgers(prisma, shopIds)
  await seedFollowers(prisma, userIds, shopIds)
  await seedNotifications(prisma, userIds)
  await seedBanners(prisma, promoIds)

  console.log('🎉 All Seeds Completed Successfully')
}

main()
  .catch((e) => {
    console.error('❌ Seed Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
