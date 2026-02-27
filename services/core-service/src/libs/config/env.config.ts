export default () => ({
  rabbitmq: {
    url: process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672/',
    queue: process.env.RABBITMQ_QUEUE || 'default_queue',
    noAck: process.env.RABBITMQ_NO_ACK === 'true',
  },

  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
    url:
      process.env.REDIS_URL ||
      `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`,
  },

  jwt: {
    access: {
      key: process.env.JWT_ACCESS_SECRET_KEY,
      duration: process.env.JWT_ACCESS_EXPIRES || '15m',
    },
    refresh: {
      key: process.env.JWT_REFRESH_SECRET_KEY,
      duration: process.env.JWT_REFRESH_EXPIRES || '30d',
    },
  },

  emailJs: {
    serviceId: process.env.EMAIL_JS_SERVICE_ID,
    userId: process.env.EMAIL_JS_PUBLIC_ID,
    accessToken:process.env.EMAIL_JS_PRIVATE_KEY,
    templates: {
      verifyEmail: process.env.EMAIL_JS_VERIFY_EMAIL_TEMPLATE_ID,
    },
  },

  API_URL:process.env.API_URL
});