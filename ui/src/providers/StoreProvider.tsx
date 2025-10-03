"use client";
import { useEffect, useRef } from "react";
import { Provider } from "react-redux";
import { makeStore, AppStore } from "@/redux/store";
import { getListings } from "@/redux/thunks";
import { FilterBy } from "@/types";
import { useAuthContext } from "./AuthContext";
import { setToken } from "@/lib/redux/listingsSlice";

export default function StoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const storeRef = useRef<AppStore | null>(null);
  const { token } = useAuthContext();

  useEffect(() => {
    if (storeRef.current) storeRef.current.dispatch(setToken(token));
  }, [token, storeRef]);
  if (!storeRef.current) {
    storeRef.current = makeStore();

    storeRef.current.dispatch(getListings(FilterBy.All));
  }

  return <Provider store={storeRef.current}>{children}</Provider>;
}
