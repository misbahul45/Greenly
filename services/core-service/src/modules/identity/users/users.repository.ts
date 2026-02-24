import { Injectable } from "@nestjs/common";
import { DatabaseService } from "../../../libs/database/database.service";

@Injectable()
class UsersRepositository{
    constructor(
        private readonly db:DatabaseService
    ){}   
}