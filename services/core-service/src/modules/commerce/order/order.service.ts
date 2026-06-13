import {
    Injectable,
    NotFoundException,
    BadRequestException,
} from "@nestjs/common";
import {DatabaseService} from "../../../libs/database/database.service";
import {OrderRepository} from "./order.repository";
import {
    OrderQueryDto,
    UpdateOrderStatusDto,
    PaymentCallbackDto,
    CreateRefundDto,
} from "./dto/order.dto";
import {OrderStatusChangedPublisher} from "./publishers/order-status-changed.publisher";
import {RefundProcessedPublisher} from "./publishers/refund-processed.publisher";
import {OutboxService} from "../../../infrastructure/outbox/outbox.service";
import {FINANCE_EVENTS} from "../../finance/shared/constants/finance-events.constants";

const VALID_TRANSITIONS: Record<string, string[]> = {
    PENDING: ["PAID", "CANCELLED"],
    PAID: ["PROCESSING", "CANCELLED"],
    PROCESSING: ["SHIPPED", "CANCELLED"],
    SHIPPED: ["COMPLETED"],
    COMPLETED: [],
    CANCELLED: [],
};

@Injectable()
export class OrderService {
    constructor(
        private readonly db: DatabaseService,
        private readonly orderRepo: OrderRepository,
        private readonly orderStatusChangedPublisher: OrderStatusChangedPublisher,
        private readonly refundProcessedPublisher: RefundProcessedPublisher,
        private readonly outbox: OutboxService
    ) {}

    async findMyOrders(userId: string, query: OrderQueryDto) {
        const {page, limit, status} = query;
        const skip = (page - 1) * limit;

        const {data, total} = await this.orderRepo.findByUser(userId, {
            skip,
            take: limit,
            status,
        });

        return {
            data: data.map(this.mapOrderToResponse),
            meta: {
                total,
                page,
                limit,
                lastPage: Math.ceil(total / limit),
            },
            message: "Orders retrieved successfully",
        };
    }

    async findShopOrders(shopId: string, query: OrderQueryDto) {
        const {page, limit, status} = query;
        const skip = (page - 1) * limit;

        const {data, total} = await this.orderRepo.findByShop(shopId, {
            skip,
            take: limit,
            status,
        });

        return {
            data: data.map(this.mapOrderToResponse),
            meta: {
                total,
                page,
                limit,
                lastPage: Math.ceil(total / limit),
            },
            message: "Shop orders retrieved successfully",
        };
    }

    async findById(orderId: string) {
        const order = await this.orderRepo.findById(orderId);
        if (!order) {
            throw new NotFoundException(`Order ${orderId} not found`);
        }

        return {
            data: this.mapOrderToResponse(order),
            message: "Order retrieved successfully",
        };
    }

    async updateStatus(orderId: string, dto: UpdateOrderStatusDto) {
        const order = await this.orderRepo.findById(orderId);
        if (!order) {
            throw new NotFoundException(`Order ${orderId} not found`);
        }

        const allowedTargets = VALID_TRANSITIONS[order.status] ?? [];
        if (!allowedTargets.includes(dto.status)) {
            throw new BadRequestException(
                `Cannot transition order from ${order.status} to ${dto.status}`
            );
        }

        const updated = await this.orderRepo.updateStatus(orderId, dto.status);

        await this.orderStatusChangedPublisher.publish({
            orderId,
            previousStatus: order.status,
            newStatus: dto.status,
            timestamp: new Date().toISOString(),
        });

        return {
            data: {orderId: updated.id, status: updated.status},
            message: "Order status updated",
        };
    }

    async handlePaymentCallback(dto: PaymentCallbackDto) {
        const order = await this.orderRepo.findById(dto.orderId);
        if (!order) {
            throw new NotFoundException(`Order ${dto.orderId} not found`);
        }

        if (!order.payment) {
            throw new NotFoundException(
                `Payment for order ${dto.orderId} not found`
            );
        }

        const paymentStatus = dto.status === "SUCCESS" ? "SUCCESS" : "FAILED";
        const orderStatus = dto.status === "SUCCESS" ? "PAID" : "CANCELLED";

        await this.db.$transaction(async (tx) => {
            const payment = await tx.payment.update({
                where: {orderId: dto.orderId},
                data: {
                    status: paymentStatus as any,
                    transactionId: dto.transactionId,
                    method: dto.method,
                    paidAt:
                        dto.status === "SUCCESS"
                            ? new Date(dto.paidAt ?? Date.now())
                            : null,
                },
                include: {order: true},
            });

            await tx.order.update({
                where: {id: dto.orderId},
                data: {status: orderStatus as any},
            });

            await this.outbox.createEvent(tx, {
                eventType:
                    dto.status === "SUCCESS"
                        ? FINANCE_EVENTS.PAYMENT_COMPLETED
                        : FINANCE_EVENTS.PAYMENT_FAILED,
                routingKey:
                    dto.status === "SUCCESS"
                        ? FINANCE_EVENTS.PAYMENT_COMPLETED
                        : FINANCE_EVENTS.PAYMENT_FAILED,
                aggregateType: "payment",
                aggregateId: payment.id,
                payload:
                    dto.status === "SUCCESS"
                        ? {
                              paymentId: payment.id,
                              orderId: dto.orderId,
                              shopId: order.shopId,
                              userId: order.userId,
                              grossAmount: Number(dto.grossAmount),
                              gatewayFee: Number(payment.gatewayFee),
                              marketplaceFee: Number(payment.marketplaceFee),
                              netAmount: Number(payment.netAmount),
                              method: dto.method,
                              transactionId: dto.transactionId,
                              paidAt: new Date(
                                  dto.paidAt ?? Date.now()
                              ).toISOString(),
                              source: "core-service",
                              version: "1.0",
                          }
                        : {
                              paymentId: payment.id,
                              orderId: dto.orderId,
                              shopId: order.shopId,
                              userId: order.userId,
                              reason: `Payment ${dto.status}`,
                              timestamp: new Date().toISOString(),
                              source: "core-service",
                              version: "1.0",
                          },
            });
        });

        await this.orderStatusChangedPublisher.publish({
            orderId: dto.orderId,
            previousStatus: order.status,
            newStatus: orderStatus,
            timestamp: new Date().toISOString(),
        });

        return {
            data: {orderId: dto.orderId, paymentStatus, orderStatus},
            message: "Payment callback processed",
        };
    }

    async createRefund(dto: CreateRefundDto) {
        const payment = await this.db.payment.findUnique({
            where: {id: dto.paymentId},
        });

        if (!payment) {
            throw new NotFoundException(`Payment ${dto.paymentId} not found`);
        }

        if (payment.status !== "SUCCESS") {
            throw new BadRequestException(
                "Refund can only be made on successful payments"
            );
        }

        const refund = await this.db.refund.create({
            data: {
                paymentId: dto.paymentId,
                amount: parseFloat(dto.amount),
                reason: dto.reason,
                status: "PENDING",
            },
        });

        await this.refundProcessedPublisher.publish({
            refundId: refund.id,
            paymentId: dto.paymentId,
            amount: dto.amount,
            status: refund.status,
            timestamp: new Date().toISOString(),
        });

        return {
            data: {
                id: refund.id,
                paymentId: refund.paymentId,
                amount: refund.amount,
                status: refund.status,
                reason: refund.reason,
                createdAt: refund.createdAt,
            },
            message: "Refund request created",
        };
    }

    private mapOrderToResponse(order: any) {
        return {
            id: order.id,
            userId: order.userId,
            shopId: order.shopId,
            shopName: order.shopName,
            totalAmount: order.totalAmount,
            status: order.status,
            createdAt: order.createdAt,
            items: order.items?.map((item: any) => ({
                id: item.id,
                productId: item.productId,
                productName: item.productName,
                price: item.price,
                quantity: item.quantity,
            })),
            payment: order.payment
                ? {
                      id: order.payment.id,
                      status: order.payment.status,
                      method: order.payment.method,
                      provider: order.payment.method,
                      grossAmount: order.payment.grossAmount,
                      netAmount: order.payment.netAmount,
                      paymentUrl: order.payment.paymentUrl,
                      checkoutSessionId: order.payment.stripeCheckoutSessionId,
                      stripePaymentIntentId:
                          order.payment.stripePaymentIntentId,
                      paidAt: order.payment.paidAt,
                  }
                : null,
        };
    }
}
