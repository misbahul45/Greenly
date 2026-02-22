import {
  Controller,
  Post,
  Body,
  Get,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';

import {
  type LoginDTO,
  LoginSchema,
  type RegisterDTO,
  RegisterSchema,
  ForgotPasswordSchema,
  type ForgotPasswordDTO,
  ChangePasswordSchema,
  type ChangePasswordDTO,
  VerifyEmailSchema,
  type VerifyEmailDTO,
  VerifyPasswordSchema,
  type VerifyPasswordDTO,
} from './auth.dto';

import ErrorHandler from 'src/libs/errors/handler.error';
import { ZodValidationPipe } from 'src/libs/pipes/zod-validation.pipe';
import { Public } from './decorators/public.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { AuthTokenType } from '../../../generated/prisma/enums';
import { JwtRefreshGuard } from './guards/jwt.refresh.guard';
import { AppError } from '../../libs/errors/app.error';

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
  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  refresh(
    @CurrentUser() payload:UserLogin
  ) {
    return ErrorHandler(() =>{

      if(!payload.refreshToken){
        throw new AppError('Invalid refresh token', 403)
      }

        return this.authService.refresh(payload.refreshToken)
      }
    );
  }

  @Public()
  @Post('verify-email')
  verifyEmail(
    @Body(
      new ZodValidationPipe(VerifyEmailSchema)
    ) body: VerifyEmailDTO,
  ) {

    return ErrorHandler(() =>{
      const token = body.token
       const dto = VerifyEmailSchema.parse({ token })
        return this.authService.verify(dto, AuthTokenType.VERIFY_EMAIL)
      }
    )
  }

  @Public()
  @Post('verify-password')
  verifyPassword(
    @Body(
      new ZodValidationPipe(VerifyPasswordSchema)
    ) body: VerifyPasswordDTO,
  ) {

    return ErrorHandler(() =>{
      const token = body.token
       const dto = VerifyEmailSchema.parse({ token })
        return this.authService.verify(dto, AuthTokenType.RESET_PASSWORD)
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