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

import { ZodValidationPipe } from 'src/libs/pipes/zod-validation.pipe';
import { Roles } from 'src/modules/auth/decorators/roles.decorator';
import ErrorHandler from 'src/libs/errors/handler.error';

import { MemberService } from './member.service';

import {
  type AddMemberDTO,
  AddMemberSchema,
  type UpdateMemberRoleDTO,
  UpdateMemberRoleSchema,
  type ShopMemberShopIdParamDTO,
  ShopMemberShopIdParamSchema,
  type ShopMemberIdParamDTO,
  ShopMemberIdParamSchema,
  type ShopMemberQueryDTO,
  ShopMemberQuerySchema,
} from './member.dto';

@Controller('')
export class MemberController {
  constructor(private readonly service: MemberService) {}

  @Roles('ADMIN', 'SUPER_ADMIN')
  @Post()
  addMember(
    @Param(new ZodValidationPipe(ShopMemberShopIdParamSchema))
    params: ShopMemberShopIdParamDTO,

    @Body(new ZodValidationPipe(AddMemberSchema))
    body: AddMemberDTO,
  ) {
    return ErrorHandler(() =>
      this.service.addMember(params.shopId, body),
    );
  }

  @Roles('ADMIN', 'SUPER_ADMIN')
  @Get()
  findMany(
    @Param(new ZodValidationPipe(ShopMemberShopIdParamSchema))
    params: ShopMemberShopIdParamDTO,

    @Query(new ZodValidationPipe(ShopMemberQuerySchema))
    query: ShopMemberQueryDTO,
  ) {
    return ErrorHandler(() =>
      this.service.findMany(params.shopId, query),
    );
  }

  @Get('/:memberId')
  findMember(
    @Param(new ZodValidationPipe(ShopMemberIdParamSchema))
    params: ShopMemberIdParamDTO,
  ) {
    return ErrorHandler(() =>
      this.service.findMember(params.shopId, params.memberId),
    );
  }

  @Roles('ADMIN', 'SUPER_ADMIN')
  @Patch('/:memberId')
  updateMember(
    @Param(new ZodValidationPipe(ShopMemberIdParamSchema))
    params: ShopMemberIdParamDTO,

    @Body(new ZodValidationPipe(UpdateMemberRoleSchema))
    body: UpdateMemberRoleDTO,
  ) {
    return ErrorHandler(() =>
      this.service.updateMember(params.shopId, params.memberId, body),
    );
  }

  @Roles('ADMIN', 'SUPER_ADMIN')
  @Delete('/:memberId')
  deleteMember(
    @Param(new ZodValidationPipe(ShopMemberIdParamSchema))
    params: ShopMemberIdParamDTO,
  ) {
    return ErrorHandler(() =>
      this.service.deleteMember(params.shopId, params.memberId),
    );
  }
}