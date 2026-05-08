import { Injectable } from "@nestjs/common"
import { ShopsRepository } from "./shops.repository"
import { ShopCreatedPublisher } from "./publisher/shop.created.publisher"
import { CreateShopDTO, UpdateShopDTO, ShopQueryDTO } from "./shops.dto"
import { AppError } from "../../libs/errors/app.error"
import { ShopStatus } from "../../../generated/prisma/enums"
import { randomUUID } from "crypto"

@Injectable()
export class ShopsService {
  constructor(
    private readonly repo: ShopsRepository,
    private readonly shopCreatedPublisher: ShopCreatedPublisher,
  ) {}

  async findAll(query: ShopQueryDTO): Promise<ApiResponse<unknown[]>> {
    const { page, limit, status, search, sortBy, sortOrder } = query

    const skip = (page - 1) * limit

    const { data, meta } = await this.repo.findAll({
      skip,
      take: limit,
      status,
      search,
      sortBy,
      sortOrder
    })

    return {
      data,
      meta,
      message: "Shops fetched successfully"
    }
  }

  async findMyShop(userId: string, query: ShopQueryDTO): Promise<ApiResponse<unknown[]>> {
    const { page, limit, search, sortBy, sortOrder } = query

    const skip = (page - 1) * limit

    const { data, meta } = await this.repo.findMyShop(userId, {
      skip,
      take: limit,
      search,
      sortBy,
      sortOrder
    })

    return {
      data,
      meta,
      message: "Successfully get shops"
    }
  }

  async findOne(id: string): Promise<ApiResponse<unknown>> {
    const shop = await this.repo.findOne(id)

    if (!shop) {
      throw new AppError("Shop not found", 404)
    }

    return {
      data: shop,
      message: "Successfully get shop"
    }
  }

  async create(userId: string, body: CreateShopDTO): Promise<ApiResponse<unknown>> {
    const existing = await this.repo.findByNameAndOwner(body.name, userId)

    if (existing) {
      throw new AppError("You already have a shop with this name", 400)
    }

    const shop = await this.repo.create({
      name: body.name,
      description: body.description,
      status: ShopStatus.PENDING,
      owner: {
        connect: { id: userId }
      }
    })

    await this.shopCreatedPublisher.publish({
      shopId: shop.id,
      ownerId: userId,
      name: shop.name,
      status: shop.status,
      timestamp: new Date().toISOString(),
      correlationId: randomUUID(),
    })

    return {
      data: shop,
      message: "Shop created successfully"
    }
  }

  async update(shopId: string, userId: string, body: UpdateShopDTO): Promise<ApiResponse<unknown>> {
    const shop = await this.repo.findOne(shopId)

    if (!shop) {
      throw new AppError("Shop not found", 404)
    }

    if (shop.ownerId !== userId) {
      throw new AppError("You are not authorized to update this shop", 403)
    }

    if (body.name && body.name !== shop.name) {
      const existing = await this.repo.findByNameAndOwner(body.name, shop.ownerId)

      if (existing) {
        throw new AppError("Shop name already used", 400)
      }
    }

    const updated = await this.repo.update(shopId, body)

    return {
      data: updated,
      message: "Shop updated successfully"
    }
  }

  async delete(shopId: string, userId: string): Promise<ApiResponse<null>> {
    const shop = await this.repo.findOne(shopId)

    if (!shop) {
      throw new AppError("Shop not found", 404)
    }

    if (shop.ownerId !== userId) {
      throw new AppError("You are not authorized to delete this shop", 403)
    }

    await this.repo.softDelete(shopId)

    return {
      data: null,
      message: "Shop deleted successfully"
    }
  }
}