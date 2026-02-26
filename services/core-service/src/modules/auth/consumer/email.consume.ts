import { Controller } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { EventPattern, Payload } from "@nestjs/microservices";
import { sendEmail } from "../../../common/utils/email";
import { type PayloadEmail } from "../types/event";
import { AppError } from "../../../libs/errors/app.error";

@Controller()
export class EmailConsume {
  constructor(
    private readonly config: ConfigService
  ) {}

  @EventPattern('auth.user.registered')
  async sendVerificationOtp(
    @Payload() payload: PayloadEmail
  ) {
    const emailConfig = this.config.get('emailJs', { infer: true });

    if (!emailConfig) {
      throw new AppError('Email config not found', 500);
    }

    await sendEmail({
      serviceId: emailConfig.serviceId,
      templateId: emailConfig.templates.verifyEmail,
      userId: emailConfig.userId,
      accessToken: emailConfig.accessToken,

      email: payload.email,
      name: payload.name,
      token: payload.otp,      
      action: payload.action,
    });

    console.log("📧 Verification email sent to:", payload.email);
  }


  @EventPattern('auth.user.password.reset.requested')
  async sendVerificationForgotPassword(
        @Payload() payload: PayloadEmail
  ){
    const emailConfig = this.config.get('emailJs', { infer: true });

    if (!emailConfig) {
      throw new AppError('Email config not found', 500);
    }

    await sendEmail({
      serviceId: emailConfig.serviceId,
      templateId: emailConfig.templates.verifyEmail,
      userId: emailConfig.userId,     
      accessToken: emailConfig.accessToken,
      email: payload.email,
      name: payload.name,
      token: payload.otp,
      action:payload.action
    });

    console.log("📧otp reset, sent to:", payload.email);

  }
}