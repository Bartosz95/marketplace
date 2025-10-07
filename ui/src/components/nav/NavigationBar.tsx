"use client";
import { Navbar } from "react-bootstrap";
import Login from "@/components/nav/LoginButton";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { useAuth0 } from "@auth0/auth0-react";
import CreateListing from "./CreateListingModal";
import FilterDropdown from "./FilterDropdown";
import CreateListingButton from "./CreateListingButton";
import LoginToAddListingButton from "./LoginToAddListingButton";
import DarkModeSwitch from "./DarkModeSwitch";
import { listingStoreSelector } from "@/lib/redux/selectors";
import { setToken } from "@/lib/redux/listingsSlice";
import { ReactNode, useEffect } from "react";

type Props = { children: ReactNode };
function NavigationBar() {
  const { theme } = useAppSelector(listingStoreSelector);
  const dispatch = useAppDispatch();
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();

  const getToken = async () => {
    try {
      const token = await getAccessTokenSilently({
        authorizationParams: {
          audience: process.env.NEXT_PUBLIC_AUTH0_AUDIENCE,
        },
      });
      dispatch(setToken(token));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      getToken();
    }
  }, [isAuthenticated]);

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
        expand="lg"
        className="bg-body-tertiary d-flex gap-3 mb-2 "
      >
        <Navbar.Brand className="ms-3">Marketplace</Navbar.Brand>
        {createListingButton}
        {isAuthenticated && <FilterDropdown />}
        <CreateListing />
        <DarkModeSwitch />
        <Login />
      </Navbar>
    </>
  );
}

export default NavigationBar;
