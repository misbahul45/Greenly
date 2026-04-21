import { Injectable, BadRequestException } from "@nestjs/common";

import {
  AddMemberDTO,
  UpdateMemberRoleDTO,
  ShopMemberQueryDTO,
} from "./member.dto";
import { MemberRepository } from "./member.repository";
import { ShopNotFoundError, InvalidStateTransitionError, ShopAccessDeniedError } from "../../../libs/errors/domain.error";
import { ShopMemberPublisher } from "../publisher/shop.member.publisher";

@Injectable()
export class MemberService {
  constructor(
    private readonly repo: MemberRepository,
    private readonly publisher: ShopMemberPublisher,
  ) {}

  async addMember(shopId: string, currentUserId: string, body: AddMemberDTO) {
    const existedMember = await this.repo.findMemberByShopIdAndUserId(shopId, body.userId);

    if (existedMember) {
      throw new BadRequestException("Member already belongs to this shop");
    }

    const existedShop = await this.repo.findShopById(shopId);

    if (!existedShop) {
      throw new ShopNotFoundError(shopId);
    }

    if (existedShop.status !== 'APPROVED') {
      throw new BadRequestException("Shop is not approved");
    }

    if (body.role === "OWNER") {
      throw new BadRequestException("Cannot add member with OWNER role");
    }

    const newMember = await this.repo.addMember(shopId, body);

    await this.publisher.publishShopMemberAdded({
      shopId,
      userId: body.userId,
      role: body.role,
      addedBy: currentUserId,
      timestamp: new Date().toISOString(),
    });

    return {
      message: "Member added successfully",
      data: newMember,
    };
  }

  async findMany(shopId: string, query: ShopMemberQueryDTO) {
    const { page, limit, role, sortBy, sortOrder } = query;

    const [members, total] = await Promise.all([
      this.repo.findMany(shopId, {
        page,
        limit,
        role,
        sortBy,
        sortOrder,
      }),
      this.repo.count(shopId, {
        page,
        limit,
        role,
        sortBy,
        sortOrder,
      }),
    ]);

    return {
      message: "Members fetched successfully",
      data: members,
      meta: {
        page: query.page,
        total,
        limit,
        lastPage: Math.ceil(total / limit),
      },
    };
  }

  async findMember(shopId: string, memberId: string) {
    const existedShop = await this.repo.findShopById(shopId);
    if (!existedShop) {
      throw new ShopNotFoundError(shopId);
    }
    const existedMember = await this.repo.findMemberByShopIdAndUserId(shopId, memberId);
    if (!existedMember) {
      throw new BadRequestException("Member not found");
    }
    return {
      message: "Member fetched successfully",
      data: existedMember,
    };
  }

  async updateMember(
    shopId: string,
    memberId: string,
    body: UpdateMemberRoleDTO,
  ) {
    const existedShop = await this.repo.findShopById(shopId);
    if (!existedShop) {
       throw new ShopNotFoundError(shopId);
    }
    const existedMember = await this.repo.findMemberByShopIdAndUserId(shopId, memberId);
    if (!existedMember) {
      throw new BadRequestException("Member not found");
    }

    if (existedMember.role === "OWNER") {
      throw new BadRequestException("Cannot change owner role");
    }

    const updated = await this.repo.updateMemberRole(shopId, memberId, body);

    return {
      message: "Member role updated successfully",
      data: updated,
    };
  }

  async deleteMember(shopId: string, memberId: string, currentUserId: string) {
    const existedShop = await this.repo.findShopById(shopId);
    if (!existedShop) {
      throw new ShopNotFoundError(shopId);
    }
    const existedMember = await this.repo.findMemberByShopIdAndUserId(shopId, memberId);
    if (!existedMember) {
      throw new BadRequestException("Member not found");
    }

    if (existedMember.role === "OWNER") {
      throw new BadRequestException("Cannot remove shop owner");
    }

    await this.repo.deleteMember(shopId, memberId);

    await this.publisher.publishShopMemberRemoved({
      shopId,
      userId: memberId,
      removedBy: currentUserId,
      timestamp: new Date().toISOString(),
    });

    return {
      message: "Member removed successfully",
      data: null,
    };
  }
}