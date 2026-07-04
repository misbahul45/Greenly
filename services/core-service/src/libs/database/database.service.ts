import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '../../../generated/prisma/client';
import * as dotenv from 'dotenv';
dotenv.config();

@Injectable()
export class DatabaseService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(DatabaseService.name);

  constructor() {
    // ===============================
    // Managed Cloud (Railway MySQL)
    // Configurable via env vars
    // ===============================
    const connectionLimit = parseInt(process.env.DATABASE_CONNECTION_LIMIT || '10', 10);
    const connectTimeout = parseInt(process.env.DATABASE_CONNECT_TIMEOUT || '20000', 10);

    const adapter = new PrismaMariaDb({
      host: process.env.DATABASE_HOST,
      port: parseInt(process.env.DATABASE_PORT || '3306'),
      user: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      connectionLimit,
      connectTimeout,
      // Railway's public proxy can be reached without SSL by default.
      // Uncomment below only if Railway enforces TLS on your plan.
      // ssl: { rejectUnauthorized: false },
    });

    super({ adapter });
  }

  async onModuleInit() {
    this.logger.log(
      JSON.stringify({
        serviceName: 'core-service',
        event: 'database_connect_start',
        host: process.env.DATABASE_HOST,
        port: process.env.DATABASE_PORT || '3306',
        database: process.env.DATABASE_NAME,
      }),
    );
    await this.$connect();
    this.logger.log(
      JSON.stringify({
        serviceName: 'core-service',
        event: 'database_connect_success',
        host: process.env.DATABASE_HOST,
        port: process.env.DATABASE_PORT || '3306',
        database: process.env.DATABASE_NAME,
      }),
    );
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}