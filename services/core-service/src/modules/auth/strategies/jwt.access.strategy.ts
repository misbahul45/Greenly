import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthRepository } from '../auth.repository';
import { UserStatus } from '../../../../generated/prisma/enums';
import { AppError } from '../../../libs/errors/app.error';
import { Request } from 'express';

@Injectable()
export class JwtAccessStrategy extends PassportStrategy(Strategy, 'jwt-access') {
  constructor(
    private config: ConfigService,
    private repo: AuthRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get<string>('jwt.access.key') ?? 'default-secret',
      ignoreExpiration: false,
    });
  }

  async validate(req: Request,payload: any) {
    const accessToken = req.get('Authorization')?.replace('Bearer', '').trim();

    const user = await this.repo.checkUserById(payload.sub);

    if (!user) throw new AppError('User not found', 400);

    if (user.status !== UserStatus.ACTIVE) {
      throw new AppError('User inactive', 400);
    }

    if (user.deletedAt){
        throw new AppError('User deleted', 400)
    }

    return {
      id: user.id,
      email: user.email,
      roles: payload.roles,
      accessToken
    };
  }
}