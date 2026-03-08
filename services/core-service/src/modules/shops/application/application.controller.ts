import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Query,
  Param,
  Delete,
} from '@nestjs/common';
import { Roles } from '../../auth/decorators/roles.decorator';
import { ZodValidationPipe } from '../../../libs/pipes/zod-validation.pipe';
import {
  CreateShopApplicationSchema,
  type CreateShopApplicationDTO,
  ReviewShopApplicationSchema,
  type ReviewShopApplicationDTO,
  ShopApplicationQuerySchema,
  type ShopApplicationQueryDTO,
  ShopApplicationShopIdParamSchema,
  type ShopApplicationShopIdParamDTO,
} from './application.dto';
import { ApplicationService } from './application.service';
import ErrorHandler from '../../../libs/errors/handler.error';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';

@Controller()
export class ApplicationController {
  constructor(private readonly service: ApplicationService) {}

  @Post()
  create(
    @Param(new ZodValidationPipe(ShopApplicationShopIdParamSchema))
    params: ShopApplicationShopIdParamDTO,
    @Body(new ZodValidationPipe(CreateShopApplicationSchema))
    body: CreateShopApplicationDTO,
  ) {
    return ErrorHandler(() =>
      this.service.create(params.shopId, body),
    );
  }

  @Patch()
  update(
    @Param(new ZodValidationPipe(ShopApplicationShopIdParamSchema))
    param: ShopApplicationShopIdParamDTO,
    @Body(new ZodValidationPipe(CreateShopApplicationSchema))
    body: CreateShopApplicationDTO,
  ) {
    return ErrorHandler(() =>
      this.service.update(param.shopId, body),
    );
  }

  @Roles('SUPER_ADMIN')
  @Patch('review')
  review(
    @Param(new ZodValidationPipe(ShopApplicationShopIdParamSchema))
    param: ShopApplicationShopIdParamDTO,
    @Body(new ZodValidationPipe(ReviewShopApplicationSchema))
    body: ReviewShopApplicationDTO,
  ) {
    return ErrorHandler(() =>
      this.service.review(param.shopId, body),
    );
  }

  @Roles('SUPER_ADMIN')
  @Get()
  findOne(
    @Param(new ZodValidationPipe(ShopApplicationShopIdParamSchema))
    param: ShopApplicationShopIdParamDTO,
  ) {
    return ErrorHandler(() =>
      this.service.findOne(param.shopId),
    );
  }

  @Roles('SUPER_ADMIN')
  @Get('list')
  findAll(
    @Query(new ZodValidationPipe(ShopApplicationQuerySchema))
    query: ShopApplicationQueryDTO,
  ) {
    return ErrorHandler(() =>
      this.service.findAll(query),
    );
  }

  @Get('me')
  findMyApplications(
    @CurrentUser() user: UserLogin,
    @Query(new ZodValidationPipe(ShopApplicationQuerySchema))
    query: ShopApplicationQueryDTO,
  ) {
    return ErrorHandler(() =>
      this.service.findMyApplications(user.sub, query)
    );
  }

  @Delete()
  delete(
    @Param(new ZodValidationPipe(ShopApplicationShopIdParamSchema))
    param: ShopApplicationShopIdParamDTO,
  ) {
    return ErrorHandler(() =>
      this.service.delete(param.shopId),
    );
  }
}