import Stripe from "stripe";
import { EnvPurchase } from "../libs/validationSchemas";

export interface PaymentProviderRepository {
  createProduct: (id: string, name: string, price: number) => Promise<void>;
  updateProduct: (id: string, name?: string, price?: number) => Promise<void>;
}

export const PaymentProviderRepository = (
  env: EnvPurchase
): PaymentProviderRepository => {
  const stripe = new Stripe(env.secretKey);

  const createProduct = async (
    id: string,
    name: string,
    price: number
  ): Promise<void> => {
    const newProduct: Stripe.ProductCreateParams = {
      id,
      name,
      default_price_data: {
        currency: "aud",
        unit_amount: price * 100,
      },
    };
    await stripe.products.create(newProduct);
  };

  const updateProduct = async (
    id: string,
    name?: string,
    price?: number
  ): Promise<void> => {
    if (name) {
      const updateProductParams: Stripe.ProductUpdateParams = {
        name,
      };
      const product = await stripe.products.update(id, updateProductParams);
    }
  };

  return {
    createProduct,
    updateProduct,
  };
};
