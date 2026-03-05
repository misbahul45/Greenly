import { Injectable } from "@nestjs/common";
import { MessaggingService } from "../../../libs/messagging/messagging.service";

@Injectable()
export class ShopUpdatedPublisher{
    constructor(
        private readonly broker:MessaggingService
    ){}
}