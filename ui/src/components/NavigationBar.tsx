"use client";
import { Button, Form, Nav, Navbar } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { useEffect, useState } from "react";
import CreateListing from "@/components/CreateListing";
import Login from "@/components/LoginButton";

function NavigationBar() {
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
      className="bg-body-tertiary"
    >
      <Navbar.Brand href="/" className="ms-3">
        Marketplace
      </Navbar.Brand>
      <Button onClick={handleShow}>
        <i className="bi bi-plus-lg me-1" />
        Create listing
      </Button>
      <CreateListing show={show} handleClose={handleClose} />
      <LinkContainer to="/my" className="ms-3">
        <Nav.Link>My Listings</Nav.Link>
      </LinkContainer>

      <Nav className="ms-auto me-3">
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
