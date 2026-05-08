import { Injectable } from '@nestjs/common'
import { ShopBannerRepository } from './banner.repository'
import { AppError } from '../../../libs/errors/app.error'
import { CreateShopBannerDTO, ShopBannerQueryDTO, UpdateShopBannerDTO } from './banner.dto'

@Injectable()
export class ShopBannerService {
  constructor(private readonly repo: ShopBannerRepository) {}

  async findAll(shopId: string, query: ShopBannerQueryDTO) {
    const { data, meta } = await this.repo.findAll(shopId, query)

    return {
      data,
      meta,
      message: 'Shop banners fetched successfully',
    }
  }

  async findOne(shopId: string, id: string) {
    const banner = await this.repo.findById(id)

    if (!banner) {
      throw new AppError('Banner not found', 404)
    }

    return {
      data: banner,
      message: 'Banner fetched successfully',
    }
  }

  async create(shopId: string, dto: CreateShopBannerDTO) {
    const banner = await this.repo.create(shopId, dto)

    return {
      data: banner,
      message: 'Banner created successfully',
    }
  }

  async update(shopId: string, id: string, dto: UpdateShopBannerDTO) {
    const existing = await this.repo.findById(id)

    if (!existing) {
      throw new AppError('Banner not found', 404)
    }

    const banner = await this.repo.update(id, dto)

    return {
      data: banner,
      message: 'Banner updated successfully',
    }
  }

  async remove(shopId: string, id: string) {
    const existing = await this.repo.findById(id)

    if (!existing) {
      throw new AppError('Banner not found', 404)
    }

    await this.repo.softDelete(id)

    return {
      data: null,
      message: 'Banner deleted successfully',
    }
  }
}
