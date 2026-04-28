import { Injectable } from '@nestjs/common'
import { BannerRepository } from './banner.repository'
import { AppError } from '../../libs/errors/app.error'
import { BannerQueryDTO, CreateBannerDTO, UpdateBannerDTO } from './banner.dto'

@Injectable()
export class BannerService {
  constructor(private readonly repo: BannerRepository) {}

  async findAll(query: BannerQueryDTO) {
    const { data, meta } = await this.repo.findAll(query)

    return {
      data,
      meta,
      message: 'Banners fetched successfully',
    }
  }

  async findActive(type?: string) {
    const data = await this.repo.findActive(type)

    return {
      data,
      message: 'Active banners fetched successfully',
    }
  }

  async findOne(id: string) {
    const banner = await this.repo.findById(id)

    if (!banner) {
      throw new AppError('Banner not found', 404)
    }

    return {
      data: banner,
      message: 'Banner fetched successfully',
    }
  }

  async create(dto: CreateBannerDTO) {
    const banner = await this.repo.create(dto)

    return {
      data: banner,
      message: 'Banner created successfully',
    }
  }

  async update(id: string, dto: UpdateBannerDTO) {
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

  async remove(id: string) {
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
