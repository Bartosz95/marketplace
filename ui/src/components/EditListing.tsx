"use client";
import { useState } from "react";

import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Image from "react-bootstrap/Image";
import { ListingProps } from "@/types";
import { Carousel } from "react-bootstrap";

export interface EditListingProps {
  listingProps: ListingProps;
  show: boolean;
  handleClose: () => void;
  sendRequest: (listingProps: ListingProps, images: File[]) => Promise<void>;
}

function EditListing({
  show,
  handleClose,
  listingProps,
  sendRequest,
}: EditListingProps) {
  const [listing, setListing] = useState<ListingProps>({
    ...listingProps,
    imagesUrls: listingProps.imagesUrls.map(
      (image: any) => `${process.env.NEXT_PUBLIC_IMAGES_URL}/${image}`
    ),
  });
  const [images, setImages] = useState<File[]>([]);

  const uploadImages = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const filesArray = Array.from(event.target.files);
      setImages(filesArray);
      setListing({
        ...listing,
        imagesUrls: filesArray.map((image) => URL.createObjectURL(image)),
      });
    }
  };

  const setDetails = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setListing((prev) => {
      return {
        ...prev,
        [name]: value,
      };
    });
  };

  const sendEditListing = async () => {
    await sendRequest(listing, images);
    handleClose();
  };

  const imagesPreview = (
    <Carousel className="mb-3" style={{ width: "50%", margin: "auto" }}>
      {listing.imagesUrls.map((imageUrl) => (
        <Carousel.Item key={imageUrl}>
          <Image src={imageUrl} fluid />
        </Carousel.Item>
      ))}
    </Carousel>
  );

  return (
    <Modal
      show={show}
      onHide={handleClose}
      backdrop="static"
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>Enter listing details</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {imagesPreview}
        <Form>
          <Form.Group controlId="formFile" className="mb-3">
            <Form.Control
              type="file"
              accept="image/*"
              onChange={uploadImages}
              className="mb-3"
              multiple
            />
            <Form.Control
              type="text"
              name="title"
              placeholder="Title"
              onChange={setDetails}
              className="mb-3"
              required
              value={listing.title}
            />
            <Form.Control
              type="number"
              name="price"
              placeholder="Price"
              onChange={setDetails}
              className="mb-3"
              value={listing.price}
              required
            />
            <Form.Control
              type="text"
              name="description"
              placeholder="Description"
              onChange={setDetails}
              className="mb-3"
              value={listing.description}
              required
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={sendEditListing}>
          Add
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default EditListing;
