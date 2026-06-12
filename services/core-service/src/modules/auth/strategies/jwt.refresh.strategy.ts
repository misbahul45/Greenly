import {Injectable} from "@nestjs/common";
import {PassportStrategy} from "@nestjs/passport";
import {Strategy, ExtractJwt, StrategyOptionsWithRequest} from "passport-jwt";
import {ConfigService} from "@nestjs/config";
import {AuthRepository} from "../auth.repository";
import {Request} from "express";
import {AppError} from "../../../libs/errors/app.error";

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
    Strategy,
    "jwt-refresh"
) {
    constructor(
        private readonly config: ConfigService,
        private readonly repo: AuthRepository
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                (req: Request): string | null => {
                    const token = req.headers["x-refresh-token"];

                    if (Array.isArray(token)) {
                        return token[0] ?? null;
                    }

                    return token ?? null;
                },
            ]),
            secretOrKey: config.getOrThrow<string>("jwt.refresh.key"),
            ignoreExpiration: false,
            passReqToCallback: true,
        } satisfies StrategyOptionsWithRequest);
    }

    async validate(req: Request, payload: any) {
        const rawRefreshToken = req.headers["x-refresh-token"];

        const refreshToken = Array.isArray(rawRefreshToken)
            ? rawRefreshToken[0]
            : rawRefreshToken;

        if (!refreshToken) {
            throw new AppError("Refresh token missing", 401);
        }

        const user = await this.repo.checkUserById(payload.sub);

        if (!user) {
            throw new AppError("Unauthorized", 401);
        }

        return {
            sub: user.id,
            email: user.email,
            roles: payload.roles,
            refreshToken,
            status: user.status,
        };
    }
}
