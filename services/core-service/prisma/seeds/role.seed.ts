// prisma/seeds/rbac.seed.ts

import { PrismaClient } from '../../generated/prisma/client'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import * as dotenv from 'dotenv'

dotenv.config()

const adapter = new PrismaMariaDb({
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT || '3306'),
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  connectionLimit: 5,
})

const prisma = new PrismaClient({ adapter })

async function main() {
  /*
   |--------------------------------------------------------------------------
   | 1. DEFINE ROLES
   |--------------------------------------------------------------------------
   */

  const roles = [
    'SUPER_ADMIN',
    'ADMIN',
    'FINANCE_ADMIN',
    'SUPPORT_ADMIN',
    'SHOP_OWNER',
    'SHOP_MANAGER',
    'SHOP_STAFF',
    'CUSTOMER',
    'SYSTEM',
  ]

  /*
   |--------------------------------------------------------------------------
   | 2. DEFINE PERMISSIONS
   |--------------------------------------------------------------------------
   */

  const permissions = [
    'user.create',
    'user.read',
    'user.update',
    'user.delete',

    'shop.create',
    'shop.read',
    'shop.update',
    'shop.delete',

    'order.create',
    'order.read',
    'order.update',
    'order.cancel',

    'payment.read',
    'payment.refund',

    'system.manage',
  ]

  /*
   |--------------------------------------------------------------------------
   | 3. CREATE PERMISSIONS
   |--------------------------------------------------------------------------
   */

  for (const name of permissions) {
    await prisma.permission.upsert({
      where: { name },
      update: {},
      create: { name },
    })
  }

  /*
   |--------------------------------------------------------------------------
   | 4. CREATE ROLES
   |--------------------------------------------------------------------------
   */

  for (const name of roles) {
    await prisma.role.upsert({
      where: { name },
      update: {},
      create: { name },
    })
  }

  /*
   |--------------------------------------------------------------------------
   | 5. ROLE → PERMISSION MAP
   |--------------------------------------------------------------------------
   */

  const rolePermissionsMap: Record<string, string[]> = {
    SUPER_ADMIN: permissions,

    ADMIN: [
      'user.create',
      'user.read',
      'user.update',
      'shop.read',
      'order.read',
      'payment.read',
    ],

    FINANCE_ADMIN: [
      'payment.read',
      'payment.refund',
      'order.read',
    ],

    SUPPORT_ADMIN: [
      'user.read',
      'order.read',
      'order.update',
    ],

    SHOP_OWNER: [
      'shop.create',
      'shop.read',
      'shop.update',
      'order.read',
      'order.update',
    ],

    SHOP_MANAGER: [
      'shop.read',
      'shop.update',
      'order.read',
      'order.update',
    ],

    SHOP_STAFF: [
      'order.read',
      'order.update',
    ],

    CUSTOMER: [
      'order.create',
      'order.read',
      'order.cancel',
    ],

    SYSTEM: ['system.manage'],
  }

  /*
   |--------------------------------------------------------------------------
   | 6. ATTACH PERMISSIONS TO ROLES
   |--------------------------------------------------------------------------
   */

  for (const [roleName, perms] of Object.entries(rolePermissionsMap)) {
    const role = await prisma.role.findUnique({
      where: { name: roleName },
    })

    if (!role) continue

    await prisma.role.update({
      where: { id: role.id },
      data: {
        permissions: {
          connect: perms.map((name) => ({ name })),
        },
      },
    })
  }

  console.log('✅ Roles & Permissions seeded successfully')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })