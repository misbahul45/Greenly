import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { StringValue } from 'ms';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AuthRepository } from './auth.repository';
import { EmailConsumer } from './consumer/email.consume';
import { UserRegisteredPublisher } from './publisher/user_registered.publisher';
import { UserLoginPublisher } from './publisher/user_login.publisher';
import { UserForgotPasswordPublisher } from './publisher/user_forgot_password.publisher';
import { JwtRefreshStrategy } from './strategies/jwt.refresh.strategy';
import { JwtAccessStrategy } from './strategies/jwt.access.strategy';
import { UserResendTokenPublisher } from './publisher/user_resend_token.publisher';
import { PassportModule } from '@nestjs/passport';

function validateJwtSecrets(config: ConfigService) {
  const accessKey = config.get<string>('jwt.access.key');
  const refreshKey = config.get<string>('jwt.refresh.key');
  if (!accessKey || accessKey.length < 32) {
    throw new Error('JWT access secret key must be configured and at least 32 characters');
  }
  if (!refreshKey || refreshKey.length < 32) {
    throw new Error('JWT refresh secret key must be configured and at least 32 characters');
  }
}

@Module({
  imports: [
    ConfigModule,
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        validateJwtSecrets(config);
        const accessTokenExpires = config.get<string>('jwt.access.duration');
        return {
          secret: config.get<string>('jwt.access.key'),
          signOptions: {
            expiresIn: (accessTokenExpires || '30d') as unknown as StringValue,
          },
        };
      },
    }),
  ],

  controllers: [AuthController, EmailConsumer],

  providers: [
    AuthRepository,
    AuthService,
    UserRegisteredPublisher,
    UserLoginPublisher,
    UserForgotPasswordPublisher,
    UserResendTokenPublisher,
    JwtAccessStrategy,
    JwtRefreshStrategy,
  ],

  exports: [AuthService],
})
export class AuthModule {}