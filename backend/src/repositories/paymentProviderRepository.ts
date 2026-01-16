import Stripe from "stripe";
import { EnvPurchase } from "../libs/validationSchemas";

export interface PaymentProviderRepository {
  createProduct: (id: string, name: string, price: number) => Promise<string>;
  updateProductName: (id: string, price: string) => Promise<void>;
  updateProductPrice: (id: string, price: number) => Promise<string>;
  updateProductImages: (id: string, images: string[]) => Promise<void>;
  createUser: (name: string, email: string) => Promise<string>;
  createUserOnbordingLink: (accountId: string) => Promise<string>;
  getUserStatus: (accountId: string) => Promise<Stripe.V2.Core.Account>;
  getUserProducts: (
    accountId: string
  ) => Promise<Stripe.ApiList<Stripe.Product>>;
}

export const PaymentProviderRepository = (
  env: EnvPurchase
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

  const createUser = async (name: string, email: string) => {
    const customerCreateParams: Stripe.CustomerCreateParams = {
      name,
      email,
    };

    const account = await stripe.v2.core.accounts.create({
      display_name: name,
      contact_email: email,
      dashboard: "express",
      defaults: {
        responsibilities: {
          fees_collector: "application",
          losses_collector: "application",
        },
      },
      identity: {
        country: "AU",
        entity_type: "company",
      },
      configuration: {
        recipient: {
          capabilities: {
            stripe_balance: {
              stripe_transfers: {
                requested: true,
              },
            },
          },
        },
      },
    });
    const customer = await stripe.customers.create(customerCreateParams);
    return customer.id;
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

  return {
    createProduct,
    updateProductName,
    updateProductPrice,
    updateProductImages,
    createUser,
    createUserOnbordingLink,
    getUserStatus,
    getUserProducts,
  };
};
