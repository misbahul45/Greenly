import { Injectable } from '@nestjs/common'
import { DatabaseService } from '../../libs/database/database.service'
import { Prisma } from '../../../generated/prisma/browser'
import { BannerQueryDTO, CreateBannerDTO, UpdateBannerDTO } from './banner.dto'

@Injectable()
export class BannerRepository {
  constructor(private readonly db: DatabaseService) {}

  async findAll(query: BannerQueryDTO) {
    const { page, limit, type, isActive, search, sortBy, sortOrder } = query
    const skip = (page - 1) * limit

    const where: Prisma.BannerWhereInput = {
      deletedAt: null,
      ...(type && { type }),
      ...(isActive !== undefined && { isActive }),
      ...(search && {
        OR: [
          { title: { contains: search } },
          { description: { contains: search } },
        ],
      }),
    }

    const [data, total] = await this.db.$transaction([
      this.db.banner.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: { promotion: { select: { id: true, code: true, name: true } } },
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

  async findActive(type?: string) {
    const now = new Date()

    return this.db.banner.findMany({
      where: {
        deletedAt: null,
        isActive: true,
        ...(type && { type: type as any }),
        OR: [
          { startDate: null },
          { startDate: { lte: now } },
        ],
        AND: [
          {
            OR: [
              { endDate: null },
              { endDate: { gte: now } },
            ],
          },
        ],
      },
      orderBy: { position: 'asc' },
      include: { promotion: { select: { id: true, code: true, name: true } } },
    })
  }

  async findById(id: string) {
    return this.db.banner.findFirst({
      where: { id, deletedAt: null },
      include: { promotion: { select: { id: true, code: true, name: true } } },
    })
  }

  async create(data: CreateBannerDTO) {
    return this.db.banner.create({
      data: {
        title: data.title,
        description: data.description,
        imageUrl: data.imageUrl,
        promotionId: data.promotionId,
        isActive: data.isActive,
        position: data.position,
        startDate: data.startDate,
        endDate: data.endDate,
        type: data.type,
      },
      include: { promotion: { select: { id: true, code: true, name: true } } },
    })
  }

  async update(id: string, data: UpdateBannerDTO) {
    return this.db.banner.update({
      where: { id },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl }),
        ...(data.promotionId !== undefined && { promotionId: data.promotionId }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        ...(data.position !== undefined && { position: data.position }),
        ...(data.startDate !== undefined && { startDate: data.startDate }),
        ...(data.endDate !== undefined && { endDate: data.endDate }),
        ...(data.type !== undefined && { type: data.type }),
      },
      include: { promotion: { select: { id: true, code: true, name: true } } },
    })
  }

  async softDelete(id: string) {
    return this.db.banner.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    })
  }
}
