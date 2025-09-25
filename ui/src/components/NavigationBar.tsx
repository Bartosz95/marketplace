"use client";
import { Button, Form, Nav, Navbar, NavDropdown } from "react-bootstrap";
import { useEffect, useState } from "react";
import Login from "@/components/LoginButton";
import { FilterBy } from "../types";
import EditListing from "./EditListing";
import { SendApiRequest } from "@/pages/MainPage";
import { useAuth0 } from "@auth0/auth0-react";

interface NavigationBarProps {
  getListings: (filterBy: FilterBy) => void;
  sendApiRequest: SendApiRequest;
}
function NavigationBar(props: NavigationBarProps) {
  const { getListings, sendApiRequest } = props;
  const [showCreateListing, setShowCreateListing] = useState(false);
  const [theme, setTheme] = useState("dark");
  const { isAuthenticated, loginWithRedirect, user } = useAuth0();

  const toggleTheme = () => {};

  useEffect(() => {
    document.documentElement.setAttribute("data-bs-theme", theme);
  }, [theme]);

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
          <EditListing
            show={showCreateListing}
            handleClose={() => setShowCreateListing(false)}
            listingProps={{
              title: "",
              price: 0,
              description: "",
              imagesUrls: [],
            }}
            sendApiRequest={sendApiRequest}
          />

          <NavDropdown title="Filter By" id="basic-nav-dropdown">
            <NavDropdown.Item onClick={() => getListings(FilterBy.All)}>
              All Active Listings
            </NavDropdown.Item>
            <NavDropdown.Item onClick={() => getListings(FilterBy.Active)}>
              Your Active
            </NavDropdown.Item>
            <NavDropdown.Item onClick={() => getListings(FilterBy.Sold)}>
              Your Sold
            </NavDropdown.Item>
            <NavDropdown.Item onClick={() => getListings(FilterBy.Purchased)}>
              Your Purchased
            </NavDropdown.Item>
            <NavDropdown.Item onClick={() => getListings(FilterBy.Archived)}>
              Your Archived
            </NavDropdown.Item>
            <NavDropdown.Item onClick={() => getListings(FilterBy.UserAll)}>
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
