import { Injectable } from '@nestjs/common'
import { DatabaseService } from '../../../libs/database/database.service'
import { Prisma } from '../../../../generated/prisma/browser'
import { CreateShopBannerDTO, ShopBannerQueryDTO, UpdateShopBannerDTO } from './banner.dto'

@Injectable()
export class ShopBannerRepository {
  constructor(private readonly db: DatabaseService) {}

  async findAll(shopId: string, query: ShopBannerQueryDTO) {
    const { page, limit, isActive, sortBy, sortOrder } = query
    const skip = (page - 1) * limit

    const where: Prisma.BannerWhereInput = {
      deletedAt: null,
      type: 'HOME',
      ...(isActive !== undefined && { isActive }),
    }

    const [data, total] = await this.db.$transaction([
      this.db.banner.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      this.db.banner.count({ where }),
    ])

    return {
      data,
      meta: {
        total,
        page,
        limit,
        lastPage: Math.ceil(total / limit),
      },
    }
  }

  async findById(id: string) {
    return this.db.banner.findFirst({
      where: { id, deletedAt: null },
    })
  }

  async create(shopId: string, data: CreateShopBannerDTO) {
    return this.db.banner.create({
      data: {
        title: data.title,
        description: data.description,
        imageUrl: data.imageUrl,
        isActive: data.isActive,
        position: data.position,
        startDate: data.startDate,
        endDate: data.endDate,
        type: 'HOME',
      },
    })
  }

  async update(id: string, data: UpdateShopBannerDTO) {
    return this.db.banner.update({
      where: { id },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        ...(data.position !== undefined && { position: data.position }),
        ...(data.startDate !== undefined && { startDate: data.startDate }),
        ...(data.endDate !== undefined && { endDate: data.endDate }),
      },
    })
  }

  async softDelete(id: string) {
    return this.db.banner.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    })
  }
}
