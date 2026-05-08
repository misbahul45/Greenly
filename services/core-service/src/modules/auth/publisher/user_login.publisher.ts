import { Injectable } from '@nestjs/common';
import { MessaggingService } from '../../../libs/messagging/messagging.service';

@Injectable()
export class UserLoginPublisher {
  constructor(private readonly broker: MessaggingService) {}

  async publishML() {}
}