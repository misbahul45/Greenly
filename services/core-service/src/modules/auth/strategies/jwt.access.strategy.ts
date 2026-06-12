import {Injectable} from "@nestjs/common";
import {PassportStrategy} from "@nestjs/passport";
import {Strategy, ExtractJwt, StrategyOptionsWithRequest} from "passport-jwt";
import {ConfigService} from "@nestjs/config";
import {AuthRepository} from "../auth.repository";
import {UserStatus} from "../../../../generated/prisma/enums";
import {AppError} from "../../../libs/errors/app.error";
import {Request} from "express";

@Injectable()
export class JwtAccessStrategy extends PassportStrategy(
    Strategy,
    "jwt-access"
) {
    constructor(
        private readonly config: ConfigService,
        private readonly repo: AuthRepository
    ) {
        const options: StrategyOptionsWithRequest = {
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: config.getOrThrow<string>("jwt.access.key"),
            ignoreExpiration: false,
            passReqToCallback: true,
        };

        super(options);
    }

    async validate(req: Request, payload: any) {
        const accessToken = req
            .get("Authorization")
            ?.replace(/^Bearer\s+/i, "")
            .trim();

        if (!accessToken) {
            throw new AppError("Unauthorized", 401);
        }

        const user = await this.repo.checkUserById(payload.sub);

        if (!user) {
            throw new AppError("User not found", 400);
        }

        if (user.status !== UserStatus.ACTIVE) {
            throw new AppError("User inactive", 400);
        }

        if (user.deletedAt) {
            throw new AppError("User deleted", 400);
        }

        return {
            sub: user.id,
            email: user.email,
            roles: payload.roles,
            accessToken,
        };
    }
}
