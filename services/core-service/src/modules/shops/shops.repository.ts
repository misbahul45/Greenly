import { Injectable } from "@nestjs/common"
import { DatabaseService } from "../../libs/database/database.service"
import { ShopStatus } from "../../../generated/prisma/enums"
import { Prisma } from "../../../generated/prisma/browser"
import { ShopFilters, ShopQueryParams } from "./types"

@Injectable()
export class ShopsRepository {
  constructor(private readonly db: DatabaseService) {}

  private buildWhere(params: ShopFilters): Prisma.ShopWhereInput {
    const where: Prisma.ShopWhereInput = {
      deletedAt: null
    }

    if (params.status) {
      where.status = params.status
    }

    if (params.ownerId) {
      where.ownerId = params.ownerId
    }

    if (params.search) {
      where.name = {
        contains: params.search
      }
    }

    if (params.createdFrom || params.createdTo) {
      where.createdAt = {
        ...(params.createdFrom && { gte: params.createdFrom }),
        ...(params.createdTo && { lte: params.createdTo })
      }
    }

    return where
  }

  async findMany(params: ShopQueryParams) {
    const where = this.buildWhere(params)

    const data = await this.db.shop.findMany({
      skip: params.skip,
      take: params.take,
      where,
      include: {
        owner: {
          select: {
            email: true,
            profile: true
          }
        }
      },
      orderBy: {
        [params.sortBy]: params.sortOrder
      }
    })

    return data.map(({ owner, ...shop }) => ({
      ...shop,
      owner: {
        email: owner.email,
        fullName: owner.profile?.fullName,
        avatarUrl: owner.profile?.avatarUrl
      }
    }))
  }

  async count(params: ShopFilters) {
    const where = this.buildWhere(params)
    return this.db.shop.count({ where })
  }

  async findAll(params: ShopQueryParams) {
    const { skip, take, ...filters } = params

    const [data, total] = await Promise.all([
      this.findMany(params),
      this.count(filters)
    ])

    return {
      data,
      meta: {
        total,
        page: Math.floor(skip / take) + 1,
        limit: take,
        lastPage: Math.ceil(total / take)
      }
    }
  }

  async findMyShop(userId: string, params: ShopQueryParams) {
    return this.findAll({
      ...params,
      ownerId: userId
    })
  }

  async findOne(id: string) {
    const data = await this.db.shop.findFirst({
      where: {
        id,
        deletedAt: null
      },
      include: {
        owner: {
          select: {
            email: true,
            profile: true
          }
        }
      }
    })

    if (!data) return null

    const { owner, ...shop } = data

    return {
      ...shop,
      owner: {
        email: owner.email,
        fullName: owner.profile?.fullName,
        avatarUrl: owner.profile?.avatarUrl
      }
    }
  }

  async findByNameAndOwner(name: string, userId: string) {
    return this.db.shop.findFirst({
      where: {
        name,
        ownerId: userId,
        deletedAt: null
      }
    })
  }

  async create(data: Prisma.ShopCreateInput) {
    return this.db.shop.create({ data })
  }

  async update(id: string, data: Prisma.ShopUpdateInput) {
    return this.db.shop.update({
      where: { id },
      data
    })
  }

  async softDelete(id: string) {
    return this.db.shop.update({
      where: { id },
      data: {
        deletedAt: new Date()
      }
    })
  }
}