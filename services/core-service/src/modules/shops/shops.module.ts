import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';

import { ApplicationModule } from './application/application.module';
import { MemberModule } from './member/member.module';
import { FollowerModule } from './follower/follower.module';
import { OrderModule } from './order/order.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { FinanceModule } from './finance/finance.module';

import { ShopsService } from './shops.service';
import { ShopsController } from './shops.controller';
import { ShopsRepository } from './shops.repository';

import { ShopCreatedPublisher } from './publisher/shop.created.publisher';
import { ShopApplicationVerifiedPublisher } from './publisher/shop.application.updated.publisher';
import { ShopBalanceUpdatedPublisher } from './publisher/shop.balance.updated.publisher';
import { ShopOrderStatusChangedPublisher } from './publisher/shop.order.status_changed.publisher';
import { ShopFollowerAddedPublisher } from './publisher/shop.follower.added.publisher';

import { EmailConsume } from './consumer/email.consume';
import { PaymentEventsConsumer } from './consumer/payment-events.consumer';
import { OrderEventsConsumer } from './consumer/order-events.consumer';
import { PromotionEventsConsumer } from './consumer/promotion-events.consumer';
import { UserEventsConsumer } from './consumer/user-events.consumer';
import { PayoutEventsConsumer } from './consumer/payout-events.consumer';

@Module({
  imports: [
    ApplicationModule,
    MemberModule,
    FollowerModule,
    OrderModule,
    DashboardModule,
    FinanceModule,

    RouterModule.register([
      {
        path: 'shops/:shopId',
        children: [
          { path: 'application', module: ApplicationModule },
          { path: 'members', module: MemberModule },
          { path: '', module: FollowerModule },
          { path: 'orders', module: OrderModule },
          { path: 'dashboard', module: DashboardModule },
          { path: 'finance', module: FinanceModule },
        ],
      },
    ]),
  ],

  controllers: [
    ShopsController,
  ],

  providers: [
    ShopsService,
    ShopsRepository,

    ShopCreatedPublisher,
    ShopApplicationVerifiedPublisher,
    ShopBalanceUpdatedPublisher,
    ShopOrderStatusChangedPublisher,
    ShopFollowerAddedPublisher,

    EmailConsume,
    PayoutEventsConsumer,
    PaymentEventsConsumer,
    PromotionEventsConsumer,
    UserEventsConsumer,
    OrderEventsConsumer,
  ],
})
export class ShopsModule {}