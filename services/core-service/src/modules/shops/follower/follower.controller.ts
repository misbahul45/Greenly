import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from "@nestjs/common";
import { ZodValidationPipe } from "../../../libs/pipes/zod-validation.pipe";
import ErrorHandler from "../../../libs/errors/handler.error";
import { FollowerService } from "./follower.service";
import { CurrentUser } from "../../auth/decorators/current-user.decorator";
import {
  FollowerShopIdParamSchema,
  type FollowerShopIdParamDTO,
  FollowerQuerySchema,
  type FollowerQueryDTO,
  MyFollowingQuerySchema,
  type MyFollowingQueryDTO,
} from "./follower.dto";

@Controller()
export class FollowerController {
  constructor(private readonly service: FollowerService) {}

  @Post("/follow")
  follow(
    @Param(new ZodValidationPipe(FollowerShopIdParamSchema))
    params: FollowerShopIdParamDTO,
    @CurrentUser() user: UserLogin,
  ) {
    return ErrorHandler(() =>
      this.service.follow(user.sub, params.shopId),
    );
  }

  @Delete("/follow")
  unfollow(
    @Param(new ZodValidationPipe(FollowerShopIdParamSchema))
    params: FollowerShopIdParamDTO,
    @CurrentUser() user: UserLogin,
  ) {
    return ErrorHandler(() =>
      this.service.unfollow(user.sub, params.shopId),
    );
  }

  @Get("/followers")
  findFollowers(
    @Param(new ZodValidationPipe(FollowerShopIdParamSchema))
    params: FollowerShopIdParamDTO,
    @Query(new ZodValidationPipe(FollowerQuerySchema))
    query: FollowerQueryDTO,
  ) {
    return ErrorHandler(() =>
      this.service.findFollowers(params.shopId, query),
    );
  }

  @Get("/following")
  findFollowing(
    @CurrentUser() user: UserLogin,
    @Query(new ZodValidationPipe(MyFollowingQuerySchema))
    query: MyFollowingQueryDTO,
  ) {
    return ErrorHandler(() =>
      this.service.findFollowing(user.sub, query),
    );
  }
}
