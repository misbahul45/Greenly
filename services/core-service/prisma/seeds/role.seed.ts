// prisma/seeds/role.seed.ts
import { PrismaClient } from '../../generated/prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import * as dotenv from 'dotenv';

dotenv.config();

const adapter = new PrismaMariaDb({
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT || '3306'),
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  connectionLimit: 5,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  const roles = [
    { name: 'SUPER_ADMIN' },
    { name: 'ADMIN' },
    { name: 'FINANCE_ADMIN' },
    { name: 'SUPPORT_ADMIN' },
    { name: 'SHOP_OWNER' },
    { name: 'SHOP_MANAGER' },
    { name: 'SHOP_STAFF' },
    { name: 'CUSTOMER' },
    { name: 'SYSTEM' },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: {},
      create: role,
    });
  }

  console.log('✅ Roles seeded successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });