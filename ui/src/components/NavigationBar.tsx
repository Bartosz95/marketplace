import { Button, Form, Nav, Navbar, NavDropdown } from "react-bootstrap";
import { useEffect } from "react";
import Login from "@/components/LoginButton";
import { FilterBy } from "../types";
import CreateListing from "./CreateListing";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { getListings } from "@/lib/redux/thunks";
import { useAuth0 } from "@auth0/auth0-react";
import { setShowListingCreate, setTheme } from "@/lib/redux/listingsSlice";

function NavigationBar() {
  const { isAuthenticated, loginWithRedirect } = useAuth0();

  const { theme, lastFilterBy } = useAppSelector(
    (state) => state.listingsStore
  );
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-bs-theme", theme);
    }
  }, [theme]);

  const mapFilterBy = (filterBy: FilterBy) => {
    switch (filterBy) {
      case FilterBy.All:
        return "Filter By";
      case FilterBy.UserAll:
        return "Yours";
      case FilterBy.Active:
        return "Your Active";
      case FilterBy.Archived:
        return "Your Archived";
      case FilterBy.Purchased:
        return "Your Purchased";
      case FilterBy.Sold:
        return "Your Sold";
    }
  };
  const filterDropdown = isAuthenticated && (
    <NavDropdown title={mapFilterBy(lastFilterBy)}>
      <NavDropdown.Item onClick={() => dispatch(getListings(FilterBy.All))}>
        {mapFilterBy(FilterBy.All)}
      </NavDropdown.Item>
      <NavDropdown.Item onClick={() => dispatch(getListings(FilterBy.Active))}>
        {mapFilterBy(FilterBy.Active)}
      </NavDropdown.Item>
      <NavDropdown.Item onClick={() => dispatch(getListings(FilterBy.Sold))}>
        {mapFilterBy(FilterBy.Sold)}
      </NavDropdown.Item>
      <NavDropdown.Item
        onClick={() => dispatch(getListings(FilterBy.Purchased))}
      >
        {mapFilterBy(FilterBy.Purchased)}
      </NavDropdown.Item>
      <NavDropdown.Item
        onClick={() => dispatch(getListings(FilterBy.Archived))}
      >
        {mapFilterBy(FilterBy.Archived)}
      </NavDropdown.Item>
      <NavDropdown.Item onClick={() => dispatch(getListings(FilterBy.UserAll))}>
        {mapFilterBy(FilterBy.UserAll)}
      </NavDropdown.Item>
    </NavDropdown>
  );

  const createListingButton = isAuthenticated && (
    <Button onClick={() => dispatch(setShowListingCreate(true))}>
      <i className="bi bi-plus-lg me-1" />
      Create listing
    </Button>
  );

  const loginToAddButton = !isAuthenticated && (
    <Button onClick={() => loginWithRedirect()}>Login to add listing</Button>
  );

  const darkModeSwitch = (
    <Nav className="ms-auto">
      <Form>
        <Form.Check
          type="switch"
          id="dark-mode-switch"
          label="Dark Mode"
          checked={theme === "dark"}
          onChange={() =>
            dispatch(setTheme(theme === "light" ? "dark" : "light"))
          }
        />
      </Form>
    </Nav>
  );

  return (
    <Navbar
      bg={theme === "dark" ? "dark" : "light"}
      variant={theme}
      expand="lg"
      className="bg-body-tertiary d-flex gap-3 mb-2 "
    >
      <Navbar.Brand className="ms-3">Marketplace</Navbar.Brand>
      {createListingButton}
      {loginToAddButton}
      {filterDropdown}
      <CreateListing />
      {darkModeSwitch}
      <Login />
    </Navbar>
  );
}

export default NavigationBar;
