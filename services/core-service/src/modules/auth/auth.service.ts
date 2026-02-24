import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ChangePasswordDTO, GenerateTokensDTO, GenerateTokensSchema, VerifyEmailDTO, type LoginDTO, type RegisterDTO } from './auth.dto';
import { AuthRepository } from './auth.repository';
import { AppError } from '../../libs/errors/app.error';
import * as bcrypt from 'bcrypt'
import { ConfigService } from '@nestjs/config';
import { sendEmail } from '../../common/utils/email';
import { generateOtp, hashValue } from '../../common/utils/crypto';
import { JwtService } from '@nestjs/jwt';
import { StringValue } from 'ms';
import { AuthTokenType } from '../../../generated/prisma/enums';

@Injectable()
export class AuthService {
  constructor(
    private readonly repo:AuthRepository,
    private readonly config:ConfigService,
    private readonly jwt:JwtService
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

    await sendEmail({
      serviceId: emailConfig.serviceId,
      templateId: emailConfig.templates.verifyEmail,
      userId: emailConfig.userId,     
      accessToken: emailConfig.accessToken,
      email: dto.email,
      name: dto.name,
      token: data.payload.otp,
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

  async verify(dto:VerifyEmailDTO, type:AuthTokenType){
    const hashedOtp = hashValue(dto.token);
    const findToken=await this.repo.findAuthToken(hashedOtp, AuthTokenType.VERIFY_EMAIL)

    if (!findToken) {
      throw new AppError(
        "Token verification not found",
        404
      );
    }

    if (findToken.expiresAt < new Date()) {
      throw new AppError(
        "Token has expired",
        400
      );
    }

    if (findToken.usedAt) {
      throw new AppError(
        "Token already used",
        400
      );
    }

    if (findToken.type !== type) {
      throw new AppError(
        "Invalid token type",
        400
      );
    }

    const user=await this.repo.verifyEmail(findToken.userId)

    await this.repo.markTokenUsed(findToken.id)

    const payloadJWT={
      sub:user.id,
      email:user.email,
      roles:user.roles.map((role)=>role.role.name)
    }

    const {accessToken, refreshToken}=await this.generateTokens(payloadJWT)
    
    const decoded = this.jwt.decode(refreshToken) as any;

    const expiresAt = new Date(decoded.exp * 1000);

    await this.repo.saveToken({
      userId:user.id,
      token:refreshToken,
      expiresAt,
      tokenType:AuthTokenType.REFRESH_TOKEN
    })

    return {
        message: "Email verified successfully",
        data:{
          user:{
            id: user.id,
            email:user.email,
            name: user.profile?.fullName,
          },
          tokens:{
            accessToken,
            refreshToken
          }
        },
    }
  }

  async generateTokens(payload: GenerateTokensDTO) {

    const data = GenerateTokensSchema.parse(payload);

    const accessSecret = this.config.get<string>('jwt.access.key')!;
    const refreshSecret = this.config.get<string>('jwt.refresh.key')!;

    const accessExpires = this.config.get<string>('jwt.access.duration')!;
    const refreshExpires = this.config.get<string>('jwt.refresh.duration')!;

    const accessToken = await this.jwt.signAsync(
      {
        sub: data.sub,
        email: data.email,
        roles: data.roles,
      },
      {
        secret: accessSecret,
        expiresIn: (accessExpires as StringValue),
      },
    );

    const refreshToken = await this.jwt.signAsync(
      {
        sub: data.sub,
        email: data.email,
        roles: data.roles,
      },
      {
        secret: refreshSecret,
        expiresIn: (refreshExpires as StringValue),
      },
    );

    return {
      accessToken,
      refreshToken,
    };
  }

  async login(dto: LoginDTO) {
    const existedUser = await this.repo.checkUserByEmail(dto.email);

    if (!existedUser) {
      throw new AppError('Invalid email or password', 401);
    }

    if (!existedUser.emailVerified) {
      throw new AppError('Your email is not verified. Please verify to continue.', 403);
    }

    const isPasswordValid = await bcrypt.compare(dto.password, existedUser.passwordHash);

    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401);
    }
    const payloadJWT={
      sub:existedUser.id,
      email:existedUser.email,
      roles:existedUser.roles.map((role)=>role.role.name)
    }

    const {accessToken, refreshToken}=await this.generateTokens(payloadJWT)
    
    const decoded = this.jwt.decode(refreshToken) as any;

    const expiresAt = new Date(decoded.exp * 1000);

    await this.repo.saveToken({
      userId:existedUser.id,
      token:refreshToken,
      expiresAt,
      tokenType:AuthTokenType.REFRESH_TOKEN
    })

    return {
      accessToken,
      refreshToken,
    };
  }

  async refresh(token: string) {
    const findAuthToken=await this.repo.findAuthToken(token, AuthTokenType.REFRESH_TOKEN)

    if(!findAuthToken){
      throw new AppError('Invalid refresh token', 404)
    }

    if(findAuthToken.expiresAt < new Date()){
      throw new AppError('Refresh token already expired', 400)
    }

    const user=await this.repo.checkUserById(findAuthToken.userId)

    if(!user){
      throw new AppError('User not found', 404)
    }

    const payloadJWT={
      sub:user.id,
      email:user.email,
      roles:user.roles.map((role)=>role.role.name)
    }

    const {accessToken, refreshToken}=await this.generateTokens(payloadJWT)
    
    const decoded = this.jwt.decode(refreshToken) as any;

    const expiresAt = new Date(decoded.exp * 1000);

    await this.repo.saveToken({
      userId:user.id,
      token:refreshToken,
      expiresAt,
      tokenType:AuthTokenType.REFRESH_TOKEN
    })

    await this.repo.markTokenUsed(findAuthToken.id)
    return {
      accessToken,
      refreshToken
    };
  }

  async forgotPassword(email: string) {
    const existedUser=await this.repo.checkUserByEmail(email)

    if(!existedUser){
      throw new AppError('User not found', 404)
    }

    if(!existedUser.emailVerified){
      throw new AppError('Your email is not verified. Please verify to continue.', 403);
    }

    const emailConfig = this.config.get('emailJs', { infer: true });

    if (!emailConfig) {
      throw new Error('Email config not found');
    }

    const rawOtp = generateOtp();
    const hashedOtp = hashValue(rawOtp);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await sendEmail({
      serviceId: emailConfig.serviceId,
      templateId: emailConfig.templates.verifyEmail,
      userId: emailConfig.userId,     
      accessToken: emailConfig.accessToken,
      email: existedUser.email,
      name: existedUser.profile?.fullName || 'Anonymus',
      token: rawOtp,
    });

    await this.repo.saveToken({
      userId:existedUser.id,
      token:hashedOtp,
      expiresAt,
      tokenType:AuthTokenType.RESET_PASSWORD
    })


    return {
      message: `Password reset sent to ${email}`,
    };
  }

  async changePassword(dto: ChangePasswordDTO) {
    const findToken=await this.repo.findOTPToken(dto.tokenId, AuthTokenType.RESET_PASSWORD)

    if(!findToken){
      throw new AppError('Token not found', 404)
    }

    if(!findToken.usedAt){
      throw new AppError('Token did not verified', 400)
    }

    const passwordHash=await bcrypt.hash(dto.newPassword, 10)

    const user=await this.repo.changePassword(findToken.userId, passwordHash)
    return {
      message: 'Password changed successfully',
      data:{
        id: user.id,
        email:user.email,
      },
    };
  }

  async logout() {
    return {
      message: 'Logged out successfully',
    };
  }
}