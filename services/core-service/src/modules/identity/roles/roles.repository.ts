import { Injectable } from "@nestjs/common";
import { DatabaseService } from "../../../libs/database/database.service";

@Injectable()
class RolesRepositository{
    constructor(
        private readonly db:DatabaseService
    ){}   
}