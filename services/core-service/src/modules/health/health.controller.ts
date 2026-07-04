import { Controller, Get, Inject } from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';
import { DatabaseService } from '../../libs/database/database.service';

@Controller('health')
export class HealthController {
  constructor(
    @Inject(DatabaseService) private readonly db: DatabaseService,
  ) {}

  @Public()
  @Get()
  async health() {
    let dbConnected = false;
    try {
      await this.db.$queryRawUnsafe('SELECT 1');
      dbConnected = true;
    } catch {
      dbConnected = false;
    }

    return {
      data: {
        status: dbConnected ? 'ok' : 'degraded',
        service: 'core-service',
        database: dbConnected ? 'connected' : 'disconnected',
      },
      message: dbConnected ? 'OK' : 'Database unavailable',
    };
  }
}
