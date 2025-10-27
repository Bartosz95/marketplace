import { sendApiV1Request } from "@/lib/sendApiV1Request";
import { FilterBy } from "@/types";
import {
  setCountOfAll,
  setLastFilteredBy,
  setListings,
  setShowListingView,
  setStripe,
} from "./listingsSlice";
import * as yup from "yup";
import { loadStripe } from "@stripe/stripe-js";
import { CreateListingDetails } from "@/app/create/page";
import { UpdateListingSchema } from "@/app/update/page";
import { AppDispatch, AppGetState } from "./store";

export const getListings =
  (filterBy?: FilterBy) =>
  async (dispatch: AppDispatch, getState: AppGetState) => {
    const state = getState();
    const { lastFilterBy, limit, offset, token } = state.listingsStore;

    const filter = filterBy ? filterBy : lastFilterBy;
    const params = new URLSearchParams();
    params.append("limit", limit.toString());
    params.append("offset", offset.toString());
    const { listings, countOfAll } = await sendApiV1Request(
      `/listings${filter}?${params.toString()}`,
      {
        headers: {
          authorization: `Bearer ${token}`,
        },
      }
    );
    dispatch(setListings(listings));
    dispatch(setCountOfAll(countOfAll));
    dispatch(setLastFilteredBy(filter));
  };

export const createListing =
  ({ title, price, description, images }: CreateListingDetails) =>
  async (dispatch: AppDispatch, getState: AppGetState) => {
    if (!title || !price || !description || !images) return;
    const formData = new FormData();
    images.forEach((image) => {
      formData.append("images", image);
    });
    formData.append("title", title);
    formData.append("price", price.toString());
    formData.append("description", description);
    const state = getState();
    const { token } = state.listingsStore;
    await sendApiV1Request(`/listings`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
  };

export type UpdateListingThunksProp = Partial<
  yup.InferType<typeof UpdateListingSchema>
> & { listingId: string };

export const updateListing =
  ({ listingId, title, price, description, images }: UpdateListingThunksProp) =>
  async (dispatch: AppDispatch, getState: AppGetState) => {
    const formData = new FormData();
    if (images)
      images.forEach((image) => {
        formData.append("images", image);
      });

    if (title) formData.append("title", title);
    if (price) formData.append("price", price.toString());
    if (description) formData.append("description", description);
    const state = getState();
    const { token } = state.listingsStore;
    await sendApiV1Request(`/listings/${listingId}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
    dispatch(setShowListingView(undefined));
  };

export const purchaseListing =
  (listingId: string) =>
  async (dispatch: AppDispatch, getState: AppGetState) => {
    const state = getState();
    const { token } = state.listingsStore;
    await sendApiV1Request(`/listings/${listingId}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  };

export const deleteListing =
  (listingId: string) =>
  async (dispatch: AppDispatch, getState: AppGetState) => {
    const state = getState();
    const { token } = state.listingsStore;
    await sendApiV1Request(`/listings/${listingId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  };

export const archiveListing =
  (listingId: string) =>
  async (dispatch: AppDispatch, getState: AppGetState) => {
    const state = getState();
    const { token } = state.listingsStore;
    await sendApiV1Request(`/listings/archive/${listingId}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  };

export const restoreListing =
  (listingId: string) =>
  async (dispatch: AppDispatch, getState: AppGetState) => {
    const state = getState();
    const { token } = state.listingsStore;
    await sendApiV1Request(`/listings/restore/${listingId}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  };

export const setupStripe =
  () => async (dispatch: AppDispatch, getState: AppGetState) => {
    const state = getState();
    const { token } = state.listingsStore;
    const { publishableKey } = await sendApiV1Request(`/purchase/config`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const stripe = await loadStripe(publishableKey);
    console.log("stripe");
    console.log(stripe);
    dispatch(setStripe(stripe));
  };
