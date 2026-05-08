import { Injectable, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import ErrorHandler from '../../../libs/errors/handler.error';
import { z } from 'zod';
import { DatabaseService } from '../../../libs/database/database.service';

const PayoutProcessedEventSchema = z.object({
  payoutId: z.string(),
  shopId: z.string(),
  status: z.enum(["COMPLETED", "FAILED"]),
  timestamp: z.string().datetime(),
  correlationId: z.string().optional(),
  source: z.literal('finance-service'),
});

type PayoutProcessedEventDTO = z.infer<typeof PayoutProcessedEventSchema>;

@Injectable()
export class PayoutEventsConsumer {
  private readonly logger = new Logger(PayoutEventsConsumer.name);

  constructor(private readonly db: DatabaseService) {}

  @EventPattern('shop.payout.processed')
  async handlePayoutProcessed(@Payload() raw: unknown) {
    try {
      const data = PayoutProcessedEventSchema.parse(raw);
      
      await ErrorHandler(async () => {
         await this.db.payout.update({
           where: { id: data.payoutId },
           data: { status: data.status },
         });

         if (data.status === "FAILED") {
            const failedPayout = await this.db.payout.findUnique({
              where: { id: data.payoutId }
            });

            if (failedPayout) {
              await this.db.$transaction([
                this.db.shopLedger.create({
                  data: {
                    shopId: data.shopId,
                    type: "CREDIT",
                    amount: failedPayout.amount,
                    reference: `payout_failed:${data.payoutId}`,
                    description: "Payout failed, refunding balance",
                  }
                }),
                this.db.shop.update({
                  where: { id: data.shopId },
                  data: { balance: { increment: failedPayout.amount } }
                })
              ]);
            }
         }
      });
      this.logger.log(`Successfully processed shop.payout.processed for payout ${data.payoutId}`);
    } catch (error) {
      this.logger.error(`Failed to process payout.processed: ${error.message}`);
      throw error;
    }
  }
}
