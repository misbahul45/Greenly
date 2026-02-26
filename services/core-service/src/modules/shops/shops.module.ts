import { Module } from '@nestjs/common';
import { ApplicationModule } from './application/application.module';
import { MemberModule } from './member/member.module';
import { FollowerModule } from './follower/follower.module';
import { OrderModule } from './order/order.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { FinanceModule } from './finance/finance.module';

@Module({
  imports: [ApplicationModule, MemberModule, FollowerModule, OrderModule, DashboardModule, FinanceModule],
})
export class ShopsModule {}
