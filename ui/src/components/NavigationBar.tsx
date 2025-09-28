"use client";
import { Button, Form, Nav, Navbar, NavDropdown } from "react-bootstrap";
import { useEffect, useState } from "react";
import Login from "@/components/LoginButton";
import { FilterBy } from "../types";
import { SendApiRequest } from "@/pages/MainPage";
import { useAuth0 } from "@auth0/auth0-react";
import CreateListing from "./CreateListing";

interface NavigationBarProps {
  getListings: (filterBy: FilterBy) => void;
  sendApiRequest: SendApiRequest;
}
function NavigationBar(props: NavigationBarProps) {
  const { getListings, sendApiRequest } = props;
  const [showCreateListing, setShowCreateListing] = useState(false);
  const [theme, setTheme] = useState("dark");
  const { isAuthenticated, loginWithRedirect } = useAuth0();
  const [filterByTitle, setFilterByTitle] = useState<string>("Filter By");

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-bs-theme", theme);
    }
  }, [theme]);

  const setFilter = (filterBy: FilterBy) => {
    getListings(filterBy);
    switch (filterBy) {
      case FilterBy.All:
        setFilterByTitle("All Active Listings");
        break;
      case FilterBy.Active:
        setFilterByTitle("Your Active");
        break;
      case FilterBy.Archived:
        setFilterByTitle("Your Archived");
        break;
      case FilterBy.Purchased:
        setFilterByTitle("Your Purchased");
        break;
      case FilterBy.Sold:
        setFilterByTitle("Your Sold");
        break;
      case FilterBy.UserAll:
        setFilterByTitle("Your All");
        break;
    }
  };

  return (
    <Navbar
      bg={theme === "dark" ? "dark" : "light"}
      variant={theme}
      expand="lg"
      className="bg-body-tertiary d-flex gap-3 mb-2 "
    >
      <Navbar.Brand className="ms-3">Marketplace</Navbar.Brand>

      {isAuthenticated ? (
        <>
          <Button onClick={() => setShowCreateListing(true)}>
            <i className="bi bi-plus-lg me-1" />
            Create listing
          </Button>
          <CreateListing
            show={showCreateListing}
            handleClose={() => setShowCreateListing(false)}
            sendApiRequest={sendApiRequest}
          />

          <NavDropdown
            title={filterByTitle}
            id="basic-nav-dropdown"
            style={{ width: "20rem" }}
          >
            <NavDropdown.Item onClick={() => setFilter(FilterBy.All)}>
              All Active Listings
            </NavDropdown.Item>
            <NavDropdown.Item onClick={() => setFilter(FilterBy.Active)}>
              Your Active
            </NavDropdown.Item>
            <NavDropdown.Item onClick={() => setFilter(FilterBy.Sold)}>
              Your Sold
            </NavDropdown.Item>
            <NavDropdown.Item onClick={() => setFilter(FilterBy.Purchased)}>
              Your Purchased
            </NavDropdown.Item>
            <NavDropdown.Item onClick={() => setFilter(FilterBy.Archived)}>
              Your Archived
            </NavDropdown.Item>
            <NavDropdown.Item onClick={() => setFilter(FilterBy.UserAll)}>
              Your All
            </NavDropdown.Item>
          </NavDropdown>
        </>
      ) : (
        <Button onClick={() => loginWithRedirect()}>
          Login to add listing
        </Button>
      )}

      <Nav className="ms-auto">
        <Form>
          <Form.Check
            type="switch"
            id="dark-mode-switch"
            label="Dark Mode"
            checked={theme === "dark"}
            onChange={() =>
              setTheme((prevTheme) =>
                prevTheme === "light" ? "dark" : "light"
              )
            }
          />
        </Form>
      </Nav>
      <Login />
    </Navbar>
  );
}

export default NavigationBar;
