import { FilterBy, Listing, ListingStatus } from "@/types";
import * as yup from "yup";
import { CreateListingDetails } from "@/app/create/page";
import { UpdateListingSchema } from "@/app/update/page";
import {
  setListings,
  setCountOfAll,
  setLastFilteredBy,
  setUser,
} from "./listingsSlice";
import type { User } from "./listingsSlice";
import { createAsyncThunk } from "@reduxjs/toolkit";
import type { RootState } from "./store";
import { apiRequest } from "../apiRequest";

export const getListings = createAsyncThunk(
  "getListings",
  async (filterBy: FilterBy | undefined, { getState, dispatch }) => {
    const { lastFilterBy, limit, offset } = (getState() as RootState)
      .listingsStore;

    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });

    const filter = filterBy ?? lastFilterBy;

    const { listings, countOfAll } = await apiRequest.get<{
      listings: Listing[];
      countOfAll: number;
    }>(`/listings${filter}?${params.toString()}`, {
      requiresAuth: filter !== FilterBy.All,
    });

    dispatch(setListings(listings));
    dispatch(setCountOfAll(countOfAll));
    dispatch(setLastFilteredBy(filter));
  },
);

export const createListing = createAsyncThunk(
  "createListing",
  async ({ title, price, description, images }: CreateListingDetails) => {
    if (!title || !price || !description || !images) return;
    const formData = new FormData();
    images.forEach((image) => {
      formData.append("images", image);
    });
    formData.append("title", title);
    formData.append("price", price.toString());
    formData.append("description", description);
    await apiRequest.postFormData<Listing>("/listings", formData);
  },
);

export type UpdateListingThunksProp = Partial<
  yup.InferType<typeof UpdateListingSchema>
> & { listingId: string };

export const updateListing = createAsyncThunk(
  "updateListing",
  async (updateListingThunksProp: UpdateListingThunksProp) => {
    const { listingId, title, price, description, images, status } =
      updateListingThunksProp;
    const formData = new FormData();
    if (images)
      images.forEach((image) => {
        formData.append("images", image);
      });

    if (title) formData.append("title", title);
    if (price !== undefined) formData.append("price", price.toString());
    if (description) formData.append("description", description);
    if (status) formData.append("status", status.toString());
    await apiRequest.patchFormData<Listing>(`/listings/${listingId}`, formData);
  },
);

export const purchaseListing = createAsyncThunk(
  "purchaseListing",
  async (listingId: string) => {
    await apiRequest.post<Listing>(`/listings/${listingId}`);
  },
);

export const deleteListing = createAsyncThunk(
  "deleteListing",
  async (listingId: string) => {
    await apiRequest.delete<Listing>(`/listings/${listingId}`);
  },
);

export const getCurrentUserInfo = createAsyncThunk(
  "getCurrentUserInfo",
  async (_, { dispatch }) => {
    for (let attempt = 0; attempt < 30; attempt += 1) {
      const response = await apiRequest.get<User | { status: "provisioning" }>(
        "/users/me",
      );
      if (!("status" in response)) {
        dispatch(setUser(response));
        return;
      }
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    throw new Error("User account provisioning did not complete in time");
  },
);
