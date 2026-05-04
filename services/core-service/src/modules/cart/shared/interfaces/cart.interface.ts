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