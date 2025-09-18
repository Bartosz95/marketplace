import Container from "react-bootstrap/Container";
import { Button, Navbar } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { useState } from "react";
import Example from "./CreateListing";

function MarketplaceNavBar() {
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  return (
    <Navbar expand="lg" className="bg-body-tertiary">
      <Navbar.Brand>Marketplace</Navbar.Brand>
      <Button onClick={handleShow}>Create new listing</Button>
      <Example show={show} handleClose={handleClose} />
    </Navbar>
  );
}

export default MarketplaceNavBar;
