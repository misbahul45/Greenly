import { Injectable } from '@nestjs/common';

import {
  AddMemberDTO,
  UpdateMemberRoleDTO,
  ShopMemberQueryDTO,
} from './member.dto';
import { MemberRepository } from './member.repository';
import { AppError } from 'src/libs/errors/app.error';
import { ShopStatus } from 'generated/prisma/enums';

@Injectable()
export class MemberService {
  constructor(
    private readonly repo: MemberRepository,
  ) {}
  
  async addMember(shopId: number, body: AddMemberDTO) {
    const existedMember = await this.repo.findMemberByShopIdAndUserId(shopId, body.userId)
    
    if (existedMember) {
      throw new AppError('Member already existed', 400)
    }
    
    const exitedShop = await this.repo.findShopById(shopId)
    
    if (!exitedShop) {
      throw new AppError('Shop not found', 404)
    }
    
    if (exitedShop.status !== ShopStatus.APPROVED) {
      throw new AppError('Shop not verified', 400)
    }
    
    const newMember=await this.repo.addMember(shopId, body)
    
    return {
      message: 'member added',
      data: [],
    };
  }

  async findMany(shopId: number, query: ShopMemberQueryDTO) {
    return {
      message: 'member list',
      data: [],
      meta: {
        page: query.page,
        limit: query.limit,
      },
    };
  }

  async findMember(shopId: number, memberId: number) {
    return {
      message: 'member detail',
      data: [],
    };
  }

  async updateMember(
    shopId: number,
    memberId: number,
    body: UpdateMemberRoleDTO,
  ) {
    return {
      message: 'member updated',
      data: [],
    };
  }

  async deleteMember(shopId: number, memberId: number) {
    return {
      message: 'member deleted',
      data: [],
    };
  }
}