import { Controller, Get } from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';

@Controller('health')
export class HealthController {
  @Public()
  @Get()
  health() {
    return {
      data: {
        status: 'ok',
        service: 'core-service',
      },
      message: 'OK',
    };
  }
}
