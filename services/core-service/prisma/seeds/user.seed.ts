import { PrismaClient } from '../../generated/prisma/client'
import bcrypt from 'bcryptjs'

export async function seedUsers(prisma: PrismaClient) {
  const adminUsers = [
    { email: 'rani@gmail.com', password: 'rani12345', fullName: 'Rani', phone: '081200000001', address: 'Jakarta', role: 'SUPER_ADMIN' },
    { email: 'nesa@gmail.com', password: 'nesa12345', fullName: 'Nesa', phone: '081200000002', address: 'Jakarta', role: 'ADMIN' },
    { email: 'misbahulmuttaqin395@gmail.com', password: 'takin123', fullName: 'Misbahul Muttaqin', phone: '081298765432', address: 'Jl. Kapasari No. 21, Surabaya', role: 'SUPER_ADMIN' },
  ]

  const customers = [
    { email: 'budi.santoso@gmail.com', password: 'budi12345', fullName: 'Budi Santoso', phone: '081234567890', address: 'Jl. Merdeka No. 1, Jakarta' },
    { email: 'siti.rahayu@gmail.com', password: 'siti12345', fullName: 'Siti Rahayu', phone: '082345678901', address: 'Jl. Sudirman No. 5, Bandung' },
    { email: 'agus.wijaya@gmail.com', password: 'agus12345', fullName: 'Agus Wijaya', phone: '083456789012', address: 'Jl. Diponegoro No. 10, Surabaya' },
    { email: 'dewi.lestari@gmail.com', password: 'dewi12345', fullName: 'Dewi Lestari', phone: '084567890123', address: 'Jl. Gatot Subroto No. 3, Medan' },
    { email: 'rizky.pratama@gmail.com', password: 'rizky12345', fullName: 'Rizky Pratama', phone: '085678901234', address: 'Jl. Ahmad Yani No. 7, Yogyakarta' },
    { email: 'maya.putri@gmail.com', password: 'maya12345', fullName: 'Maya Putri', phone: '086789012345', address: 'Jl. Pahlawan No. 12, Semarang' },
    { email: 'hendra.kurniawan@gmail.com', password: 'hendra12345', fullName: 'Hendra Kurniawan', phone: '087890123456', address: 'Jl. Veteran No. 8, Makassar' },
    { email: 'rina.susanti@gmail.com', password: 'rina12345', fullName: 'Rina Susanti', phone: '088901234567', address: 'Jl. Imam Bonjol No. 15, Palembang' },
    { email: 'doni.firmansyah@gmail.com', password: 'doni12345', fullName: 'Doni Firmansyah', phone: '089012345678', address: 'Jl. Kartini No. 4, Denpasar' },
    { email: 'lisa.anggraini@gmail.com', password: 'lisa12345', fullName: 'Lisa Anggraini', phone: '081123456789', address: 'Jl. Pemuda No. 9, Balikpapan' },
    { email: 'misbahulmu756@gmail.com', password: 'takin123', fullName: 'Misbahul Muttaqin', phone: '081298765432', address: 'Jl. Kapasari No. 21, Surabaya', },
  ]

  const shopOwners = [
    { email: 'toko.elektronik@gmail.com', password: 'toko12345', fullName: 'Ahmad Fauzi', phone: '081234500001', address: 'Jl. Elektronik No. 1, Jakarta' },
    { email: 'fashion.store@gmail.com', password: 'fashion12345', fullName: 'Sari Dewi', phone: '081234500002', address: 'Jl. Mode No. 2, Bandung' },
    { email: 'kuliner.nusantara@gmail.com', password: 'kuliner12345', fullName: 'Bambang Sutrisno', phone: '081234500003', address: 'Jl. Kuliner No. 3, Surabaya' },
    { email: 'sport.gear@gmail.com', password: 'sport12345', fullName: 'Indra Gunawan', phone: '081234500004', address: 'Jl. Olahraga No. 4, Yogyakarta' },
    { email: 'beauty.shop@gmail.com', password: 'beauty12345', fullName: 'Putri Handayani', phone: '081234500005', address: 'Jl. Kecantikan No. 5, Semarang' },
  ]

  const createdUsers: Record<string, string> = {}

  for (const u of adminUsers) {
    const hashedPassword = await bcrypt.hash(u.password, 10)

    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: { passwordHash: hashedPassword, emailVerified: new Date(), status: 'ACTIVE', isActive: true },
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

    const role = await prisma.role.findUnique({ where: { name: u.role } })
    if (role) {
      await prisma.userRole.upsert({
        where: { userId_roleId: { userId: user.id, roleId: role.id } },
        update: {},
        create: { userId: user.id, roleId: role.id },
      })
    }

    createdUsers[u.email] = user.id
  }

  const customerRole = await prisma.role.findUnique({ where: { name: 'CUSTOMER' } })

  for (const u of [...customers, ...shopOwners]) {
    const hashedPassword = await bcrypt.hash(u.password, 10)

    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: { passwordHash: hashedPassword, emailVerified: new Date(), status: 'ACTIVE', isActive: true },
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

    if (customerRole) {
      await prisma.userRole.upsert({
        where: { userId_roleId: { userId: user.id, roleId: customerRole.id } },
        update: {},
        create: { userId: user.id, roleId: customerRole.id },
      })
    }

    createdUsers[u.email] = user.id
  }

  console.log('✅ Users Seeded Successfully')
  return createdUsers
}
