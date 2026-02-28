import {
  Controller,
  OnModuleInit,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  EventPattern,
  Payload,
} from "@nestjs/microservices";
import CircuitBreaker from "opossum";

import { sendEmail } from "../../../common/utils/email";
import { type PayloadEmail } from "../../../common/types/event";
import { AppError } from "../../../libs/errors/app.error";

@Controller()
export class EmailConsume implements OnModuleInit {
  private breaker: CircuitBreaker;

  constructor(
    private readonly config: ConfigService
  ) {}

  onModuleInit() {
    this.breaker = new CircuitBreaker(
      async (emailData: any) => {
        return sendEmail(emailData);
      },
      {
        timeout: 5000,
        errorThresholdPercentage: 50,
        resetTimeout: 10000,
      }
    );

    this.breaker.on("open", () =>
      console.log("Circuit Breaker OPEN")
    );

    this.breaker.on("halfOpen", () =>
      console.log("Circuit Breaker HALF-OPEN")
    );

    this.breaker.on("close", () =>
      console.log("Circuit Breaker CLOSED")
    );

    this.breaker.fallback((data) => {
      console.log("Email saved for retry later:", data.email);
    });
  }

  @EventPattern("auth.user.registered")
  async sendVerificationOtp(
    @Payload() payload: PayloadEmail
  ) {
    console.log("Received event:", payload);

    const emailConfig = this.config.get("emailJs", { infer: true });

    if (!emailConfig) {
      throw new AppError("Email config not found", 500);
    }

    await this.breaker.fire({
      serviceId: emailConfig.serviceId,
      templateId: emailConfig.templates.verifyEmail,
      userId: emailConfig.userId,
      accessToken: emailConfig.accessToken,
      email: payload.email,
      name: payload.name,
      token: payload.otp,
      action: payload.action,
    });

    console.log("Verification email sent to:", payload.email);
  }

  @EventPattern("auth.user.password.reset.requested")
  async sendVerificationForgotPassword(
    @Payload() payload: PayloadEmail
  ) {
    const emailConfig = this.config.get("emailJs", { infer: true });

    if (!emailConfig) {
      throw new AppError("Email config not found", 500);
    }

    await this.breaker.fire({
      serviceId: emailConfig.serviceId,
      templateId: emailConfig.templates.verifyEmail,
      userId: emailConfig.userId,
      accessToken: emailConfig.accessToken,
      email: payload.email,
      name: payload.name,
      token: payload.otp,
      action: payload.action,
    });

    console.log("OTP reset sent to:", payload.email);
  }

  @EventPattern("auth.user.deleted")
  async sendDeletedOtp(
    @Payload() payload: PayloadEmail
  ) {
    console.log("Received event:", payload);

    const emailConfig = this.config.get("emailJs", { infer: true });

    if (!emailConfig) {
      throw new AppError("Email config not found", 500);
    }

    await this.breaker.fire({
      serviceId: emailConfig.serviceId,
      templateId: emailConfig.templates.verifyEmail,
      userId: emailConfig.userId,
      accessToken: emailConfig.accessToken,
      email: payload.email,
      name: payload.name,
      token: payload.otp,
      action: payload.action,
    });

    console.log("deleted email sent to:", payload.email);
  }
}