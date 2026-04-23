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
import * as dotenv from 'dotenv'

dotenv.config()

const prisma = new PrismaClient({
  adapter: createPrismaAdapter(),
})

async function main() {
  await prisma.$connect()
  await seedRbac(prisma)
}

main()
  .catch((e) => {
    console.error('❌ Seed Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })