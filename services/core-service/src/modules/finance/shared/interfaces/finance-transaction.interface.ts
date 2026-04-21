export interface FinanceTransactionPayload {
  shopId: string;
  type: 'CREDIT' | 'DEBIT';
  amount: number;
  reference: string;
  description?: string;
  timestamp: string;
}

export interface PayoutStatusChangedPayload {
  payoutId: string;
  shopId: string;
  amount: number;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  approvedBy?: string;
  paidAt?: string;
}

export interface RefundProcessedPayload {
  refundId: string;
  orderId?: string;
  amount: number;
  reason: string;
}
