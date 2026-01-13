import Stripe from "stripe";
import { EnvPurchase } from "../libs/validationSchemas";
import { isDataView } from "util/types";

export interface PaymentProviderRepository {
  createProduct: (id: string, name: string, price: number) => Promise<string>;
  updateProductName: (id: string, price: string) => Promise<void>;
  updateProductPrice: (id: string, price: number) => Promise<string>;
  updateProductImages: (id: string, images: string[]) => Promise<void>;
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

  return {
    createProduct,
    updateProductName,
    updateProductPrice,
    updateProductImages,
  };
};
