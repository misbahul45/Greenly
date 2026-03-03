import { Injectable } from "@nestjs/common";
import { MessaggingService } from "../../../libs/messagging/messagging.service";

@Injectable()
export class ShopApplicationUpdatedPublisher{
    constructor(
        private readonly broker:MessaggingService
    ){}
}