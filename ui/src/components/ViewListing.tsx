"use client";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Image from "react-bootstrap/Image";
import { Carousel } from "react-bootstrap";
import { ListingProps } from "./types";

interface ViewListingProps {
  show: boolean;
  handleClose: () => void;
  listingProps: ListingProps;
}

function ViewListing({ show, handleClose, listingProps }: ViewListingProps) {
  const { title, description, price, imagesUrls, listingId } = listingProps;

  const images = imagesUrls.map((image) => (
    <Carousel.Item key={image}>
      <Image src={`${process.env.NEXT_PUBLIC_IMAGES_URL}/${image}`} fluid />
    </Carousel.Item>
  ));

  const handleBuy = async (): Promise<void> => {
    const TOKEN = process.env.NEXT_PUBLIC_TOKEN;
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${TOKEN}`,
      },
    };
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/listings/${listingId}`,
      options
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    handleClose();
  };

  return (
    <Modal
      show={show}
      onHide={handleClose}
      backdrop="static"
      aria-labelledby="contained-modal-title-vcenter"
      style={{ margin: "auto" }}
      size="lg"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Carousel className="mb-3" style={{ width: "50%", margin: "auto" }}>
          {images}
        </Carousel>
        <h4>Price: {price}</h4>
        <p>{description}</p>
      </Modal.Body>
      <Modal.Footer>
        <Button
          variant="primary"
          style={{ marginLeft: "3" }}
          onClick={handleBuy}
        >
          Buy
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ViewListing;
