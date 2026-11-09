"use client";

import { useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useAppDispatch } from "@/lib/redux/hooks";
import { configureApi } from "@/lib/apiRequest";
import { getCurrentUserInfo } from "@/lib/redux/thunks";

export default function CurrentUserLoader() {
  const dispatch = useAppDispatch();
  const { getAccessTokenSilently, isLoading, isAuthenticated } = useAuth0();

  useEffect(() => {
    configureApi(getAccessTokenSilently);

    if (isLoading || !isAuthenticated) return;

    dispatch(getCurrentUserInfo())
      .unwrap()
      .catch((error) => {
        console.error("Failed to load the current user", error);
      });
  }, [dispatch, getAccessTokenSilently, isLoading, isAuthenticated]);

  return null;
}
