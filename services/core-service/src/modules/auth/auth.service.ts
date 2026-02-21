import { Injectable, UnauthorizedException } from '@nestjs/common';
import { type LoginDTO, type RegisterDTO } from './auth.dto';
import { AuthRepository } from './auth.repository';
import { AppError } from '../../libs/errors/app.error';
import * as bcrypt from 'bcrypt'
import { ConfigService } from '@nestjs/config';
import { sendEmail } from '../../common/utils/email';

@Injectable()
export class AuthService {
  constructor(
    private readonly repo:AuthRepository,
    private readonly config:ConfigService
  ){}

  async register(dto: RegisterDTO) {
    const existedUser = await this.repo.checkUserByEmail(dto.email);

    if (existedUser) {
      throw new AppError('Account already existed', 400);
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const data = await this.repo.registerUser({
      ...dto,
      password: hashedPassword,
    });

    const emailConfig = this.config.get('emailJs', { infer: true });

    if (!emailConfig) {
      throw new Error('Email config not found');
    }

    const apiUrl = this.config.get<string>('API_URL');

    await sendEmail({
      serviceId: emailConfig.serviceId,
      templateId: emailConfig.templates.verifyEmail,
      publicKey: emailConfig.publicKey,
      email: dto.email,
      name: dto.name,
      token: data.payload.otp,
      link: `${apiUrl}/auth/verify`,
    });

    return {
      message: 'User registered',
      data: {
        id: data.user.id,
        email: data.user.email,
        name: dto.name,
      },
    };
  }

  async login(dto: LoginDTO) {
    if (!dto?.email || !dto?.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return {
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    };
  }

  async refresh(token: string) {
    if (!token) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    return {
      accessToken: 'new-access-token',
    };
  }

  async forgotPassword(email: string) {
    return {
      message: `Password reset link sent to ${email}`,
    };
  }

  async resetPassword(dto: any) {
    return {
      message: 'Password has been reset',
    };
  }

  async me() {
    return {
      id: 1,
      email: 'user@example.com',
    };
  }

  async changePassword(dto: any) {
    return {
      message: 'Password changed successfully',
    };
  }

  async logout() {
    return {
      message: 'Logged out successfully',
    };
  }
}