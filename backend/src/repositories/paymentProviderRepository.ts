import Stripe from "stripe";
import { EnvPurchase } from "../libs/validationSchemas";
import { UUID } from "crypto";
import { PurchaseRequestedEventData } from "../types";

export interface PaymentProviderRepository {
  createConnectedAccount: (
    email: string,
    idempotencyKey: string,
  ) => Promise<string>;
  createAccountOnboardingLink: (accountId: string) => Promise<string>;
  canReceiveTransfers: (accountId: string) => Promise<boolean>;
  createCheckoutSession: (
    purchaseId: UUID,
    purchase: PurchaseRequestedEventData,
    sellerAccountId: string,
    buyerEmail: string,
    idempotencyKey: string,
  ) => Promise<{
    checkoutSessionId: string;
    checkoutUrl: string;
    sellerAccountId: string;
    applicationFeeAmount: number;
  }>;
}

export const PaymentProviderRepository = (
  env: EnvPurchase,
): PaymentProviderRepository => {
  const stripe = new Stripe(env.secretKey);

  const createConnectedAccount = async (
    email: string,
    idempotencyKey: string,
  ) => {
    const account = await stripe.accounts.create({
      email,
      type: "express",
      country: "AU",
      business_type: "individual",
      capabilities: {
        transfers: { requested: true },
      },
    }, { idempotencyKey });
    return account.id;
  };

  const createAccountOnboardingLink = async (accountId: string) => {
    const frontendUrl = (env.frontendUrl ?? "http://localhost").replace(
      /\/+$/,
      "",
    );
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      type: "account_onboarding",
      collection_options: {
        fields: "currently_due",
        future_requirements: "omit",
      },
      refresh_url: `${frontendUrl}/create?stripe_onboarding=refresh`,
      return_url: `${frontendUrl}/create?stripe_onboarding=return`,
    });
    return accountLink.url;
  };

  const canReceiveTransfers = async (accountId: string) => {
    const account = await stripe.accounts.retrieve(accountId);
    return account.capabilities?.transfers === "active";
  };

  const createCheckoutSession = async (
    purchaseId: UUID,
    purchase: PurchaseRequestedEventData,
    sellerAccountId: string,
    buyerEmail: string,
    idempotencyKey: string,
  ) => {
    const amount = Math.round(purchase.price * 100);
    const applicationFeeAmount = Math.round(amount * 0.05);
    const session = await stripe.checkout.sessions.create(
      {
        mode: "payment",
        client_reference_id: purchaseId,
        customer_email: buyerEmail,
        metadata: {
          purchaseId,
          listingId: purchase.listingId,
          buyerId: purchase.buyerId,
          sellerAccountId,
          applicationFeeAmount: String(applicationFeeAmount),
        },
        payment_intent_data: {
          transfer_data: { destination: sellerAccountId },
          ...(applicationFeeAmount > 0
            ? { application_fee_amount: applicationFeeAmount }
            : {}),
        },
        line_items: [{
          price_data: {
            currency: purchase.currency,
            unit_amount: amount,
            product_data: { name: `Marketplace listing ${purchase.listingId}` },
          },
          quantity: 1,
        }],
        success_url: `${env.frontendUrl ?? "http://localhost"}/?payment=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${env.frontendUrl ?? "http://localhost"}/?payment=cancelled`,
      },
      { idempotencyKey },
    );
    if (!session.url) throw new Error("Stripe did not return a Checkout URL");
    return {
      checkoutSessionId: session.id,
      checkoutUrl: session.url,
      sellerAccountId,
      applicationFeeAmount,
    };
  };

  return {
    createConnectedAccount,
    createAccountOnboardingLink,
    canReceiveTransfers,
    createCheckoutSession,
  };
};
