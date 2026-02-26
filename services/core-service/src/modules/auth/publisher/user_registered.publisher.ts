import { Injectable } from "@nestjs/common";
import { MessaggingService } from "../../../libs/messagging/messagging.service";
import { PayloadEmail } from "../types/event";

@Injectable()
export class UserRegisteredPublisher{
    constructor(
        private readonly brocker:MessaggingService
    ){}

    async publishEmail(payload:PayloadEmail){
        await this.brocker.publish(
            'auth.user.registered',
            payload
        )
    }

}