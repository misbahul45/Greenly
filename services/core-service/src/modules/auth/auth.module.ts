import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService, ConfigModule } from '@nestjs/config';
import { StringValue } from 'ms';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AuthRepository } from './auth.repository';
import { EmailConsume } from './consumer/email.consume';
import { UserRegisteredPublisher } from './publisher/user_registered.publisher';
import { UserLoginPublisher } from './publisher/user_login.publisher';
import { UserVerifiedPublisher } from './publisher/user_verified.publisher';
import { UserForgotPasswordPublisher } from './publisher/user_forgot_password.publisher';
import { JwtRefreshStrategy } from './strategies/jwt.refresh.strategy';
import { JwtAccessStrategy } from './strategies/jwt.access.strategy';

@Module({
  imports: [
    ConfigModule, 
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret:
          config.get<string>('jwt.access.key') ?? 'default-secret',
        signOptions: {
          expiresIn: config.get<string>('jwt.access.duration') as unknown as StringValue
        },
      }),
    })
  ],

  controllers: [AuthController, EmailConsume],

  providers: [
    AuthRepository,
    AuthService,
    UserRegisteredPublisher,
    UserLoginPublisher,
    UserVerifiedPublisher,
    UserForgotPasswordPublisher,
    JwtAccessStrategy,
    JwtRefreshStrategy
  ],

  exports: [AuthService],
})
export class AuthModule {}