"use client";
import { Button, Form, Nav, Navbar, NavDropdown } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { useEffect, useState } from "react";
import Login from "@/components/LoginButton";
import { FilterBy, ListingProps } from "./types";
import EditListing from "./EditListing";

interface NavigationBarProps {
  getUserListings: (filterBy: FilterBy) => void;
  sendCreateListingRequest: (
    listingProps: ListingProps,
    images: File[]
  ) => Promise<void>;
}
function NavigationBar(props: NavigationBarProps) {
  const { getUserListings, sendCreateListingRequest } = props;
  const [show, setShow] = useState(false);

  const [theme, setTheme] = useState("light");

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  useEffect(() => {
    document.documentElement.setAttribute("data-bs-theme", theme);
  }, [theme]);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  return (
    <Navbar
      bg={theme === "dark" ? "dark" : "light"}
      variant={theme}
      expand="lg"
      className="bg-body-tertiary d-flex gap-3 mb-2 "
    >
      <Navbar.Brand className="ms-3">Marketplace</Navbar.Brand>

      <Button onClick={handleShow}>
        <i className="bi bi-plus-lg me-1" />
        Create listing
      </Button>
      <EditListing
        show={show}
        handleClose={handleClose}
        listingProps={{
          title: "",
          price: 0,
          description: "",
          imagesUrls: [],
        }}
        sendRequest={sendCreateListingRequest}
      />

      <NavDropdown title="My Listings" id="basic-nav-dropdown">
        <NavDropdown.Item onClick={() => getUserListings(FilterBy.Active)}>
          Active
        </NavDropdown.Item>
        <NavDropdown.Item onClick={() => getUserListings(FilterBy.Sold)}>
          Sold
        </NavDropdown.Item>
        <NavDropdown.Item onClick={() => getUserListings(FilterBy.Archived)}>
          Archived
        </NavDropdown.Item>
        <NavDropdown.Item onClick={() => getUserListings(FilterBy.All)}>
          All
        </NavDropdown.Item>
      </NavDropdown>

      <Nav className="ms-auto">
        <Form>
          <Form.Check
            type="switch"
            id="dark-mode-switch"
            label="Dark Mode"
            checked={theme === "dark"}
            onChange={toggleTheme}
          />
        </Form>
      </Nav>
      <Login />
    </Navbar>
  );
}

export default NavigationBar;
