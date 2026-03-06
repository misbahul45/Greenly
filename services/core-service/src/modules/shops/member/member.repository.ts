import { Injectable } from "@nestjs/common";
import { DatabaseService } from "src/libs/database/database.service";
import { AddMemberDTO } from "./member.dto";

@Injectable()
export class MemberRepository {
  constructor(
    private readonly db:DatabaseService
  ) { }
  
  async findMemberByShopIdAndUserId(shopId: number, userId: number) {
    return await this.db.shopMember.findFirst({
      where: {
        userId,
        shopId
      }
    })
  }
  
  async findShopById(shopId: number) {
    return await this.db.shop.findUnique({
      where: {
        id:shopId
      }
    })
  }
  
  async addMember(shopId: number, body: AddMemberDTO) {
    return await this.db.shopMember.create({
      data: {
        shopId,
        userId: body.userId,
        role: body.role,
      }
    })
  }
}