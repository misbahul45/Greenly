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
    const adapter = new PrismaMariaDb({
      host: process.env.DATABASE_HOST,
      port: parseInt(process.env.DATABASE_PORT || '3306'),
      user: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      connectionLimit: 5,
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
      })
    );
    await this.$connect();
    this.logger.log(
      JSON.stringify({
        serviceName: 'core-service',
        event: 'database_connect_success',
        host: process.env.DATABASE_HOST,
        port: process.env.DATABASE_PORT || '3306',
        database: process.env.DATABASE_NAME,
      })
    );
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
