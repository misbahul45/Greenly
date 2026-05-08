import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";

import { ZodValidationPipe } from "../../../libs/pipes/zod-validation.pipe";
import ErrorHandler from "../../../libs/errors/handler.error";
import { MemberService } from "./member.service";
import { ShopMemberGuard, MinRole } from "../guards/shop-member.guard";
import { CurrentUser } from "../../auth/decorators/current-user.decorator";

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
} from "./member.dto";

@Controller()
export class MemberController {
  constructor(private readonly service: MemberService) {}

  @UseGuards(ShopMemberGuard)
  @MinRole("OWNER")
  @Post()
  addMember(
    @Param(new ZodValidationPipe(ShopMemberShopIdParamSchema))
    params: ShopMemberShopIdParamDTO,
    @Body(new ZodValidationPipe(AddMemberSchema))
    body: AddMemberDTO,
    @CurrentUser() user: { sub: string }
  ) {
    return ErrorHandler(() =>
      this.service.addMember(params.shopId, user.sub, body),
    );
  }

  @UseGuards(ShopMemberGuard)
  @MinRole("ADMIN")
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

  @UseGuards(ShopMemberGuard)
  @MinRole("ADMIN")
  @Get("/:memberId")
  findMember(
    @Param(new ZodValidationPipe(ShopMemberIdParamSchema))
    params: ShopMemberIdParamDTO,
  ) {
    return ErrorHandler(() =>
      this.service.findMember(params.shopId, params.memberId),
    );
  }

  @UseGuards(ShopMemberGuard)
  @MinRole("OWNER")
  @Patch("/:memberId")
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

  @UseGuards(ShopMemberGuard)
  @MinRole("OWNER")
  @Delete("/:memberId")
  deleteMember(
    @Param(new ZodValidationPipe(ShopMemberIdParamSchema))
    params: ShopMemberIdParamDTO,
    @CurrentUser() user: { sub: string }
  ) {
    return ErrorHandler(() =>
      this.service.deleteMember(params.shopId, params.memberId, user.sub),
    );
  }
}