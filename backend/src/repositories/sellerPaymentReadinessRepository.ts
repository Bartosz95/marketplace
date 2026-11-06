export interface SellerPaymentReadinessRepository {
  canReceivePayments: (
    sellerId: string,
    authorization: string,
  ) => Promise<boolean>;
}
