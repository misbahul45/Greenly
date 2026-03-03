import { Module } from '@nestjs/common';
import { ApplicationService } from './application.service';
import { ApplicationController } from './application.controller';
import { ApplicationRepository } from './application.repository';

@Module({
  providers: [ApplicationService, ApplicationRepository],
  controllers: [ApplicationController]
})
export class ApplicationModule {}
