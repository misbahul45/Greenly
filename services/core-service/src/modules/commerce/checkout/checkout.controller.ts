import { Controller, Post, Body } from '@nestjs/common';
import { CheckoutService } from './checkout.service';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { ZodValidationPipe } from '../../../libs/pipes/zod-validation.pipe';
import ErrorHandler from '../../../libs/errors/handler.error';
import { CheckoutSchema, type CheckoutDto } from './checkout.dto';

@Controller('checkout')
export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService) {}

  @Post()
  checkout(
    @CurrentUser() user: UserLogin,
    @Body(new ZodValidationPipe(CheckoutSchema)) dto: CheckoutDto,
  ) {
    return ErrorHandler(() => this.checkoutService.checkout(user.sub, dto));
  }   
}
