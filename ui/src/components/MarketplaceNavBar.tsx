import { Button, Container, Form, Nav, Navbar } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { useEffect, useState } from "react";
import CreateListing from "./CreateListing";

function MarketplaceNavBar() {
  const [show, setShow] = useState(false);

  const [theme, setTheme] = useState("light"); // Initial theme

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
      <Navbar.Brand>Marketplace</Navbar.Brand>
      <Button onClick={handleShow}>Create listing</Button>
      <CreateListing show={show} handleClose={handleClose} />
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
    </Navbar>
  );
}

export default MarketplaceNavBar;
