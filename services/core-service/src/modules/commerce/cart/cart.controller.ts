import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { ZodValidationPipe } from '../../../libs/pipes/zod-validation.pipe';
import ErrorHandler from '../../../libs/errors/handler.error';
import {
  AddCartItemSchema,
  type AddCartItemDto,
  UpdateCartItemSchema,
  type UpdateCartItemDto,
  CartItemParamSchema,
  type CartItemParamDto,
} from './cart.dto';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  getCart(@CurrentUser() user: UserLogin) {
    return ErrorHandler(() => this.cartService.getCart(user.sub));
  }

  @Post('items')
  addItem(
    @CurrentUser() user: UserLogin,
    @Body(new ZodValidationPipe(AddCartItemSchema)) dto: AddCartItemDto,
  ) {
    return ErrorHandler(() => this.cartService.addItem(user.sub, dto));
  }

  @Put('items/:productId')
  updateItem(
    @CurrentUser() user: UserLogin,
    @Param(new ZodValidationPipe(CartItemParamSchema)) params: CartItemParamDto,
    @Body(new ZodValidationPipe(UpdateCartItemSchema)) dto: UpdateCartItemDto,
  ) {
    return ErrorHandler(() =>
      this.cartService.updateItem(user.sub, params.productId, dto),
    );
  }

  @Delete('items/:productId')
  removeItem(
    @CurrentUser() user: UserLogin,
    @Param(new ZodValidationPipe(CartItemParamSchema)) params: CartItemParamDto,
  ) {
    return ErrorHandler(() =>
      this.cartService.removeItem(user.sub, params.productId),
    );
  }

  @Delete()
  clearCart(@CurrentUser() user: UserLogin) {
    return ErrorHandler(() => this.cartService.clearCart(user.sub));
  }
}
