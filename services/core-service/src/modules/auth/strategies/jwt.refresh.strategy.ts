import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthRepository } from '../auth.repository';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    private config: ConfigService,
    private repo: AuthRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get<string>('jwt.refresh.key') ?? 'default-refresh-secret',
      ignoreExpiration: false,
    });
  }

  async validate(payload: any) {
    const user = await this.repo.checkUserById(payload.sub);

    if (!user) throw new UnauthorizedException();

    return {
      id: user.id,
      email: user.email,
      roles: payload.roles,
    };
  }
}