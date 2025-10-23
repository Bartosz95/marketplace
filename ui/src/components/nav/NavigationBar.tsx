"use client";
import { Nav, Navbar, NavItem } from "react-bootstrap";
import Login from "@/components/nav/LoginButton";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { useAuth0 } from "@auth0/auth0-react";
import FilterDropdown from "./FilterDropdown";
import CreateListingButton from "./CreateListingButton";
import DarkModeSwitch from "./DarkModeSwitch";
import { listingStoreSelector } from "@/lib/redux/selectors";
import { setApiURL, setToken } from "@/lib/redux/listingsSlice";
import { useEffect } from "react";
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

  const createListingButton = isAuthenticated && <CreateListingButton />;

  return (
    <Navbar expand="lg" className="bg-body-tertiary py-1 px-3">
      <Navbar.Brand href="/">
        <Shop /> Marketplace
      </Navbar.Brand>
      <Navbar.Toggle aria-controls="nav-menu" />
      <Navbar.Collapse>
        <Nav className="me-auto gap-2">
          <NavItem>{createListingButton}</NavItem>
          <NavItem>{isAuthenticated && <FilterDropdown />}</NavItem>
        </Nav>
      </Navbar.Collapse>
      <Navbar.Collapse id="nav-menu" className="justify-content-end">
        <Nav
          variant={theme}
          className="gap-2 justify-content-end navbar-expand navbar py-1"
        >
          <NavItem>
            <DarkModeSwitch />
          </NavItem>
          <NavItem>
            <Login />
          </NavItem>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
}

export default NavigationBar;
