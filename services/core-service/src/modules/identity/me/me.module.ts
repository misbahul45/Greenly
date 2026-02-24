import { Module } from '@nestjs/common';
import { MeService } from './me.service';
import { MeController } from './me.controller';
import { MeRepositository } from './me.repository';

@Module({
  providers: [MeService, MeRepositository],
  controllers: [MeController]
})
export class MeModule {}
