import { FilterBy, Listing } from "@/types";
import { createSlice } from "@reduxjs/toolkit";
import { Stripe } from "@stripe/stripe-js";

interface InitialState {
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
  token?: string;
  user?: any;
  isAuthenticated: boolean;
  apiURL?: string;
  stripe: Stripe | null;
}

const initialState: InitialState = {
  showListingView: undefined,
  showListingUpdate: undefined,
  theme: "dark",
  listings: [],
  countOfAll: 0,
  activePage: 1,
  pagesNumbers: [1],
  limit: 8,
  offset: 0,
  lastFilterBy: FilterBy.All,
  token: undefined,
  user: undefined,
  isAuthenticated: false,
  apiURL: undefined,
  stripe: null,
};

export const listingsSlice = createSlice({
  name: "listings",
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
        (_, i) => i + 1
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
    setToken: (state, actions) => {
      state.token = actions.payload;
    },
    setApiURL: (state, actions) => {
      state.apiURL = actions.payload;
    },
    setStripe: (state, actions) => {
      state.stripe = actions.payload;
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
  setToken,
  setApiURL,
  setStripe,
} = listingsSlice.actions;
