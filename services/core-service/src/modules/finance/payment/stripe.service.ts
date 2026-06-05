import {BadRequestException, Injectable} from "@nestjs/common";
import {ConfigService} from "@nestjs/config";
import Stripe from "stripe";

@Injectable()
export class StripeService {
    private client?: any;

    constructor(private readonly config: ConfigService) {}

    get stripe(): any {
        if (this.client) {
            return this.client;
        }
        const secretKey = this.config.get<string>("stripe.secretKey");
        if (!secretKey) {
            throw new BadRequestException(
                "Stripe secret key is not configured"
            );
        }
        const client = new Stripe(secretKey);
        this.client = client;
        return client;
    }

    get currency() {
        return (
            this.config.get<string>("stripe.currency") || "idr"
        ).toLowerCase();
    }

    get successUrl() {
        return this.config.get<string>("stripe.successUrl") || "";
    }

    get cancelUrl() {
        return this.config.get<string>("stripe.cancelUrl") || "";
    }

    get webhookSecret() {
        return this.config.get<string>("stripe.webhookSecret");
    }

    get checkoutExpiresHours() {
        return this.config.get<number>("stripe.checkoutExpiresHours") || 24;
    }

    toStripeAmount(amount: number, currency = this.currency) {
        const zeroDecimal = new Set([
            "bif",
            "clp",
            "djf",
            "gnf",
            "jpy",
            "kmf",
            "krw",
            "mga",
            "pyg",
            "rwf",
            "ugx",
            "vnd",
            "vuv",
            "xaf",
            "xof",
            "xpf",
            "idr",
        ]);

        return zeroDecimal.has(currency.toLowerCase())
            ? Math.round(amount)
            : Math.round(amount * 100);
    }

    constructEvent(payload: Buffer, signature: string) {
        const secret = this.webhookSecret;
        if (!secret) {
            throw new BadRequestException(
                "Stripe webhook secret is not configured"
            );
        }
        return this.stripe.webhooks.constructEvent(payload, signature, secret);
    }
}
