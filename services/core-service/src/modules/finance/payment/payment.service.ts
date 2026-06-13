import {
    Injectable,
    BadRequestException,
    NotFoundException,
} from "@nestjs/common";
import {DatabaseService} from "../../../libs/database/database.service";
import {PaymentRepository} from "./payment.repository";
import {
    PaymentFailedPublisher,
} from "./publishers/payment-publishers";
import {
    CreateStripeIntentDto,
    ListPaymentsQueryDto,
    UpdatePaymentStatusDto,
} from "./payment.dto";
import {StripeService} from "./stripe.service";
import type {Request} from "express";
import {OutboxService} from "../../../infrastructure/outbox/outbox.service";
import {FINANCE_EVENTS} from "../shared/constants/finance-events.constants";

@Injectable()
export class PaymentService {
    constructor(
        private readonly db: DatabaseService,
        private readonly paymentRepo: PaymentRepository,
        private readonly failedPublisher: PaymentFailedPublisher,
        private readonly stripeService: StripeService,
        private readonly outbox: OutboxService
    ) {}

    async getPayments(query: ListPaymentsQueryDto, shopId?: string) {
        const [data, total] = await this.paymentRepo.findByShopIdAndFilters(
            shopId,
            query
        );

        return {
            data,
            meta: {
                total,
                page: query.page,
                limit: query.limit,
                lastPage: Math.ceil(total / query.limit),
            },
            message: "Payments retrieved successfully",
        };
    }

    async updatePaymentStatus(id: string, dto: UpdatePaymentStatusDto) {
        const payment = await this.paymentRepo.findById(id);
        if (!payment) throw new NotFoundException("Payment not found");

        if (payment.status === dto.status) {
            throw new BadRequestException(`Payment is already ${dto.status}`);
        }

        if (payment.status === "SUCCESS" && dto.status !== "REFUNDED") {
            throw new BadRequestException(
                "Cannot change status of a successful payment"
            );
        }

        const isSuccess = dto.status === "SUCCESS";
        const paidAt = isSuccess ? new Date() : undefined;

        const updated = await this.db.$transaction(async (tx) => {
            const p = await tx.payment.update({
                where: {id},
                data: {
                    status: dto.status as any,
                    ...(dto.transactionId && {
                        transactionId: dto.transactionId,
                    }),
                    ...(paidAt && {paidAt}),
                },
                include: {order: true},
            });

            if (isSuccess && p.order) {
                await this.creditSuccessfulPayment(tx, p);
                await this.createPaymentCompletedOutbox(
                    tx,
                    p,
                    p.transactionId
                );
            }

            if (dto.status === "EXPIRED" && p.order) {
                await tx.order.update({
                    where: {id: p.orderId},
                    data: {status: "CANCELLED"},
                });
            }

            return p;
        });

        if (!isSuccess) {
            await this.failedPublisher.publish({
                paymentId: updated.id,
                orderId: updated.orderId,
                shopId: updated.order.shopId,
                reason: `Payment manually updated to ${dto.status} by admin`,
            });
        }

        return {
            data: updated,
            message: `Payment status updated to ${dto.status}`,
        };
    }

    async createStripeIntent(userId: string, dto: CreateStripeIntentDto) {
        const order = await this.db.order.findFirst({
            where: {
                id: dto.orderId,
                userId,
            },
            include: {
                items: true,
                payment: true,
            },
        });

        if (!order) {
            throw new NotFoundException("Order not found");
        }

        if (order.status !== "PENDING") {
            throw new BadRequestException("Order is not payable");
        }

        if (order.payment?.status === "SUCCESS") {
            throw new BadRequestException("Order already paid");
        }

        const payment = order.payment;
        if (!payment) {
            throw new NotFoundException("Payment not found");
        }

        const grossAmount = this.toNumber(order.totalAmount);
        const currency = this.stripeService.currency;
        const session =
            await this.stripeService.stripe.checkout.sessions.create({
                mode: "payment",
                line_items: [
                    {
                        quantity: 1,
                        price_data: {
                            currency,
                            unit_amount: this.stripeService.toStripeAmount(
                                grossAmount,
                                currency
                            ),
                            product_data: {
                                name: `Order ${order.id}`,
                            },
                        },
                    },
                ],
                metadata: {
                    orderId: order.id,
                    paymentId: payment.id,
                    userId,
                    shopId: order.shopId,
                },
                payment_intent_data: {
                    metadata: {
                        orderId: order.id,
                        paymentId: payment.id,
                        userId,
                        shopId: order.shopId,
                    },
                },
                success_url: this.stripeService.successUrl,
                cancel_url: this.stripeService.cancelUrl,
                expires_at:
                    Math.floor(Date.now() / 1000) +
                    this.stripeService.checkoutExpiresHours * 3600,
            });

        const updated = await this.db.payment.update({
            where: {id: payment.id},
            data: {
                status: "PENDING",
                method: "STRIPE",
                transactionId: session.id,
                stripeCheckoutSessionId: session.id,
                stripePaymentIntentId:
                    typeof session.payment_intent === "string"
                        ? session.payment_intent
                        : session.payment_intent?.id,
                paymentUrl: session.url,
            },
        });

        return {
            data: {
                paymentId: updated.id,
                orderId: order.id,
                provider: "STRIPE",
                status: updated.status,
                totalAmount: Math.round(grossAmount),
                paymentUrl: session.url,
                checkoutSessionId: session.id,
                clientSecret: null,
            },
            message: "Stripe checkout session created",
        };
    }

    async handleStripeWebhook(
        request: Request & {rawBody?: Buffer},
        signature?: string
    ) {
        if (!signature) {
            throw new BadRequestException("Missing Stripe signature");
        }

        const payload =
            request.rawBody ?? Buffer.from(JSON.stringify(request.body));
        const event = this.stripeService.constructEvent(payload, signature);

        if (event.type === "checkout.session.completed") {
            const session = event.data.object as any;
            return this.applyStripeSuccess(session, "checkout_session");
        }

        if (event.type === "checkout.session.expired") {
            const session = event.data.object as any;
            return this.applyStripeFailure(session, "EXPIRED");
        }

        if (event.type === "payment_intent.succeeded") {
            const intent = event.data.object as any;
            return this.applyStripeSuccess(intent, "payment_intent");
        }

        if (event.type === "payment_intent.payment_failed") {
            const intent = event.data.object as any;
            return this.applyStripeFailure(intent, "FAILED");
        }

        if (event.type === "charge.refunded") {
            const charge = event.data.object as any;
            return this.applyStripeRefund(charge);
        }

        return {
            data: {received: true, type: event.type},
            message: "Stripe webhook ignored",
        };
    }

    private async applyStripeSuccess(
        payload: any,
        source: "checkout_session" | "payment_intent"
    ) {
        const payment = await this.findStripePayment(payload);
        if (!payment) {
            throw new NotFoundException("Payment not found");
        }

        if (payment.status === "SUCCESS" || payment.status === "REFUNDED") {
            return {
                data: {
                    received: true,
                    paymentId: payment.id,
                    status: payment.status,
                },
                message: "Stripe payment already processed",
            };
        }

        const paymentIntentId = this.extractPaymentIntentId(payload);
        const checkoutSessionId =
            source === "checkout_session"
                ? payload.id
                : payment.stripeCheckoutSessionId;

        const updated = await this.db.$transaction(async (tx) => {
            const current = await tx.payment.update({
                where: {id: payment.id},
                data: {
                    status: "SUCCESS",
                    transactionId:
                        checkoutSessionId || paymentIntentId || payload.id,
                    stripeCheckoutSessionId: checkoutSessionId,
                    stripePaymentIntentId: paymentIntentId,
                    method: "STRIPE",
                    paidAt: new Date(),
                },
                include: {order: {include: {items: true}}},
            });

            await this.creditSuccessfulPayment(tx, current);
            await this.createPaymentCompletedOutbox(
                tx,
                current,
                checkoutSessionId || paymentIntentId || payload.id
            );

            const cart = await tx.cart.findUnique({
                where: {userId: current.order.userId},
            });

            if (cart) {
                await tx.cartItem.deleteMany({
                    where: {
                        cartId: cart.id,
                        productId: {
                            in: current.order.items.map(
                                (item) => item.productId
                            ),
                        },
                    },
                });
            }

            return current;
        });

        return {
            data: {
                received: true,
                paymentId: updated.id,
                status: updated.status,
            },
            message: "Stripe payment succeeded",
        };
    }

    private async applyStripeFailure(
        payload: any,
        status: "FAILED" | "EXPIRED"
    ) {
        const payment = await this.findStripePayment(payload);
        if (!payment) {
            throw new NotFoundException("Payment not found");
        }

        if (payment.status === "SUCCESS" || payment.status === "REFUNDED") {
            return {
                data: {
                    received: true,
                    paymentId: payment.id,
                    status: payment.status,
                },
                message: "Stripe payment status unchanged",
            };
        }

        if (payment.status === status) {
            return {
                data: {
                    received: true,
                    paymentId: payment.id,
                    status: payment.status,
                },
                message: "Stripe payment already processed",
            };
        }

        const paymentIntentId = this.extractPaymentIntentId(payload);
        const checkoutSessionId =
            payload.object === "checkout.session"
                ? payload.id
                : payment.stripeCheckoutSessionId;

        const updated = await this.db.$transaction(async (tx) => {
            const current = await tx.payment.update({
                where: {id: payment.id},
                data: {
                    status: status as any,
                    transactionId:
                        checkoutSessionId || paymentIntentId || payload.id,
                    stripeCheckoutSessionId: checkoutSessionId,
                    stripePaymentIntentId: paymentIntentId,
                    method: "STRIPE",
                },
                include: {order: true},
            });

            if (status === "EXPIRED") {
                await tx.order.update({
                    where: {id: current.orderId},
                    data: {status: "CANCELLED"},
                });
            }

            return current;
        });

        await this.failedPublisher.publish({
            paymentId: updated.id,
            orderId: updated.orderId,
            shopId: updated.order.shopId,
            reason:
                payload.last_payment_error?.message ??
                `Stripe payment ${status.toLowerCase()}`,
        });

        return {
            data: {
                received: true,
                paymentId: updated.id,
                status: updated.status,
            },
            message: `Stripe payment ${status.toLowerCase()}`,
        };
    }

    private async applyStripeRefund(charge: any) {
        const paymentIntentId =
            typeof charge.payment_intent === "string"
                ? charge.payment_intent
                : charge.payment_intent?.id;
        if (!paymentIntentId) {
            return {
                data: {received: true},
                message: "Stripe refund has no payment intent",
            };
        }

        const payment =
            await this.paymentRepo.findByTransactionId(paymentIntentId);
        if (!payment) {
            throw new NotFoundException("Payment not found");
        }

        const updated = await this.db.$transaction(async (tx) => {
            const current = await tx.payment.update({
                where: {id: payment.id},
                data: {status: "REFUNDED"},
                include: {order: true},
            });

            await tx.order.update({
                where: {id: current.orderId},
                data: {status: "CANCELLED"},
            });

            const refund = await tx.refund.create({
                data: {
                    paymentId: current.id,
                    amount: this.toNumber(charge.amount_refunded ?? charge.amount ?? current.grossAmount),
                    reason: charge.refunds?.data?.[0]?.reason ?? "Stripe charge refunded",
                    status: "COMPLETED",
                },
            });

            await this.outbox.createEvent(tx, {
                eventType: FINANCE_EVENTS.PAYMENT_REFUNDED,
                routingKey: FINANCE_EVENTS.PAYMENT_REFUNDED,
                aggregateType: "payment",
                aggregateId: current.id,
                payload: {
                    paymentId: current.id,
                    orderId: current.orderId,
                    shopId: current.order.shopId,
                    userId: current.order.userId,
                    refundId: refund.id,
                    amount: this.toNumber(refund.amount),
                    reason: refund.reason,
                    refundedAt: new Date().toISOString(),
                    source: "core-service",
                    version: "1.0",
                },
            });

            return current;
        });

        return {
            data: {
                received: true,
                paymentId: updated.id,
                status: updated.status,
            },
            message: "Stripe charge refunded",
        };
    }

    private async findStripePayment(payload: any) {
        const paymentId = payload.metadata?.paymentId;
        const orderId = payload.metadata?.orderId;

        if (paymentId) {
            return this.db.payment.findUnique({
                where: {id: paymentId},
                include: {order: true},
            });
        }

        if (orderId) {
            return this.db.payment.findUnique({
                where: {orderId},
                include: {order: true},
            });
        }

        const ids = [payload.id, this.extractPaymentIntentId(payload)].filter(
            Boolean
        );

        for (const id of ids) {
            const payment = await this.paymentRepo.findByTransactionId(id);
            if (payment) return payment;
        }

        return null;
    }

    private async creditSuccessfulPayment(tx: any, payment: any) {
        await tx.order.update({
            where: {id: payment.orderId},
            data: {status: "PAID"},
        });

        const existingLedger = await tx.shopLedger.findFirst({
            where: {
                shopId: payment.order.shopId,
                reference: `PAYMENT_${payment.id}`,
            },
        });

        if (!existingLedger) {
            await tx.shopLedger.create({
                data: {
                    shopId: payment.order.shopId,
                    type: "CREDIT",
                    amount: payment.netAmount,
                    reference: `PAYMENT_${payment.id}`,
                    description: `Payment for order ${payment.orderId}`,
                },
            });

            await tx.shop.update({
                where: {id: payment.order.shopId},
                data: {balance: {increment: payment.netAmount}},
            });
        }
    }

    private async createPaymentCompletedOutbox(
        tx: any,
        payment: any,
        transactionId?: string | null
    ) {
        await this.outbox.createEvent(tx, {
            eventType: FINANCE_EVENTS.PAYMENT_COMPLETED,
            routingKey: FINANCE_EVENTS.PAYMENT_COMPLETED,
            aggregateType: "payment",
            aggregateId: payment.id,
            payload: {
            paymentId: payment.id,
            orderId: payment.orderId,
            shopId: payment.order.shopId,
            userId: payment.order.userId,
            grossAmount: this.toNumber(payment.grossAmount),
            gatewayFee: this.toNumber(payment.gatewayFee),
            marketplaceFee: this.toNumber(payment.marketplaceFee),
            netAmount: this.toNumber(payment.netAmount),
            method: payment.method,
            transactionId: transactionId ?? payment.transactionId,
            paidAt: (payment.paidAt ?? new Date()).toISOString(),
            source: "core-service",
            version: "1.0",
            },
        });
    }

    private extractPaymentIntentId(payload: any) {
        if (typeof payload.payment_intent === "string")
            return payload.payment_intent;
        if (payload.payment_intent?.id) return payload.payment_intent.id;
        if (payload.object === "payment_intent") return payload.id;
        return undefined;
    }

    private toNumber(value: unknown) {
        if (
            value &&
            typeof (value as {toNumber?: unknown}).toNumber === "function"
        ) {
            return (value as {toNumber: () => number}).toNumber();
        }

        return Number(value);
    }
}
