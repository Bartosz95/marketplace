"use client";
import { Nav, Navbar, NavItem } from "react-bootstrap";
import Login from "@/components/nav/LoginButton";
import { useAppSelector } from "@/lib/redux/hooks";
import { useAuth0 } from "@auth0/auth0-react";
import FilterDropdown from "./FilterDropdown";
import CreateListingButton from "./CreateListingButton";
import DarkModeSwitch from "./DarkModeSwitch";
import { listingStoreSelector } from "@/lib/redux/selectors";
import { useEffect } from "react";
import { Shop } from "react-bootstrap-icons";
import { useAuthSession } from "@/providers/AuthProvider";

function NavigationBar() {
  const { theme } = useAppSelector(listingStoreSelector);
  const { isAuthenticated } = useAuth0();
  const { sessionExpired } = useAuthSession();

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-bs-theme", theme);
    }
  }, [theme]);

  const hasActiveSession = isAuthenticated && !sessionExpired;
  const createListingButton = hasActiveSession && <CreateListingButton />;

  return (
    <Navbar
      expand="lg"
      className="bg-body-tertiary py-1 px-3 position-sticky top-0 z-3"
    >
      <Navbar.Brand href="/">
        <Shop viewBox="0 3 16 16" className="h-3" height="2rem" /> Marketplace
      </Navbar.Brand>
      <Navbar.Toggle aria-controls="nav-menu" />
      <Navbar.Collapse>
        <Nav className="me-auto gap-2">
          <NavItem>{createListingButton}</NavItem>
          <NavItem>{hasActiveSession && <FilterDropdown />}</NavItem>
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
