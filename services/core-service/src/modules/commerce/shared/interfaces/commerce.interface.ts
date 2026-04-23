export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  lastPage: number;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface CartUpdatedPayload {
  userId: string;
  cartId: string;
  timestamp: string;
}

export interface CartClearedPayload {
  userId: string;
  cartId: string;
  timestamp: string;
}

export interface CheckoutInitiatedPayload {
  userId: string;
  orderId: string;
  totalAmount: string;
  timestamp: string;
}

export interface OrderCreatedPayload {
  orderId: string;
  userId: string;
  shopId: string;
  totalAmount: string;
  timestamp: string;
}

export interface OrderStatusChangedPayload {
  orderId: string;
  previousStatus: string;
  newStatus: string;
  timestamp: string;
}

export interface PaymentCompletedPayload {
  paymentId: string;
  orderId: string;
  grossAmount: string;
  netAmount: string;
  method: string;
  timestamp: string;
}

export interface PaymentFailedPayload {
  paymentId: string;
  orderId: string;
  reason: string;
  timestamp: string;
}

export interface RefundProcessedPayload {
  refundId: string;
  paymentId: string;
  amount: string;
  status: string;
  timestamp: string;
}
