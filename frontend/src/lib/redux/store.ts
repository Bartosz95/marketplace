import { configureStore } from "@reduxjs/toolkit";
import listingReducer from "./listingsSlice";

const makeStore = () =>
  configureStore({
    reducer: {
      listingsStore: listingReducer,
    },
  });

export default makeStore();

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
export type AppGetState = AppStore["getState"];
