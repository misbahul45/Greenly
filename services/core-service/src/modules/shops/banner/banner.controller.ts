import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common'
import { ShopBannerService } from './banner.service'
import { ZodValidationPipe } from '../../../libs/pipes/zod-validation.pipe'
import ErrorHandler from '../../../libs/errors/handler.error'
import { ShopMemberGuard, MinRole } from '../guards/shop-member.guard'
import {
  ShopBannerShopIdParamSchema,
  ShopBannerIdParamSchema,
  ShopBannerQuerySchema,
  CreateShopBannerSchema,
  UpdateShopBannerSchema,
  type ShopBannerShopIdParamDTO,
  type ShopBannerIdParamDTO,
  type ShopBannerQueryDTO,
  type CreateShopBannerDTO,
  type UpdateShopBannerDTO,
} from './banner.dto'

@Controller()
@UseGuards(ShopMemberGuard)
export class ShopBannerController {
  constructor(private readonly service: ShopBannerService) {}

  @MinRole('STAFF')
  @Get()
  findAll(
    @Param(new ZodValidationPipe(ShopBannerShopIdParamSchema)) params: ShopBannerShopIdParamDTO,
    @Query(new ZodValidationPipe(ShopBannerQuerySchema)) query: ShopBannerQueryDTO,
  ) {
    return ErrorHandler(() => this.service.findAll(params.shopId, query))
  }

  @MinRole('STAFF')
  @Get(':id')
  findOne(
    @Param(new ZodValidationPipe(ShopBannerIdParamSchema)) params: ShopBannerIdParamDTO,
  ) {
    return ErrorHandler(() => this.service.findOne(params.shopId, params.id))
  }

  @MinRole('ADMIN')
  @Post()
  create(
    @Param(new ZodValidationPipe(ShopBannerShopIdParamSchema)) params: ShopBannerShopIdParamDTO,
    @Body(new ZodValidationPipe(CreateShopBannerSchema)) body: CreateShopBannerDTO,
  ) {
    return ErrorHandler(() => this.service.create(params.shopId, body))
  }

  @MinRole('ADMIN')
  @Patch(':id')
  update(
    @Param(new ZodValidationPipe(ShopBannerIdParamSchema)) params: ShopBannerIdParamDTO,
    @Body(new ZodValidationPipe(UpdateShopBannerSchema)) body: UpdateShopBannerDTO,
  ) {
    return ErrorHandler(() => this.service.update(params.shopId, params.id, body))
  }

  @MinRole('OWNER')
  @Delete(':id')
  remove(
    @Param(new ZodValidationPipe(ShopBannerIdParamSchema)) params: ShopBannerIdParamDTO,
  ) {
    return ErrorHandler(() => this.service.remove(params.shopId, params.id))
  }
}
