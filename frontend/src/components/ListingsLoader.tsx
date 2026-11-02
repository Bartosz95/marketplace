"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { getListings } from "@/lib/redux/thunks";
import { listingStoreSelector } from "@/lib/redux/selectors";

export default function CurrentUserLoader() {
  const dispatch = useAppDispatch();
  const { activePage } = useAppSelector(listingStoreSelector);

  useEffect(() => {
    dispatch(getListings());
  }, [dispatch, activePage]);

  return null;
}
