import { Module } from '@nestjs/common';
import { MeService } from './me.service';
import { MeController } from './me.controller';

@Module({
  providers: [MeService],
  controllers: [MeController]
})
export class MeModule {}
