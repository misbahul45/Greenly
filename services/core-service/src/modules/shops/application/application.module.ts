import { Module } from '@nestjs/common';
import { ApplicationService } from './application.service';
import { ApplicationController } from './application.controller';
import { ApplicationRepository } from './application.repository';
import { ShopApplicationPublisher } from '../publisher/shop.application.publisher';

@Module({
  providers: [ApplicationService, ApplicationRepository, ShopApplicationPublisher],
  controllers: [ApplicationController],
  exports:[ShopApplicationPublisher]
})
export class ApplicationModule {}
