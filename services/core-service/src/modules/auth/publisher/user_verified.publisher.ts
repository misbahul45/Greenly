import { Injectable } from "@nestjs/common";
import { MessaggingService } from "../../../libs/messagging/messagging.service";
import { PayloadEmail } from "../../../common/types/event";

@Injectable()
export class UserVerifiedPublisher {
  constructor(
    private readonly broker: MessaggingService
  ) {}

  async publishNotification() {}
  async publishML() {}
}