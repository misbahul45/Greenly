export default () => ({
    rabbitmq: {
        url: process.env.RABBITMQ_URL || "amqp://guest:guest@localhost:5672/",
        queue: process.env.RABBITMQ_QUEUE || "default_queue",
        exchange: process.env.RABBITMQ_EXCHANGE || "greenly_events",
        coreQueue: process.env.RABBITMQ_CORE_QUEUE || "greenly_core_events",
        noAck: process.env.RABBITMQ_NO_ACK === "true",
    },

    outbox: {
        enabled: process.env.OUTBOX_PUBLISHER_ENABLED !== "false",
        intervalMs: parseInt(process.env.OUTBOX_PUBLISH_INTERVAL_MS || "5000", 10),
        batchSize: parseInt(process.env.OUTBOX_BATCH_SIZE || "50", 10),
    },

    redis: {
        host: process.env.REDIS_HOST || "localhost",
        port: parseInt(process.env.REDIS_PORT ?? "6379", 10),
        url:
            process.env.REDIS_URL ||
            `redis://${process.env.REDIS_HOST || "localhost"}:${process.env.REDIS_PORT || 6379}`,
    },

    jwt: {
        access: {
            key: process.env.JWT_ACCESS_SECRET_KEY,
            duration: process.env.JWT_ACCESS_EXPIRES || "30d",
        },
        refresh: {
            key: process.env.JWT_REFRESH_SECRET_KEY,
            duration: process.env.JWT_REFRESH_EXPIRES || "30d",
        },
    },

    emailJs: {
        serviceId: process.env.EMAIL_JS_SERVICE_ID,
        userId: process.env.EMAIL_JS_PUBLIC_ID,
        accessToken: process.env.EMAIL_JS_PRIVATE_KEY,
        templates: {
            verifyEmail: process.env.EMAIL_JS_VERIFY_EMAIL_TEMPLATE_ID,
        },
    },

    stripe: {
        secretKey: process.env.STRIPE_SECRET_KEY,
        publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
        webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
        successUrl:
            process.env.STRIPE_SUCCESS_URL ||
            "http://localhost/payment-success?session_id={CHECKOUT_SESSION_ID}",
        cancelUrl:
            process.env.STRIPE_CANCEL_URL ||
            "http://localhost/payment-cancel?session_id={CHECKOUT_SESSION_ID}",
        currency: process.env.STRIPE_CURRENCY || "idr",
        checkoutExpiresHours: parseInt(
            process.env.STRIPE_CHECKOUT_EXPIRES_HOURS || "24",
            10
        ),
    },

    catalog: {
        url: process.env.CATALOG_SERVICE_URL || "http://catalog-service:8081",
    },

    API_URL: process.env.API_URL,
});
