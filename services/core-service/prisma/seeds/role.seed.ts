import { PrismaClient } from '../../generated/prisma/client'
import bcrypt from 'bcryptjs'

export async function seedRbac(prisma: PrismaClient) {
  // ============================================================
  // PERMISSIONS
  // Dipetakan dari semua controller + guard yang ada:
  //
  // [users.controller]     @Roles('ADMIN','SUPER_ADMIN')
  // [roles.controller]     @Roles('ADMIN','SUPER_ADMIN')
  // [application.controller] @Roles('SUPER_ADMIN')
  // [order.controller]     @Roles('SELLER'), @Roles('ADMIN')
  // [finance.controller]   @RequireFinanceAccess('PLATFORM_ADMIN')
  // [payment.controller]   @RequireFinanceAccess('PLATFORM_ADMIN')
  // [payout.controller]    @RequireFinanceAccess('SHOP_OWNER','PLATFORM_ADMIN')
  // [ledger.controller]    @RequireFinanceAccess('PLATFORM_ADMIN','SHOP_OWNER')
  // [refund.controller]    @RequireFinanceAccess('SHOP_OWNER','PLATFORM_ADMIN')
  // [promotion.controller] @UseGuards(PromotionAdminGuard) -> cek role 'PLATFORM_ADMIN'
  // [shop member guard]    MinRole: OWNER > ADMIN > STAFF (hierarchy)
  // [finance-admin.guard]  cek role 'PLATFORM_ADMIN' di DB
  // [shop-ownership.guard] cek role 'PLATFORM_ADMIN' atau ShopMember OWNER/FINANCE_ADMIN
  // ============================================================

  const permissions = [
    // --- User Management ---
    'user.read',
    'user.create',
    'user.update',
    'user.suspend',
    'user.delete',

    // --- Role Management ---
    'role.read',
    'role.create',
    'role.update',
    'role.delete',
    'role.permission.attach',
    'role.permission.replace',

    // --- Shop Management (platform level) ---
    'shop.read',
    'shop.approve',
    'shop.suspend',
    'shop.delete',

    // --- Shop Application ---
    'shop.application.review',
    'shop.application.read',
    'shop.application.list',

    // --- Order (platform/admin level) ---
    'order.read',
    'order.force_cancel',
    'order.refund.create',

    // --- Finance: Payment ---
    'payment.read',
    'payment.status.update',

    // --- Finance: Payout ---
    'payout.read',
    'payout.request',
    'payout.approve',
    'payout.reject',

    // --- Finance: Ledger ---
    'ledger.read',

    // --- Finance: Refund ---
    'refund.read',
    'refund.create',
    'refund.approve',
    'refund.reject',
    'refund.force_approve',

    // --- Finance: Overview ---
    'finance.overview',

    // --- Promotion (PLATFORM_ADMIN guard) ---
    'promotion.create',
    'promotion.read',
    'promotion.update',
    'promotion.delete',

    // --- Shop-level (ShopMemberGuard: OWNER/ADMIN/STAFF) ---
    'shop.member.add',
    'shop.member.read',
    'shop.member.update',
    'shop.member.delete',
    'shop.order.read',
    'shop.order.status.update',
    'shop.order.refund.update',
    'shop.dashboard.summary',
    'shop.dashboard.revenue',
    'shop.finance.balance',
    'shop.finance.ledger',
    'shop.finance.payout.request',
    'shop.finance.payout.read',

    // --- Customer / General ---
    'cart.read',
    'cart.item.add',
    'cart.item.update',
    'cart.item.delete',
    'cart.clear',
    'order.my.read',
    'me.read',
    'me.update',
    'shop.follow',
    'shop.unfollow',
    'shop.followers.read',
    'promotion.validate',

    // --- System ---
    'system.manage',
  ]

  for (const name of permissions) {
    await prisma.permission.upsert({
      where: { name },
      update: {},
      create: { name },
    })
  }

  // ============================================================
  // ROLES
  //
  // SUPER_ADMIN    - pemilik platform, akses penuh semua
  // ADMIN          - admin operasional, kelola user/shop/order
  // FINANCE_ADMIN  - akses semua finance platform (PLATFORM_ADMIN guard)
  // SUPPORT_ADMIN  - support, bisa baca order & force cancel
  // PLATFORM_ADMIN - role khusus yang dicek oleh FinanceAdminGuard,
  //                  PromotionAdminGuard, ShopOwnershipGuard
  //                  (dipakai sebagai role name di DB query guard)
  // SELLER         - pemilik/member toko, dicek @Roles('SELLER') di order
  // CUSTOMER       - user biasa, akses cart/order/me/follow
  // SYSTEM         - internal service
  // ============================================================

  const roles = [
    'SUPER_ADMIN',
    'ADMIN',
    'FINANCE_ADMIN',
    'SUPPORT_ADMIN',
    'PLATFORM_ADMIN',
    'SELLER',
    'CUSTOMER',
    'SYSTEM',
  ]

  for (const name of roles) {
    await prisma.role.upsert({
      where: { name },
      update: {},
      create: { name },
    })
  }

  // ============================================================
  // ROLE → PERMISSION MAPPING
  //
  // SUPER_ADMIN    : semua permission
  // ADMIN          : user mgmt + role mgmt + shop mgmt + order read + shop application
  // FINANCE_ADMIN  : semua finance platform (payment, payout, ledger, refund, overview)
  //                  + promotion CRUD (karena PromotionAdminGuard cek PLATFORM_ADMIN,
  //                    dan FINANCE_ADMIN juga dapat PLATFORM_ADMIN role)
  // PLATFORM_ADMIN : role yang dicek guard secara langsung di DB
  //                  (finance overview, payment, payout admin, refund admin, promotion)
  // SUPPORT_ADMIN  : baca order, force cancel, baca user
  // SELLER         : shop-level ops (order, dashboard, finance shop, member)
  // CUSTOMER       : cart, order pribadi, me, follow shop, validate promo
  // SYSTEM         : system.manage
  // ============================================================

  const rolePermissionsMap: Record<string, string[]> = {
    SUPER_ADMIN: permissions,

    ADMIN: [
      'user.read',
      'user.create',
      'user.update',
      'user.suspend',
      'role.read',
      'role.create',
      'role.update',
      'role.delete',
      'role.permission.attach',
      'role.permission.replace',
      'shop.read',
      'shop.approve',
      'shop.suspend',
      'shop.delete',
      'shop.application.review',
      'shop.application.read',
      'shop.application.list',
      'order.read',
      'order.force_cancel',
      'payment.read',
      'payout.read',
      'ledger.read',
      'refund.read',
    ],

    FINANCE_ADMIN: [
      'payment.read',
      'payment.status.update',
      'payout.read',
      'payout.approve',
      'payout.reject',
      'ledger.read',
      'refund.read',
      'refund.create',
      'refund.approve',
      'refund.reject',
      'refund.force_approve',
      'finance.overview',
      'order.read',
      'promotion.create',
      'promotion.read',
      'promotion.update',
      'promotion.delete',
    ],

    PLATFORM_ADMIN: [
      'payment.read',
      'payment.status.update',
      'payout.read',
      'payout.approve',
      'payout.reject',
      'ledger.read',
      'refund.read',
      'refund.create',
      'refund.approve',
      'refund.reject',
      'refund.force_approve',
      'finance.overview',
      'promotion.create',
      'promotion.read',
      'promotion.update',
      'promotion.delete',
      'order.read',
    ],

    SUPPORT_ADMIN: [
      'user.read',
      'order.read',
      'order.force_cancel',
      'refund.read',
      'payment.read',
      'payout.read',
    ],

    SELLER: [
      'shop.order.read',
      'shop.order.status.update',
      'shop.order.refund.update',
      'shop.dashboard.summary',
      'shop.dashboard.revenue',
      'shop.finance.balance',
      'shop.finance.ledger',
      'shop.finance.payout.request',
      'shop.finance.payout.read',
      'shop.member.add',
      'shop.member.read',
      'shop.member.update',
      'shop.member.delete',
      'order.read',
      'payout.request',
      'ledger.read',
      'refund.read',
      'refund.create',
    ],

    CUSTOMER: [
      'cart.read',
      'cart.item.add',
      'cart.item.update',
      'cart.item.delete',
      'cart.clear',
      'order.my.read',
      'me.read',
      'me.update',
      'shop.follow',
      'shop.unfollow',
      'shop.followers.read',
      'promotion.validate',
      'promotion.read',
    ],

    SYSTEM: [
      'system.manage',
    ],
  }

  for (const [roleName, perms] of Object.entries(rolePermissionsMap)) {
    const role = await prisma.role.findUnique({ where: { name: roleName } })
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

  // ============================================================
  // SEED USERS (admin & pemilik startup)
  // ============================================================

  const adminUsers = [
    {
      email: 'rani@gmail.com',
      password: 'rani12345',
      fullName: 'Rani',
      phone: '081200000001',
      address: 'Jakarta',
      roles: ['SUPER_ADMIN', 'PLATFORM_ADMIN'],
    },
    {
      email: 'nesa@gmail.com',
      password: 'nesa12345',
      fullName: 'Nesa',
      phone: '081200000002',
      address: 'Jakarta',
      roles: ['ADMIN'],
    },
    {
      email: 'misbahulmuttaqin395@gmail.com',
      password: 'takin123',
      fullName: 'Misbahul Muttaqin',
      phone: '081298765432',
      address: 'Jl. Kapasari No. 21, Surabaya',
      roles: ['SUPER_ADMIN', 'PLATFORM_ADMIN'],
    },
  ]

  for (const u of adminUsers) {
    const hashedPassword = await bcrypt.hash(u.password, 10)

    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {
        passwordHash: hashedPassword,
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
      update: { fullName: u.fullName, phone: u.phone, address: u.address },
      create: { userId: user.id, fullName: u.fullName, phone: u.phone, address: u.address },
    })

    await prisma.cart.upsert({
      where: { userId: user.id },
      update: {},
      create: { userId: user.id },
    })

    for (const roleName of u.roles) {
      const role = await prisma.role.findUnique({ where: { name: roleName } })
      if (!role) continue

      await prisma.userRole.upsert({
        where: { userId_roleId: { userId: user.id, roleId: role.id } },
        update: {},
        create: { userId: user.id, roleId: role.id },
      })
    }
  }

  console.log('✅ RBAC Seeded Successfully')
}
