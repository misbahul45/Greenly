import { Injectable } from "@nestjs/common";
import { RabbitMqEventBusService } from "../../../../infrastructure/messaging/rabbitmq-event-bus.service";
import { PayloadEmail } from "../../../../common/types/event";

@Injectable()
export class DeletedUserPublisher {
  constructor(
    private readonly eventBus: RabbitMqEventBusService
  ) {}

  async publishEmail(
    payload:PayloadEmail
  ){
    await this.eventBus.publish('auth.user.deleted', payload)
  }
}
