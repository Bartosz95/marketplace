"use client";
import { Navbar } from "react-bootstrap";
import Login from "@/components/nav/LoginButton";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { useAuth0 } from "@auth0/auth0-react";
import FilterDropdown from "./FilterDropdown";
import CreateListingButton from "./CreateListingButton";
import LoginToAddListingButton from "./LoginToAddListingButton";
import DarkModeSwitch from "./DarkModeSwitch";
import { listingStoreSelector } from "@/lib/redux/selectors";
import { setApiURL, setToken } from "@/lib/redux/listingsSlice";
import { useEffect } from "react";
import { redirect } from "next/navigation";
import { Shop } from "react-bootstrap-icons";

function NavigationBar() {
  const { theme } = useAppSelector(listingStoreSelector);
  const dispatch = useAppDispatch();
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();

  useEffect(() => {
    if (isAuthenticated) {
      try {
        getAccessTokenSilently({
          authorizationParams: {
            audience: process.env.NEXT_PUBLIC_AUTH0_AUDIENCE,
          },
        }).then((token) => {
          dispatch(setToken(token));
        });
      } catch (err) {
        console.error(err);
      }
    }
  }, [isAuthenticated]);

  useEffect(() => {
    dispatch(setApiURL(process.env.NEXT_PUBLIC_API_URL));
  }, []);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-bs-theme", theme);
    }
  }, [theme === "dark"]);

  const createListingButton = isAuthenticated ? (
    <CreateListingButton />
  ) : (
    <LoginToAddListingButton />
  );

  return (
    <>
      <Navbar
        bg={theme}
        variant={theme}
        className="bg-body-tertiary d-flex gap-3 mb-2"
      >
        <Navbar.Brand onClick={() => redirect(`/`)} className="ms-3 me-0">
          <Shop className="me-2 pb-1 h-25" />
          Marketplace
        </Navbar.Brand>
        {createListingButton}
        {isAuthenticated && <FilterDropdown />}
        <DarkModeSwitch />
        <Login />
      </Navbar>
    </>
  );
}

export default NavigationBar;
