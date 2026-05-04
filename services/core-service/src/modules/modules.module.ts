import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { IdentityModule } from './identity/identity.module';
import { ShopsModule } from './shops/shops.module';
import { CommerceModule } from './commerce/commerce.module';
import { FinanceModule } from './finance/finance.module';
import { PromotionModule } from './promotion/promotion.module';
import { NotificationModule } from './notification/notification.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { AdminModule } from './admin/admin.module';
import { EventsModule } from './events/events.module';
import { BannerModule } from './banner/banner.module';
import { CartModule } from './cart/cart.module';

@Module({
  imports: [AuthModule, IdentityModule, ShopsModule, CommerceModule, FinanceModule, PromotionModule, NotificationModule, AnalyticsModule, AdminModule, EventsModule, BannerModule, CartModule],
})
export class ModulesModule {}
