import { z } from "zod";
import { SellerPaymentReadinessRepository } from "./sellerPaymentReadinessRepository";

export type UserRepository = SellerPaymentReadinessRepository;

export const UserRepository = (baseUrl: string): UserRepository => ({
  canReceivePayments: async (sellerId, authorization) => {
    const response = await fetch(
      `${baseUrl.replace(/\/+$/, "")}/api/v1/users/${encodeURIComponent(sellerId)}/payment/readiness`,
      {
        headers: {
          authorization,
          accept: "application/json",
        },
      },
    );
    if (!response.ok) {
      throw new Error(
        `User API payment readiness check failed with status ${response.status}`,
      );
    }

    const { status } = z
      .object({ status: z.enum(["ready", "not_ready"]) })
      .parse(await response.json());
    return status === "ready";
  },
});
