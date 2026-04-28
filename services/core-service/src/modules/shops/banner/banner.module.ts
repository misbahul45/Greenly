import { Module } from '@nestjs/common'
import { ShopBannerService } from './banner.service'
import { ShopBannerRepository } from './banner.repository'
import { ShopBannerController } from './banner.controller'
import { MemberModule } from '../member/member.module'
import { ShopMemberGuard } from '../guards/shop-member.guard'

@Module({
  imports: [MemberModule],
  controllers: [ShopBannerController],
  providers: [ShopBannerService, ShopBannerRepository, ShopMemberGuard],
  exports: [ShopBannerService],
})
export class ShopBannerModule {}
