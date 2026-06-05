import {
    Injectable,
    NotFoundException,
    BadRequestException,
} from "@nestjs/common";
import {DatabaseService} from "../../../libs/database/database.service";
import {CartRepository} from "../cart/cart.repository";
import {CheckoutDto} from "./checkout.dto";
import {CheckoutInitiatedPublisher} from "./checkout-initiated.publisher";
import {OrderCreatedPublisher} from "../order/publishers/order-created.publisher";
import {StripeService} from "../../finance/payment/stripe.service";

type CheckoutItemSnapshot = {
    productId: string;
    productName: string;
    price: number;
    quantity: number;
};

@Injectable()
export class CheckoutService {
    constructor(
        private readonly db: DatabaseService,
        private readonly cartRepo: CartRepository,
        private readonly checkoutInitiatedPublisher: CheckoutInitiatedPublisher,
        private readonly orderCreatedPublisher: OrderCreatedPublisher,
        private readonly stripeService: StripeService
    ) {}

    async checkout(userId: string, dto: CheckoutDto) {
        const cart = await this.cartRepo.findCartWithItems(userId);

        if (!cart || cart.items.length === 0) {
            throw new BadRequestException("Cart is empty");
        }

        const selectedItems = cart.items.filter((item) =>
            dto.itemIds.includes(item.productId)
        );

        if (selectedItems.length === 0) {
            throw new BadRequestException(
                "No valid items selected for checkout"
            );
        }

        const user = await this.db.user.findUnique({
            where: {id: userId},
            include: {profile: true},
        });
        const shippingAddress =
            dto.shippingAddress?.trim() || user?.profile?.address?.trim();
        if (!shippingAddress) {
            throw new BadRequestException("Shipping address is required");
        }

        const snapshots = this.buildSnapshots(dto, selectedItems);

        const promo = dto.promoCode
            ? await this.db.promotion.findFirst({
                  where: {
                      code: dto.promoCode,
                      isActive: true,
                      startDate: {lte: new Date()},
                      endDate: {gte: new Date()},
                  },
              })
            : null;

        const subtotal = snapshots.reduce(
            (sum, item) => sum + item.quantity * item.price,
            0
        );

        let discount = 0;
        if (promo) {
            discount =
                promo.type === "PERCENTAGE"
                    ? Math.round(subtotal * (Number(promo.discountVal) / 100))
                    : Number(promo.discountVal);
        }

        const totalAmount = Math.max(Math.round(subtotal - discount), 0);
        const grossAmount = totalAmount;
        const marketplaceFee = Math.round(grossAmount * 0.05);
        const gatewayFee = 0;
        const netAmount = grossAmount - marketplaceFee - gatewayFee;
        const currency = this.stripeService.currency;
        const stripe = this.stripeService.stripe;

        const {order, payment} = await this.db.$transaction(async (tx) => {
            const shop = await tx.shop.findUnique({where: {id: dto.shopId}});
            if (!shop) {
                throw new NotFoundException(`Shop ${dto.shopId} not found`);
            }

            const newOrder = await tx.order.create({
                data: {
                    userId,
                    shopId: dto.shopId,
                    shopName: shop.name,
                    totalAmount,
                    discountAmount: discount,
                    promotionId: promo?.id,
                    status: "PENDING",
                    items: {
                        create: snapshots.map((item) => ({
                            productId: item.productId,
                            productName: item.productName,
                            price: item.price,
                            quantity: item.quantity,
                        })),
                    },
                },
                include: {items: true},
            });

            const newPayment = await tx.payment.create({
                data: {
                    orderId: newOrder.id,
                    grossAmount,
                    gatewayFee,
                    marketplaceFee,
                    netAmount,
                    method: "STRIPE",
                    status: "PENDING",
                },
            });

            return {order: newOrder, payment: newPayment};
        });

        const session = await stripe.checkout.sessions.create({
            mode: "payment",
            line_items: this.buildStripeLineItems(
                snapshots,
                totalAmount,
                discount,
                currency
            ),
            metadata: {
                orderId: order.id,
                paymentId: payment.id,
                userId,
                shopId: dto.shopId,
            },
            payment_intent_data: {
                metadata: {
                    orderId: order.id,
                    paymentId: payment.id,
                    userId,
                    shopId: dto.shopId,
                },
            },
            success_url: this.stripeService.successUrl,
            cancel_url: this.stripeService.cancelUrl,
            expires_at:
                Math.floor(Date.now() / 1000) +
                this.stripeService.checkoutExpiresHours * 3600,
        });

        await this.db.payment.update({
            where: {id: payment.id},
            data: {
                transactionId: session.id,
                stripeCheckoutSessionId: session.id,
                stripePaymentIntentId:
                    typeof session.payment_intent === "string"
                        ? session.payment_intent
                        : session.payment_intent?.id,
                paymentUrl: session.url,
            },
        });

        await this.checkoutInitiatedPublisher.publish({
            userId,
            orderId: order.id,
            totalAmount: totalAmount.toString(),
            timestamp: new Date().toISOString(),
        });

        await this.orderCreatedPublisher.publish({
            orderId: order.id,
            userId,
            shopId: dto.shopId,
            totalAmount: totalAmount.toString(),
            timestamp: new Date().toISOString(),
        });

        return {
            data: {
                orderId: order.id,
                paymentId: payment.id,
                provider: "STRIPE",
                totalAmount,
                discount,
                itemsCount: selectedItems.length,
                status: "PENDING",
                paymentUrl: session.url,
                checkoutSessionId: session.id,
                clientSecret: null,
            },
            message: "Checkout session created",
        };
    }

    private buildSnapshots(
        dto: CheckoutDto,
        selectedItems: any[]
    ): CheckoutItemSnapshot[] {
        const snapshotByProductId = new Map(
            (dto.items ?? []).map((item) => [item.productId, item])
        );

        return selectedItems.map((cartItem) => {
            const snapshot = snapshotByProductId.get(cartItem.productId);
            if (!snapshot) {
                throw new BadRequestException(
                    `Missing checkout snapshot for ${cartItem.productId}`
                );
            }

            if (snapshot.price <= 0) {
                throw new BadRequestException(
                    `Invalid price for ${cartItem.productId}`
                );
            }

            return {
                productId: cartItem.productId,
                productName: snapshot.productName,
                price: Math.round(snapshot.price),
                quantity: cartItem.quantity,
            };
        });
    }

    private buildStripeLineItems(
        items: CheckoutItemSnapshot[],
        totalAmount: number,
        discount: number,
        currency: string
    ) {
        if (discount > 0) {
            return [
                {
                    quantity: 1,
                    price_data: {
                        currency,
                        unit_amount: this.stripeService.toStripeAmount(
                            totalAmount,
                            currency
                        ),
                        product_data: {
                            name: "Total pembayaran Greenly",
                        },
                    },
                },
            ];
        }

        return items.map((item) => ({
            quantity: item.quantity,
            price_data: {
                currency,
                unit_amount: this.stripeService.toStripeAmount(
                    item.price,
                    currency
                ),
                product_data: {
                    name: item.productName,
                    metadata: {
                        productId: item.productId,
                    },
                },
            },
        }));
    }
}
