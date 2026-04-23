import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ZodValidationPipe } from '../../libs/pipes/zod-validation.pipe';
import {
  CreateShopSchema,
  UpdateShopSchema,
  ShopIdParamSchema,
  ShopQuerySchema,
  type CreateShopDTO,
  type UpdateShopDTO,
  type ShopIdParamDTO,
  type ShopQueryDTO,
} from './shops.dto';
import ErrorHandler from '../../libs/errors/handler.error';
import { ShopsService } from './shops.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('shops')
export class ShopsController {
  constructor(
    private readonly service: ShopsService
  ) {}

  @Get()
  findAll(
    @Query(new ZodValidationPipe(ShopQuerySchema))
    query: ShopQueryDTO,
  ) {
    return ErrorHandler(() =>
      this.service.findAll(query)
    )
  }

  @Post()
  create(
    @Body(new ZodValidationPipe(CreateShopSchema))
    body: CreateShopDTO,
    @CurrentUser()
    user: UserLogin,
  ) {
    return ErrorHandler(() =>
      this.service.create(user.sub, body)
    )
  }

  @Get('me')
  findMyShop(
    @CurrentUser() user: UserLogin,
    @Query(new ZodValidationPipe(ShopQuerySchema))
    query: ShopQueryDTO,
  ) {
    return ErrorHandler(() =>
      this.service.findMyShop(user.sub, query)
    )
  }

  @Get(':id')
  findOne(
    @Param(new ZodValidationPipe(ShopIdParamSchema))
    params: ShopIdParamDTO,
  ) {
    return ErrorHandler(() =>
      this.service.findOne(params.shopId)
    )
  }

  @Patch(':id')
  update(
    @Param(new ZodValidationPipe(ShopIdParamSchema))
    params: ShopIdParamDTO,
    @Body(new ZodValidationPipe(UpdateShopSchema))
    body: UpdateShopDTO,
    @CurrentUser() user: UserLogin,
  ) {
    return ErrorHandler(() =>
      this.service.update(params.shopId, user.sub, body)
    )
  }

  @Delete(':id')
  delete(
    @Param(new ZodValidationPipe(ShopIdParamSchema))
    params: ShopIdParamDTO,
    @CurrentUser() user: UserLogin,
  ) {
    return ErrorHandler(() =>
      this.service.delete(params.shopId, user.sub)
    )
  }
}