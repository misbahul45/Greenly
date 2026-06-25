import {
    Injectable,
    NotFoundException,
    BadRequestException,
    Logger,
} from "@nestjs/common";
import { DatabaseService } from "../../../libs/database/database.service";
import { CartRepository } from "../cart/cart.repository";
import { CheckoutDto } from "./checkout.dto";
import { CheckoutInitiatedPublisher } from "./checkout-initiated.publisher";
import { StripeService } from "../../finance/payment/stripe.service";
import { COMMERCE_ROUTING_KEYS } from "../shared/constants/routing-keys.constant";
import { OutboxService } from "../../../infrastructure/outbox/outbox.service";
import { CatalogClientService } from "./catalog-client.service";

type CheckoutItemSnapshot = {
    productId: string;
    productName: string;
    price: number;
    quantity: number;
};

@Injectable()
export class CheckoutService {
    private readonly logger = new Logger(CheckoutService.name);

    constructor(
        private readonly db: DatabaseService,
        private readonly cartRepo: CartRepository,
        private readonly checkoutInitiatedPublisher: CheckoutInitiatedPublisher,
        private readonly stripeService: StripeService,
        private readonly catalogClient: CatalogClientService,
        private readonly outbox: OutboxService
    ) {}

    async checkout(userId: string, dto: CheckoutDto) {
        this.logger.log(`[CHECKOUT START] userId: ${userId}, shopId: ${dto.shopId}, itemIds: ${JSON.stringify(dto.itemIds)}`);

        const cart = await this.cartRepo.findCartWithItems(userId);

        if (!cart || cart.items.length === 0) {
            this.logger.warn(`[CHECKOUT FAILED] Cart empty for userId: ${userId}`);
            throw new BadRequestException("Cart is empty");
        }

        const selectedItems = cart.items.filter((item) =>
            dto.itemIds.includes(item.productId)
        );

        if (selectedItems.length === 0) {
            this.logger.warn(`[CHECKOUT FAILED] No valid items filtered from cart for userId: ${userId}`);
            throw new BadRequestException(
                "No valid items selected for checkout"
            );
        }

        const user = await this.db.user.findUnique({
            where: { id: userId },
            include: { profile: true },
        });
        const shippingAddress =
            dto.shippingAddress?.trim() || user?.profile?.address?.trim();
        if (!shippingAddress) {
            this.logger.warn(`[CHECKOUT FAILED] Shipping address missing for userId: ${userId}`);
            throw new BadRequestException("Shipping address is required");
        }

        // Ambil data produk aktual dari catalog-service dan buat snapshot
        const snapshots = await this.buildSnapshots(dto, selectedItems);
        this.logger.debug(`[CHECKOUT SNAPSHOTS] Resolved items: ${JSON.stringify(snapshots)}`);

        const itemsPayload = snapshots.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
        }));

        const promo = dto.promoCode
            ? await this.db.promotion.findFirst({
                  where: {
                      code: dto.promoCode,
                      isActive: true,
                      startDate: { lte: new Date() },
                      endDate: { gte: new Date() },
                  },
              })
            : null;
        if (dto.promoCode) {
            this.logger.debug(`[CHECKOUT PROMO] Code: ${dto.promoCode}, Found: ${!!promo}`);
        }

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

        this.logger.log(`[CHECKOUT CALCULATION] Subtotal: ${subtotal}, Discount: ${discount}, TotalAmount: ${totalAmount}, Currency Config: ${currency}`);

        const { order, payment } = await this.db.$transaction(async (tx) => {
            const shop = await tx.shop.findUnique({ where: { id: dto.shopId } });
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
                include: { items: true },
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

            await this.outbox.createEvent(tx, {
                eventType: COMMERCE_ROUTING_KEYS.ORDER_CREATED,
                routingKey: COMMERCE_ROUTING_KEYS.ORDER_CREATED,
                aggregateType: "order",
                aggregateId: newOrder.id,
                payload: {
                    orderId: newOrder.id,
                    userId,
                    shopId: dto.shopId,
                    totalAmount,
                    items: itemsPayload,
                    source: "core-service",
                    version: "1.0",
                    timestamp: new Date().toISOString(),
                },
            });

            return { order: newOrder, payment: newPayment };
        });

        this.logger.log(`[CHECKOUT DB TRANSACTION SUCCESS] OrderId: ${order.id}, PaymentId: ${payment.id}`);

        const stripeLineItems = this.buildStripeLineItems(
            snapshots,
            totalAmount,
            discount,
            currency
        );
        this.logger.debug(`[STRIPE PAYLOAD LINE_ITEMS] Sending to Stripe: ${JSON.stringify(stripeLineItems)}`);

        const session = await stripe.checkout.sessions.create({
            mode: "payment",
            line_items: stripeLineItems,
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

        this.logger.log(`[STRIPE SESSION CREATED] SessionId: ${session.id}, URL: ${session.url}`);

        await this.db.payment.update({
            where: { id: payment.id },
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

        try {
            await this.checkoutInitiatedPublisher.publish({
                userId,
                orderId: order.id,
                totalAmount: totalAmount.toString(),
                timestamp: new Date().toISOString(),
            });
        } catch (error) {
            this.logger.warn(
                `checkout.initiated publish failed for order ${order.id}: ${
                    error instanceof Error ? error.message : String(error)
                }`
            );
        }

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

    private async buildSnapshots(
        dto: CheckoutDto,
        selectedItems: any[]
    ): Promise<CheckoutItemSnapshot[]> {
        const productIds = selectedItems.map((item) => item.productId);
        this.logger.debug(`[RESOLVING CATALOG PRODUCTS] Requesting IDs: ${JSON.stringify(productIds)}`);
        
        const catalogProducts = await this.catalogClient.resolveProducts(productIds);

        return selectedItems.map((cartItem) => {
            const product = catalogProducts.get(cartItem.productId);
            
            this.logger.debug(`[CATALOG PRODUCT MAPPING] ProductId: ${cartItem.productId}, Data found in Catalog: ${JSON.stringify(product)}`);

            if (!product) {
                throw new BadRequestException(
                    `Product ${cartItem.productId} is not available`
                );
            }

            if (product.shopId !== dto.shopId) {
                throw new BadRequestException(
                    `Product ${cartItem.productId} does not belong to shop ${dto.shopId}`
                );
            }

            if (!product.isActive) {
                throw new BadRequestException(
                    `Product ${cartItem.productId} is inactive`
                );
            }

            if (product.stock < cartItem.quantity) {
                throw new BadRequestException(
                    `Insufficient stock for ${cartItem.productId}`
                );
            }

            return {
                productId: cartItem.productId,
                productName: product.name,
                price: product.price, // 🔍 Perhatikan nilai price dari log ini nanti
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
        const isZeroDecimal = ['jpy', 'krw', 'vnd', 'clp', 'pyg'].includes(currency.toLowerCase());
        const multiplier = isZeroDecimal ? 1 : 100;

        if (discount > 0) {
            return [
                {
                    quantity: 1,
                    price_data: {
                        currency: currency.toLowerCase(),
                        unit_amount: Math.round(totalAmount * multiplier),
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
                currency: currency.toLowerCase(),
                unit_amount: Math.round(item.price * multiplier),
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