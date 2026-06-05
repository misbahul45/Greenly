import {Module} from "@nestjs/common";
import {PaymentController, StripePaymentController} from "./payment.controller";
import {PaymentService} from "./payment.service";
import {PaymentRepository} from "./payment.repository";
import {
    PaymentCompletedPublisher,
    PaymentFailedPublisher,
} from "./publishers/payment-publishers";
import {StripeService} from "./stripe.service";

@Module({
    controllers: [PaymentController, StripePaymentController],
    providers: [
        PaymentService,
        PaymentRepository,
        StripeService,
        PaymentCompletedPublisher,
        PaymentFailedPublisher,
    ],
    exports: [PaymentService, PaymentRepository, StripeService],
})
export class PaymentModule {}
