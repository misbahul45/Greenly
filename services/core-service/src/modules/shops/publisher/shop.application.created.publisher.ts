import { Injectable } from "@nestjs/common";
import { MessaggingService } from "../../../libs/messagging/messagging.service";

@Injectable()
export class ShopApplicationCreatedPublisher{
    constructor(
        private readonly broker:MessaggingService
    ){}
}