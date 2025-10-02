import { Button, Form, Nav, Navbar, NavDropdown } from "react-bootstrap";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import Login from "@/components/LoginButton";
import { FilterBy } from "../types";
import CreateListing from "./CreateListing";
import { useAuthContext } from "@/providers/AuthContext";

interface NavigationBarProps {
  lastFilterBy: FilterBy;
  setLastFilterBy: Dispatch<SetStateAction<FilterBy>>;
}
function NavigationBar(props: NavigationBarProps) {
  const { lastFilterBy, setLastFilterBy } = props;
  const [showCreateListing, setShowCreateListing] = useState(false);
  const [theme, setTheme] = useState("dark");
  const { isAuthenticated, loginWithRedirect } = useAuthContext();

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
      <NavDropdown.Item onClick={() => setLastFilterBy(FilterBy.All)}>
        {mapFilterBy(FilterBy.All)}
      </NavDropdown.Item>
      <NavDropdown.Item onClick={() => setLastFilterBy(FilterBy.Active)}>
        {mapFilterBy(FilterBy.Active)}
      </NavDropdown.Item>
      <NavDropdown.Item onClick={() => setLastFilterBy(FilterBy.Sold)}>
        {mapFilterBy(FilterBy.Sold)}
      </NavDropdown.Item>
      <NavDropdown.Item onClick={() => setLastFilterBy(FilterBy.Purchased)}>
        {mapFilterBy(FilterBy.Purchased)}
      </NavDropdown.Item>
      <NavDropdown.Item onClick={() => setLastFilterBy(FilterBy.Archived)}>
        {mapFilterBy(FilterBy.Archived)}
      </NavDropdown.Item>
      <NavDropdown.Item onClick={() => setLastFilterBy(FilterBy.UserAll)}>
        {mapFilterBy(FilterBy.UserAll)}
      </NavDropdown.Item>
    </NavDropdown>
  );

  const createListingButton = isAuthenticated && (
    <Button onClick={() => setShowCreateListing(true)}>
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
            setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"))
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
      <CreateListing
        show={showCreateListing}
        handleClose={() => setShowCreateListing(false)}
      />
      {darkModeSwitch}
      <Login />
    </Navbar>
  );
}

export default NavigationBar;
