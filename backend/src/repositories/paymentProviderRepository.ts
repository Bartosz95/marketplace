import Stripe from "stripe";
import { EnvPurchase } from "../libs/validationSchemas";
import { UUID } from "crypto";
import { PurchaseRequestedEventData } from "../types";

export interface PaymentProviderRepository {
  createProduct: (id: string, name: string, price: number) => Promise<string>;
  updateProductName: (id: string, price: string) => Promise<void>;
  updateProductPrice: (id: string, price: number) => Promise<string>;
  updateProductImages: (id: string, images: string[]) => Promise<void>;
  createUser: (email: string) => Promise<UUID>;
  createUserOnbordingLink: (accountId: string) => Promise<string>;
  getUserStatus: (accountId: string) => Promise<Stripe.V2.Core.Account>;
  getUserProducts: (
    accountId: string,
  ) => Promise<Stripe.ApiList<Stripe.Product>>;
  createCheckoutSession: (
    purchaseId: UUID,
    purchase: PurchaseRequestedEventData,
    idempotencyKey: string,
  ) => Promise<{ checkoutSessionId: string; checkoutUrl: string }>;
}

export const PaymentProviderRepository = (
  env: EnvPurchase,
): PaymentProviderRepository => {
  const stripe = new Stripe(env.secretKey);

  const getProductIfExists = async (productId: string) => {
    try {
      return await stripe.products.retrieve(productId);
    } catch (err: any) {
      if (err.code === "resource_missing") {
        return null;
      }
      throw err;
    }
  };

  const createProduct = async (id: string, name: string, price: number) => {
    const products = await getProductIfExists(id);
    if (!products) {
      console.log(products);
      const newProduct: Stripe.ProductCreateParams = {
        id,
        name,
      };
      await stripe.products.create(newProduct);

      const productPrice = await stripe.prices.create({
        product: id,
        unit_amount: price * 100,
        currency: "aud",
      });

      const paymentLink = await stripe.paymentLinks.create({
        line_items: [
          {
            price: productPrice.id,
            quantity: 1,
          },
        ],
      });
      return paymentLink.url;
    } else {
      const existingPriceQuery = await stripe.prices.search({
        query: `product:'${id}'`,
      });
      const existingPrice = existingPriceQuery.data[0];

      if (!existingPrice) {
        const productPrice = await stripe.prices.create({
          product: id,
          unit_amount: price * 100,
          currency: "aud",
        });

        const paymentLink = await stripe.paymentLinks.create({
          line_items: [
            {
              price: productPrice.id,
              quantity: 1,
            },
          ],
        });
        return paymentLink.url;
      } else {
        const paymentLink = await stripe.paymentLinks.create({
          line_items: [
            {
              price: existingPrice.id,
              quantity: 1,
            },
          ],
        });
        return paymentLink.url;
      }
    }
  };

  const updateProductName = async (id: string, name: string) => {
    const updateProductParams: Stripe.ProductUpdateParams = {
      name,
    };
    await stripe.products.update(id, updateProductParams);
  };

  const updateProductPrice = async (id: string, price: number) => {
    const existingPriceQuery = await stripe.prices.search({
      query: `product:'${id}'`,
    });
    const existingPrice = existingPriceQuery.data[0];
    await stripe.prices.update(existingPrice.id, {
      active: false,
    });

    await stripe.prices.create({
      product: id,
      unit_amount: price * 100,
      currency: "aud",
    });
    const paymentLink = await stripe.paymentLinks.create({
      line_items: [
        {
          price: existingPrice.id,
          quantity: 1,
        },
      ],
    });
    return paymentLink.url;
  };

  const updateProductImages = async (id: string, images: string[]) => {
    const updateProductParams: Stripe.ProductUpdateParams = {
      images,
    };
    await stripe.products.update(id, updateProductParams);
  };

  const createUser = async (email: string) => {
    const account = await stripe.accounts.create({
      email,
      type: "express",
      country: "AU",
    });
    return account.id as UUID;
  };

  const createUserOnbordingLink = async (accountId: string) => {
    const accountLink = await stripe.v2.core.accountLinks.create({
      account: accountId,
      use_case: {
        type: "account_onboarding",
        account_onboarding: {
          configurations: ["recipient"],
          refresh_url: "https://example.com",
          return_url: `https://example.com?accountId=${accountId}`,
        },
      },
    });
    return accountLink.url;
  };

  const getUserStatus = async (accountId: string) => {
    const account = await stripe.v2.core.accounts.retrieve(accountId, {
      include: ["requirements", "configuration.recipient"],
    });
    return account;
  };

  const getUserProducts = async (accountId: string) => {
    const products = await stripe.products.list({
      limit: 100,
    });
    return products;
  };

  const createCheckoutSession = async (
    purchaseId: UUID,
    purchase: PurchaseRequestedEventData,
    idempotencyKey: string,
  ) => {
    const session = await stripe.checkout.sessions.create(
      {
        mode: "payment",
        client_reference_id: purchaseId,
        metadata: { purchaseId, listingId: purchase.listingId, buyerId: purchase.buyerId },
        line_items: [{
          price_data: {
            currency: purchase.currency,
            unit_amount: Math.round(purchase.price * 100),
            product_data: { name: `Marketplace listing ${purchase.listingId}` },
          },
          quantity: 1,
        }],
        success_url: `${env.frontendUrl ?? "http://localhost:3000"}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${env.frontendUrl ?? "http://localhost:3000"}/payment/cancel`,
      },
      { idempotencyKey },
    );
    if (!session.url) throw new Error("Stripe did not return a Checkout URL");
    return { checkoutSessionId: session.id, checkoutUrl: session.url };
  };

  return {
    createProduct,
    updateProductName,
    updateProductPrice,
    updateProductImages,
    createUser,
    createUserOnbordingLink,
    getUserStatus,
    getUserProducts,
    createCheckoutSession,
  };
};
