import { Controller, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { EventPattern, Payload } from "@nestjs/microservices";
import CircuitBreaker from "opossum";
import { sendEmail } from "../../../common/utils/email";

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

  @EventPattern("email.send")
  async handleSendEmail(@Payload() data: unknown) {
    return this.breaker.fire(data);
  }
}