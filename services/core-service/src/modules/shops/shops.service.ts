import { Injectable } from "@nestjs/common"
import { ShopsRepository } from "./shops.repository"
import { CreateShopDTO, UpdateShopDTO, ShopQueryDTO } from "./shops.dto"
import { AppError } from "../../libs/errors/app.error"
import { ShopStatus } from "../../../generated/prisma/enums"
import { Shop } from "../../../generated/prisma/client"

@Injectable()
export class ShopsService {
  constructor(private readonly repo: ShopsRepository) {}

  async findAll(query: ShopQueryDTO): Promise<ApiResponse<Shop[]>> {
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

  async findMyShop(userId: number, query: ShopQueryDTO): Promise<ApiResponse<Shop[]>> {
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

  async findOne(id: number): Promise<ApiResponse<Shop>> {
    const shop = await this.repo.findOne(id)

    if (!shop) {
      throw new AppError("Shop not found", 404)
    }

    return {
      data: shop,
      message: "Successfully get shop"
    }
  }

  async create(userId: number, body: CreateShopDTO): Promise<ApiResponse<Shop>> {
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

    return {
      data: shop,
      message: "Shop created successfully"
    }
  }

  async update(id: number, body: UpdateShopDTO): Promise<ApiResponse<Shop>> {
    const shop = await this.repo.findOne(id)

    if (!shop) {
      throw new AppError("Shop not found", 404)
    }

    if (body.name && body.name !== shop.name) {
      const existing = await this.repo.findByNameAndOwner(body.name, shop.ownerId)

      if (existing) {
        throw new AppError("Shop name already used", 400)
      }
    }

    const updated = await this.repo.update(id, body)

    return {
      data: updated,
      message: "Shop updated successfully"
    }
  }

  async delete(id: number): Promise<ApiResponse<null>> {
    const shop = await this.repo.findOne(id)

    if (!shop) {
      throw new AppError("Shop not found", 404)
    }

    await this.repo.softDelete(id)

    return {
      data: null,
      message: "Shop deleted successfully"
    }
  }
}