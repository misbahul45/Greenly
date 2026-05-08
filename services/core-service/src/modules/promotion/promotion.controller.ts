import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { PromotionService } from './promotion.service';
import { PromotionAdminGuard } from './guards/promotion-admin.guard';
import { JwtAccessGuard } from '../auth/guards/jwt.access.guard';
import {
  CreatePromotionSchema,
  ListPromotionsQuerySchema,
  UpdatePromotionSchema,
  ValidatePromoQuerySchema,
  UserPayload,
} from './promotion.dto';
import { ZodValidationPipe } from '../../libs/pipes/zod-validation.pipe';

@Controller('admin/promotions')
@UseGuards(JwtAccessGuard, PromotionAdminGuard)
export class PromotionAdminController {
  constructor(private readonly promotionService: PromotionService) {}

  @Post()
  async create(@Body(new ZodValidationPipe(CreatePromotionSchema)) dto: any, @Req() req: any) {
    const user: UserPayload = req.user;
    return this.promotionService.create(dto, user.sub);
  }

  @Get()
  async list(@Query(new ZodValidationPipe(ListPromotionsQuerySchema)) query: any) {
    return this.promotionService.list(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.promotionService.findById(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdatePromotionSchema)) dto: any,
  ) {
    return this.promotionService.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.promotionService.softDelete(id);
  }
}

@Controller('promotions')
export class PromotionPublicController {
  constructor(private readonly promotionService: PromotionService) {}

  @Post('validate')
  @UseGuards(JwtAccessGuard)
  async validate(@Body(new ZodValidationPipe(ValidatePromoQuerySchema)) dto: any, @Req() req: any) {
    const user: UserPayload | undefined = req.user;
    return this.promotionService.validate(dto, user?.sub);
  }

  @Get('active')
  async listActive(@Query('shopId') shopId?: string) {
    return this.promotionService.listActive(shopId);
  }
}
