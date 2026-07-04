import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import 'dotenv/config'

export function createPrismaAdapter() {
  return new PrismaMariaDb({
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT || '3306'),
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    connectionLimit: parseInt(process.env.DATABASE_CONNECTION_LIMIT || '5', 10),
    connectTimeout: parseInt(process.env.DATABASE_CONNECT_TIMEOUT || '20000', 10),
    allowPublicKeyRetrieval: true,
  })
}