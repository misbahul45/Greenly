import { Module } from '@nestjs/common'
import { BannerService } from './banner.service'
import { BannerRepository } from './banner.repository'
import { BannerAdminController, BannerPublicController } from './banner.controller'

@Module({
  controllers: [BannerAdminController, BannerPublicController],
  providers: [BannerService, BannerRepository],
  exports: [BannerService],
})
export class BannerModule {}
