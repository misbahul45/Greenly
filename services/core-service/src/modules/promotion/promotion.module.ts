import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../libs/database/database.module';
import { PromotionService } from './promotion.service';
import { PromotionRepository } from './promotion.repository';
import { PromotionAdminController, PromotionPublicController } from './promotion.controller';
import { PromotionCreatedPublisher } from './publishers/promotion-created.publisher';
import { PromotionUsedPublisher } from './publishers/promotion-used.publisher';
import { PromotionExpiredPublisher } from './publishers/promotion-expired.publisher';
import { DiscountCalculator } from './validators/discount-calculator';
import { EligibilityChecker } from './validators/eligibility-checker';
import { PromotionAdminGuard } from './guards/promotion-admin.guard';

@Module({
  imports: [DatabaseModule],
  controllers: [PromotionAdminController, PromotionPublicController],
  providers: [
    PromotionService,
    PromotionRepository,
    PromotionCreatedPublisher,
    PromotionUsedPublisher,
    PromotionExpiredPublisher,
    DiscountCalculator,
    EligibilityChecker,
    PromotionAdminGuard,
  ],
  exports: [PromotionService, PromotionRepository, EligibilityChecker],
})
export class PromotionModule {}
