export interface CalculateFeesResult {
  grossAmount: number;
  marketplaceFee: number;
  gatewayFee: number;
  netAmount: number;
}

export const calculateOrderFees = (grossAmount: number): CalculateFeesResult => {
  const marketplaceFee = grossAmount * 0.05; // 5% fee
  const gatewayFee = 4000;
  
  const netAmount = Math.max(0, grossAmount - marketplaceFee - gatewayFee);
  
  return {
    grossAmount,
    marketplaceFee,
    gatewayFee,
    netAmount,
  };
};
