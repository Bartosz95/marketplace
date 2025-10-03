import { FilterBy, Listing } from "@/types";
import { createSlice } from "@reduxjs/toolkit";
import { boolean } from "yup";

interface InitialState {
  showListingCreate: boolean;
  showListingView: string;
  showListingUpdate: string;
  theme: "dark" | "light";
  listings: Listing[];
  countOfAll: number;
  activePage: number;
  limit: number;
  offset: number;
  lastFilterBy: FilterBy;
  token: string;
  user: any;
  isAuthenticated: boolean;
}

const initialState: InitialState = {
  showListingCreate: false,
  showListingView: "",
  showListingUpdate: "",
  theme: "dark",
  listings: [],
  countOfAll: 0,
  activePage: 1,
  limit: 10,
  offset: 0,
  lastFilterBy: FilterBy.All,
  token: "",
  user: undefined,
  isAuthenticated: false,
};

export const listingsSlice = createSlice({
  name: "listings",
  initialState,
  reducers: {
    setShowListingView: (state, actions) => {
      state.showListingView = actions.payload;
    },
    setShowListingCreate: (state, actions) => {
      state.showListingCreate = actions.payload;
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
  },
});

export const {
  setShowListingView,
  setShowListingCreate,
  setShowListingUpdate,
  setTheme,
  setListings,
  setCountOfAll,
  setActivePage,
  setLimit,
  setOffset,
  setLastFilteredBy,
  setToken,
} = listingsSlice.actions;
