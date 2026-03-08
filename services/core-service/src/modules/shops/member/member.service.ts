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
      data: newMember,
    };
  }

  async findMany(shopId: number, query: ShopMemberQueryDTO) {
    const { page, limit, role, sortBy, sortOrder } = query
    
    const [members, total] = await Promise.all([
        this.repo.findMany(shopId,
          {
            page,
            limit,
            role,
            sortBy,
            sortOrder
          }
        ),
        this.repo.count(shopId, {
          page,
          limit,
          role,
          sortBy,
          sortOrder
        })
      ])
      
    return {
      message: 'member list',
      data: members,
      meta: {
        page: query.page,
        total,
        limit: limit,
        lastPage: Math.ceil(total / limit),
      },
    };
  }

  async findMember(shopId: number, memberId: number) {
    const exitedShop = await this.repo.findShopById(shopId)
    if (!exitedShop) {
      throw new AppError('Shop not found', 404)
    }
    const exitedMember = await this.repo.findMemberByShopIdAndUserId(shopId, memberId)
    if (!exitedMember) {
      throw new AppError('Member not found', 404)
    }
    return {
      message: 'member detail',
      data: exitedMember,
    };
  }

  async updateMember(
    shopId: number,
    memberId: number,
    body: UpdateMemberRoleDTO,
  ) {
    const exitedShop = await this.repo.findShopById(shopId)
    if (!exitedShop) {
      throw new AppError('Shop not found', 404)
    }
    const exitedMember = await this.repo.findMemberByShopIdAndUserId(shopId, memberId)
    if (!exitedMember) {
      throw new AppError('Member not found', 404)
    }
    await this.repo.updateMemberRole(shopId, memberId, body)
    
    return {
      message: 'member updated',
      data: [],
    };
  }

  async deleteMember(shopId: number, memberId: number) {
    const exitedShop = await this.repo.findShopById(shopId)
    if (!exitedShop) {
      throw new AppError('Shop not found', 404)
    }
    const exitedMember = await this.repo.findMemberByShopIdAndUserId(shopId, memberId)
    if (!exitedMember) {
      throw new AppError('Member not found', 404)
    }
    const deletedMember = await this.repo.deleteMember(shopId, memberId)
    
    return {
      message: 'member deleted',
      data: deletedMember,
    };
  }
}