import { FilterBy, Listing } from "@/types";
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

  async (_, { getState, dispatch }) => {
    const { limit, offset } = (getState() as RootState).listingsStore;

    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });

    const { listings, countOfAll } = await apiRequest.get<{
      listings: Listing[];
      countOfAll: number;
    }>(`/listings?${params.toString()}`);
    dispatch(setListings(listings));
    dispatch(setCountOfAll(countOfAll));
  },
);

export const getUserListings = createAsyncThunk(
  "getUserListings",
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
    }>(`/listings/user/${filter}?${params.toString()}`);

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
    const { listingId, title, price, description, images } =
      updateListingThunksProp;
    const formData = new FormData();
    if (images)
      images.forEach((image) => {
        formData.append("images", image);
      });

    if (title) formData.append("title", title);
    if (price !== undefined) formData.append("price", price.toString());
    if (description) formData.append("description", description);
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

export const archiveListing = createAsyncThunk(
  "archiveListing",
  async (listingId: string) => {
    await apiRequest.patch<Listing>(`/listings/archive/${listingId}`);
  },
);

export const restoreListing = createAsyncThunk(
  "restoreListing",
  async (listingId: string) => {
    await apiRequest.patch<Listing>(`/listings/restore/${listingId}`);
  },
);

export const getUsersMe = createAsyncThunk(
  "getUsersMe",
  async (_, { dispatch }) => {
    const user = await apiRequest.get<User>("/users/me");
    dispatch(setUser(user));
  },
);
