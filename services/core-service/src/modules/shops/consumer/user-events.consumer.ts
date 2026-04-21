import { Injectable, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { z } from 'zod';
import { ShopsService } from '../shops.service';
import ErrorHandler from '../../../libs/errors/handler.error';

const UserDeletedEventSchema = z.object({
  userId: z.string(),
  timestamp: z.string().datetime(),
  correlationId: z.string().optional(),
  source: z.string().optional(),
});

@Injectable()
export class UserEventsConsumer {
  private readonly logger = new Logger(UserEventsConsumer.name);

  constructor(private readonly shopsService: ShopsService) {}

  @EventPattern('user.deleted')
  async handleUserDeleted(@Payload() raw: unknown) {
    try {
      const data = UserDeletedEventSchema.parse(raw);
      // Future logic: identify shops owned by data.userId and initiate anonymization flow or soft deletion.
      this.logger.log(`Successfully processed user.deleted for user ${data.userId}`);
    } catch (error) {
      this.logger.error(`Failed to process user.deleted: ${error.message}`);
      throw error;
    }
  }
}
