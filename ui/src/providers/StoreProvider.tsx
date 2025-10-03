"use client";
import { useEffect, useRef } from "react";
import { Provider } from "react-redux";
import { makeStore, AppStore } from "@/redux/store";
import { getListings } from "@/redux/thunks";
import { FilterBy } from "@/types";
import { setToken } from "@/lib/redux/listingsSlice";
import { useAuth0 } from "@auth0/auth0-react";

export default function StoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const storeRef = useRef<AppStore | null>(null);

  const { getAccessTokenSilently, isAuthenticated } = useAuth0();

  useEffect(() => {
    if (storeRef.current && isAuthenticated) {
      const fetchData = async () => {
        try {
          const token = await getAccessTokenSilently({
            authorizationParams: {
              audience: process.env.NEXT_PUBLIC_AUTH0_AUDIENCE,
            },
          });
          if (storeRef.current) storeRef.current.dispatch(setToken(token));
        } catch (err) {
          console.error(err);
        }
      };
      fetchData();
    }
  }, [storeRef, isAuthenticated]);
  if (!storeRef.current) {
    storeRef.current = makeStore();

    storeRef.current.dispatch(getListings(FilterBy.All));
  }

  return <Provider store={storeRef.current}>{children}</Provider>;
}
