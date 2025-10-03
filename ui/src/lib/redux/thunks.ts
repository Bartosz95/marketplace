import { sendApiV1Request } from "@/helpers/sendApiV1Request";
import { FilterBy } from "@/types";
import { setCountOfAll, setLastFilteredBy, setListings } from "./listingsSlice";
import { CreateListingDetails } from "@/components/CreateListing";

export const getListings =
  (filterBy?: FilterBy) => async (dispatch: any, getState: any) => {
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
  async (dispatch: any, getState: any) => {
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
