import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common'
import { BannerService } from './banner.service'
import { ZodValidationPipe } from '../../libs/pipes/zod-validation.pipe'
import ErrorHandler from '../../libs/errors/handler.error'
import {
  BannerIdParamSchema,
  BannerQuerySchema,
  CreateBannerSchema,
  UpdateBannerSchema,
  type BannerIdParamDTO,
  type BannerQueryDTO,
  type CreateBannerDTO,
  type UpdateBannerDTO,
} from './banner.dto'
import { JwtAccessGuard } from '../auth/guards/jwt.access.guard'
import { Roles } from '../auth/decorators/roles.decorator'

@Controller('admin/banners')
@UseGuards(JwtAccessGuard)
@Roles('SUPER_ADMIN', 'ADMIN')
export class BannerAdminController {
  constructor(private readonly service: BannerService) {}

  @Get()
  findAll(
    @Query(new ZodValidationPipe(BannerQuerySchema)) query: BannerQueryDTO,
  ) {
    return ErrorHandler(() => this.service.findAll(query))
  }

  @Get(':id')
  findOne(
    @Param(new ZodValidationPipe(BannerIdParamSchema)) params: BannerIdParamDTO,
  ) {
    return ErrorHandler(() => this.service.findOne(params.id))
  }

  @Post()
  create(
    @Body(new ZodValidationPipe(CreateBannerSchema)) body: CreateBannerDTO,
  ) {
    return ErrorHandler(() => this.service.create(body))
  }

  @Patch(':id')
  update(
    @Param(new ZodValidationPipe(BannerIdParamSchema)) params: BannerIdParamDTO,
    @Body(new ZodValidationPipe(UpdateBannerSchema)) body: UpdateBannerDTO,
  ) {
    return ErrorHandler(() => this.service.update(params.id, body))
  }

  @Delete(':id')
  remove(
    @Param(new ZodValidationPipe(BannerIdParamSchema)) params: BannerIdParamDTO,
  ) {
    return ErrorHandler(() => this.service.remove(params.id))
  }
}

@Controller('banners')
export class BannerPublicController {
  constructor(private readonly service: BannerService) {}

  @Get('active')
  findActive(@Query('type') type?: string) {
    return ErrorHandler(() => this.service.findActive(type))
  }
}
