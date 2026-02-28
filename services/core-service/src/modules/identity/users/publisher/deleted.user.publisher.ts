import { Injectable } from "@nestjs/common";
import { MessaggingService } from "../../../../libs/messagging/messagging.service";
import { PayloadEmail } from "../../../../common/types/event";

@Injectable()
export class DeletedUserPublisher {
  constructor(
    private readonly broker: MessaggingService
  ) {}

  async publishEmail(
    payload:PayloadEmail
  ){
    await this.broker.publish('auth.user.deleted', payload)
  }
}