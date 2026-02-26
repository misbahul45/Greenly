import { Injectable } from "@nestjs/common";
import { MessaggingService } from "../../../libs/messagging/messagging.service";
import { PayloadEmail } from "../types/event";

@Injectable()
export class UserForgotPasswordPublisher {
  constructor(
    private readonly broker: MessaggingService
  ) {}

  async publishEmail(payload: PayloadEmail) {
    await this.broker.publish(
      'auth.user.password.reset.requested',
      payload
    );
  }
}