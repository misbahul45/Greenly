export const COMMERCE_ROUTING_KEYS = {
  CART_UPDATED: 'cart.updated',
  CART_CLEARED: 'cart.cleared',
  CHECKOUT_INITIATED: 'checkout.initiated',
  ORDER_CREATED: 'order.created',
  ORDER_STATUS_CHANGED: 'order.status.changed',
  PAYMENT_COMPLETED: 'payment.completed',
  PAYMENT_FAILED: 'payment.failed',
  REFUND_PROCESSED: 'refund.processed',
} as const;
