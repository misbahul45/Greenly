import {
  Controller,
  Post,
  Body,
  Get,
  Patch,
  UseGuards,
  Query,
} from '@nestjs/common';
import { AuthService } from './auth.service';

import {
  type LoginDTO,
  LoginSchema,
  type RegisterDTO,
  RegisterSchema,
  RefreshTokenSchema,
  type RefreshTokenDTO,
  ForgotPasswordSchema,
  type ForgotPasswordDTO,
  ResetPasswordSchema,
  type ResetPasswordDTO,
  ChangePasswordSchema,
  type ChangePasswordDTO,
  VerifyEmailSchema,
  type VerifyEmailDTO,
} from './auth.dto';

import ErrorHandler from 'src/libs/errors/handler.error';
import { ZodValidationPipe } from 'src/libs/pipes/zod-validation.pipe';
import { Public } from './decorators/public.decorator';
import { CurrentUser } from './decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  
  @Public()
  @Post('register')
  register(
    @Body(new ZodValidationPipe(RegisterSchema)) dto: RegisterDTO
  ) {
    return ErrorHandler(async() => this.authService.register(dto));
  }

  @Public()
  @Post('login')
  login(
    @Body(new ZodValidationPipe(LoginSchema)) dto: LoginDTO
  ) {
    return ErrorHandler(() => this.authService.login(dto));
  }

  @Public()
  @Post('refresh')
  refresh(
    @Body(new ZodValidationPipe(RefreshTokenSchema))
    dto: RefreshTokenDTO
  ) {
    return ErrorHandler(() =>
      this.authService.refresh(dto.refreshToken)
    );
  }

  @Public()
  @Post('verify-email')
  verify(
    @Body(
      new ZodValidationPipe(VerifyEmailSchema)
    ) body: VerifyEmailDTO,
  ) {

    return ErrorHandler(() =>{
      const token = body.token
       const dto = VerifyEmailSchema.parse({ token })
        return this.authService.verifyEmail(dto)
      }
    )
  }

  @Public()
  @Post('forgot-password')
  forgotPassword(
    @Body(new ZodValidationPipe(ForgotPasswordSchema))
    dto: ForgotPasswordDTO
  ) {
    return ErrorHandler(() =>
      this.authService.forgotPassword(dto.email)
    );
  }

  @Public()
  @Post('reset-password')
  resetPassword(
    @Body(new ZodValidationPipe(ResetPasswordSchema))
    dto: ResetPasswordDTO
  ) {
    return ErrorHandler(() =>
      this.authService.resetPassword(dto)
    );
  }

  @Get('me')
  me(
    @CurrentUser() user:UserLogin
  ) {
    return ErrorHandler(() => this.authService.me(user));
  }

  @Patch('change-password')
  changePassword(
    @Body(new ZodValidationPipe(ChangePasswordSchema))
    dto: ChangePasswordDTO
  ) {
    return ErrorHandler(() =>
      this.authService.changePassword(dto)
    );
  }

  @Post('logout')
  logout() {
    return ErrorHandler(() => this.authService.logout());
  }
}