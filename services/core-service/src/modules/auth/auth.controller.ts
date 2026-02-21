import {
  Controller,
  Post,
  Body,
  Get,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

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
} from './auth.dto';

import ErrorHandler from 'src/libs/errors/handler.error';
import { ZodValidationPipe } from 'src/libs/pipes/zod-validation.pipe';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(
    @Body(new ZodValidationPipe(RegisterSchema)) dto: RegisterDTO
  ) {
    return ErrorHandler(async() => this.authService.register(dto));
  }

  @Post('login')
  login(
    @Body(new ZodValidationPipe(LoginSchema)) dto: LoginDTO
  ) {
    return ErrorHandler(() => this.authService.login(dto));
  }

  @Post('refresh')
  refresh(
    @Body(new ZodValidationPipe(RefreshTokenSchema))
    dto: RefreshTokenDTO
  ) {
    return ErrorHandler(() =>
      this.authService.refresh(dto.refreshToken)
    );
  }

  @Post('verify')
  Verify(
    dto: any
  ) {
    return ErrorHandler(() =>
      this.authService.refresh(dto.refreshToken)
    );
  }

  @Post('forgot-password')
  forgotPassword(
    @Body(new ZodValidationPipe(ForgotPasswordSchema))
    dto: ForgotPasswordDTO
  ) {
    return ErrorHandler(() =>
      this.authService.forgotPassword(dto.email)
    );
  }

  @Post('reset-password')
  resetPassword(
    @Body(new ZodValidationPipe(ResetPasswordSchema))
    dto: ResetPasswordDTO
  ) {
    return ErrorHandler(() =>
      this.authService.resetPassword(dto)
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me() {
    return ErrorHandler(() => this.authService.me());
  }

  @UseGuards(JwtAuthGuard)
  @Patch('change-password')
  changePassword(
    @Body(new ZodValidationPipe(ChangePasswordSchema))
    dto: ChangePasswordDTO
  ) {
    return ErrorHandler(() =>
      this.authService.changePassword(dto)
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  logout() {
    return ErrorHandler(() => this.authService.logout());
  }
}