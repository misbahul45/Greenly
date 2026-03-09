import { Injectable } from "@nestjs/common";
import { MessaggingService } from "../../../libs/messagging/messagging.service";

@Injectable()
export class ShopApplicationVerifiedPublisher{
    constructor(
        private readonly broker:MessaggingService
    ){}
}