import { FilterBy, Listing } from "@/types";
import { User } from "@auth0/auth0-react";
import { createSlice } from "@reduxjs/toolkit";

interface State {
  showListingView?: Listing;
  showListingUpdate?: Listing;
  theme: "dark" | "light";
  listings: Listing[];
  countOfAll: number;
  activePage: number;
  pagesNumbers: number[];
  limit: number;
  offset: number;
  lastFilterBy: FilterBy;
  user?: User;
  apiURL?: string;
}

const initialState: State = {
  showListingView: undefined,
  showListingUpdate: undefined,
  theme: "dark",
  listings: [],
  countOfAll: 0,
  activePage: 1,
  pagesNumbers: [1],
  limit: 12,
  offset: 0,
  lastFilterBy: FilterBy.All,
  user: undefined,
  apiURL: undefined,
};

export const listingsSlice = createSlice({
  name: 'listings',
  initialState,
  reducers: {
    setShowListingView: (state, actions) => {
      state.showListingView = actions.payload;
    },
    setShowListingUpdate: (state, actions) => {
      state.showListingUpdate = actions.payload;
    },
    setTheme: (state, actions) => {
      state.theme = actions.payload;
    },
    setListings: (state, actions) => {
      state.listings = actions.payload;
    },
    setCountOfAll: (state, actions) => {
      state.countOfAll = actions.payload;
      state.pagesNumbers = Array.from(
        { length: Math.ceil(state.countOfAll / state.limit) },
        (_, i) => i + 1,
      );
    },
    setActivePage: (state, actions) => {
      state.activePage = actions.payload;
    },
    setLimit: (state, actions) => {
      state.limit = actions.payload;
    },
    setOffset: (state, actions) => {
      state.offset = actions.payload;
    },
    setLastFilteredBy: (state, actions) => {
      state.lastFilterBy = actions.payload;
    },
  },
});

export const {
  setShowListingView,
  setShowListingUpdate,
  setTheme,
  setListings,
  setCountOfAll,
  setActivePage,
  setLimit,
  setOffset,
  setLastFilteredBy,
} = listingsSlice.actions;

export default listingsSlice.reducer;
