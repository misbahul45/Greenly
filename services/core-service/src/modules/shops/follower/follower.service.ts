import { Injectable } from "@nestjs/common";
import { FollowerRepository } from "./follower.repository";
import { FollowerQueryDTO, MyFollowingQueryDTO } from "./follower.dto";
import { DatabaseService } from "../../../libs/database/database.service";
import { ShopFollowerPublisher } from "../publisher/shop.follower.publisher";
import { ShopNotFoundError, CannotFollowOwnShopError } from "../../../libs/errors/domain.error";
import * as crypto from "crypto";

@Injectable()
export class FollowerService {
  constructor(
    private readonly repo: FollowerRepository,
    private readonly db: DatabaseService,
    private readonly publisher: ShopFollowerPublisher,
  ) {}

  async follow(userId: string, shopId: string) {
    return this.db.$transaction(async (tx) => {
      const existing = await tx.shopFollower.findUnique({
        where: { userId_shopId: { userId, shopId } }
      });
      
      if (existing) {
        return { followed: false, message: 'Already following' };
      }

      const shop = await tx.shop.findUnique({ where: { id: shopId } });
      if (!shop) {
        throw new ShopNotFoundError(shopId);
      }
      if (shop.ownerId === userId) {
        throw new CannotFollowOwnShopError(userId, shopId);
      }

      const [, updatedShop] = await Promise.all([
        tx.shopFollower.create({ data: { userId, shopId } }),
        tx.shop.update({
          where: { id: shopId },
          data: { followerCount: { increment: 1 } }
        })
      ]);

      await this.publisher.publishShopFollowerAdded({
        userId,
        shopId,
        timestamp: new Date().toISOString(),
        correlationId: crypto.randomUUID(),
      });

      return {
        data: { followed: true, followerCount: updatedShop.followerCount },
        message: "Shop followed successfully",
      };
    });
  }

  async unfollow(userId: string, shopId: string) {
    return this.db.$transaction(async (tx) => {
      const existing = await tx.shopFollower.findUnique({
        where: { userId_shopId: { userId, shopId } }
      });

      if (!existing) {
        return {
          data: null,
          message: "Not following this shop",
        };
      }

      await tx.shopFollower.delete({
        where: { userId_shopId: { userId, shopId } },
      });

      await tx.shop.update({
        where: { id: shopId },
        data: { followerCount: { decrement: 1 } },
      });

      await this.publisher.publishShopFollowerRemoved({
        userId,
        shopId,
        timestamp: new Date().toISOString(),
      });

      return {
        data: null,
        message: "Shop unfollowed successfully",
      };
    });
  }

  async findFollowers(shopId: string, query: FollowerQueryDTO) {
     const shop = await this.db.shop.findUnique({ where: { id: shopId } });
     if (!shop) {
      throw new ShopNotFoundError(shopId);
     }
    const { page, limit, search, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    const { data, meta } = await this.repo.findFollowers(shopId, {
      skip,
      take: limit,
      search,
      sortBy,
      sortOrder,
    });

    return {
      data,
      meta,
      message: "Followers fetched successfully",
    };
  }

  async findFollowing(userId: string, query: MyFollowingQueryDTO) {
    const { page, limit, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    const { data, meta } = await this.repo.findFollowingShops(userId, {
      skip,
      take: limit,
      sortBy,
      sortOrder,
    });

    return {
      data,
      meta,
      message: "Following shops fetched successfully",
    };
  }
}
