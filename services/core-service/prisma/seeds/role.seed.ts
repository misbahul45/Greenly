// prisma/seeds/rbac.seed.ts

import { PrismaClient } from '../../generated/prisma/client'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import * as dotenv from 'dotenv'
import bcrypt from 'bcryptjs'

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
   | 1️⃣ GLOBAL SYSTEM ROLES (Marketplace Level Only)
   |--------------------------------------------------------------------------
   */

  const roles = [
    'SUPER_ADMIN',
    'ADMIN',
    'FINANCE_ADMIN',
    'SUPPORT_ADMIN',
    'SYSTEM',
    'CUSTOMER'
  ]

  /*
   |--------------------------------------------------------------------------
   | 2️⃣ PERMISSIONS (SYSTEM LEVEL)
   |--------------------------------------------------------------------------
   */

  const permissions = [
    // user management
    'user.read',
    'user.update',
    'user.suspend',
    'user.delete',

    // shop approval
    'shop.read',
    'shop.approve',
    'shop.suspend',
    'shop.delete',

    // order monitoring
    'order.read',
    'order.force_cancel',

    // payment & finance
    'payment.read',
    'payment.refund',
    'payout.read',
    'payout.process',

    // system
    'system.manage',
  ]

  /*
   |--------------------------------------------------------------------------
   | 3️⃣ CREATE PERMISSIONS
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
   | 4️⃣ CREATE ROLES
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
   | 5️⃣ ROLE → PERMISSION MAP (SYSTEM LEVEL)
   |--------------------------------------------------------------------------
   */

  const rolePermissionsMap: Record<string, string[]> = {
    SUPER_ADMIN: permissions,

    ADMIN: [
      'user.read',
      'user.update',
      'shop.read',
      'shop.approve',
      'order.read',
      'payment.read',
    ],

    FINANCE_ADMIN: [
      'payment.read',
      'payment.refund',
      'payout.read',
      'payout.process',
      'order.read',
    ],

    SUPPORT_ADMIN: [
      'user.read',
      'order.read',
      'order.force_cancel',
    ],

    SYSTEM: ['system.manage'],
    CUSTOMER: [],
  }

  /*
   |--------------------------------------------------------------------------
   | 6️⃣ ATTACH PERMISSIONS TO ROLES
   |--------------------------------------------------------------------------
   */

     const users = [
    { email: 'rani@gmail.com', password: 'rani12345', fullName: 'Rani', role: 'SUPER_ADMIN' },
    { email: 'nesa@gmail.com', password: 'nesa12345', fullName: 'Nesa', role: 'ADMIN' },
  ]

  for (const u of users) {
    // Hash password
    const hashedPassword = await bcrypt.hash(u.password, 10)

    // Upsert user
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        email: u.email,
        passwordHash: hashedPassword,
        status: 'ACTIVE',
        emailVerified:new Date()
      },
    })

    // Create user profile
    await prisma.userProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        fullName: u.fullName,
        phone: '',
        address: '',
      },
    })

    // Assign role
    const role = await prisma.role.findUnique({ where: { name: u.role } })
    if (role) {
      await prisma.userRole.upsert({
        where: { userId_roleId: { userId: user.id, roleId: role.id } }, // ✅ gunakan compound key
        update: {},
        create: {
          userId: user.id,
          roleId: role.id,
        },
      })
    }
  }

  for (const [roleName, perms] of Object.entries(rolePermissionsMap)) {
    const role = await prisma.role.findUnique({
      where: { name: roleName },
    })

    if (!role) continue

    await prisma.role.update({
      where: { id: role.id },
      data: {
        permissions: {
          set: [], // reset dulu supaya idempotent
          connect: perms.map((name) => ({ name })),
        },
      },
    })
  }

  console.log('✅ Global Roles & Permissions seeded successfully')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })