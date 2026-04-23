import { PrismaClient } from '@prisma/client/extension'
import bcrypt from 'bcryptjs'

export async function seedRbac(prisma: PrismaClient) {
  const roles = [
    'SUPER_ADMIN',
    'ADMIN',
    'FINANCE_ADMIN',
    'SUPPORT_ADMIN',
    'SYSTEM',
    'CUSTOMER'
  ]

  const permissions = [
    'user.read',
    'user.update',
    'user.suspend',
    'user.delete',
    'shop.read',
    'shop.approve',
    'shop.suspend',
    'shop.delete',
    'order.read',
    'order.force_cancel',
    'payment.read',
    'payment.refund',
    'payout.read',
    'payout.process',
    'system.manage',
  ]

  for (const name of permissions) {
    await prisma.permission.upsert({
      where: { name },
      update: {},
      create: { name },
    })
  }

  for (const name of roles) {
    await prisma.role.upsert({
      where: { name },
      update: {},
      create: { name },
    })
  }

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

  const users = [
    {
      email: 'rani@gmail.com',
      password: 'rani12345',
      fullName: 'Rani',
      role: 'SUPER_ADMIN'
    },
    {
      email: 'nesa@gmail.com',
      password: 'nesa12345',
      fullName: 'Nesa',
      role: 'ADMIN'
    },
    {
      email: 'misbahulmuttaqin395@gmail.com',
      password: 'takin123',
      fullName: 'Misbahul Muttaqin',
      role: 'CUSTOMER'
    },
  ]

  for (const u of users) {
    const hashedPassword = await bcrypt.hash(u.password, 10)

    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {
        emailVerified: new Date(),
        status: 'ACTIVE',
        isActive: true,
      },
      create: {
        email: u.email,
        passwordHash: hashedPassword,
        status: 'ACTIVE',
        emailVerified: new Date(),
        isActive: true,
      },
    })

    await prisma.userProfile.upsert({
      where: { userId: user.id },
      update: {
        fullName: u.fullName,
      },
      create: {
        userId: user.id,
        fullName: u.fullName,
        phone: '',
        address: '',
      },
    })

    const role = await prisma.role.findUnique({
      where: { name: u.role }
    })

    if (role) {
      await prisma.userRole.upsert({
        where: {
          userId_roleId: {
            userId: user.id,
            roleId: role.id
          }
        },
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
          set: [],
          connect: perms.map((name) => ({ name })),
        },
      },
    })
  }

  console.log('✅ RBAC Seeded Successfully')
}