import { Injectable } from '@nestjs/common';
import {
  CreateShopDTO,
  UpdateShopDTO,
  ShopQueryDTO,
} from './shops.dto';
import { ShopsRepository } from './shops.repository';
import { AppError } from '../../libs/errors/app.error';
import { ShopStatus } from '../../../generated/prisma/enums';

@Injectable()
export class ShopsService {
  constructor(
    private readonly repo: ShopsRepository
  ) {}

  async findAll(query: ShopQueryDTO) {
    const { page, limit, status, search, sortBy, sortOrder } = query;

    const [shops, total] = await Promise.all([
      this.repo.getShops({
        skip: (page - 1) * limit,
        take: limit,
        status,
        search,
        sortBy,
        sortOrder,
      }),
      this.repo.countShop({
        status,
        search,
      }),
    ]);

    return {
      data: shops,
      meta: {
        total,
        page,
        limit,
        lastPage: Math.ceil(total / limit),
      },
      message: 'Shops fetched successfully',
    };
  }

  async findMyShop(userId: number) {
    const shops = await this.repo.myShop(userId);

    return {
      data: shops,
      message: 'Successfully get shops',
    };
  }

  async findOne(id: number) {
    const findShop = await this.repo.findOne(id);

    if (!findShop) {
      throw new AppError('Shop not found', 404);
    }

    return {
      data: findShop,
      message: 'Successfully get shop',
    };
  }

  async create(userId: number, body: CreateShopDTO) {
    const existingShop = await this.repo.findByNameAndOwner(
      body.name,
      userId
    );

    if (existingShop) {
      throw new AppError('You already have a shop with this name', 400);
    }

    const newShop = await this.repo.create({
      name: body.name,
      description: body.description,
      status: ShopStatus.PENDING,
      owner: {
        connect: { id: userId },
      },
    });

    return {
      data: newShop,
      message: 'Shop created successfully',
    };
  }

  async update(id: number, body: UpdateShopDTO) {
    const shop = await this.repo.findOne(id);

    if (!shop) {
      throw new AppError('Shop not found', 404);
    }

    if (body.name && body.name !== shop.name) {
      const existing = await this.repo.findByNameAndOwner(
        body.name,
        shop.ownerId
      );

      if (existing) {
        throw new AppError('Shop name already used', 400);
      }
    }

    const updated = await this.repo.update(id, {
      ...body,
    });

    return {
      data: updated,
      message: 'Shop updated successfully',
    };
  }

  async delete(id: number) {
    const shop = await this.repo.findOne(id);

    if (!shop) {
      throw new AppError('Shop not found', 404);
    }

    await this.repo.softDelete(id);

    return {
      message: 'Shop deleted successfully',
    };
  }
}