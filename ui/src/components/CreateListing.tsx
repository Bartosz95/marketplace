"use client";
import { FormEvent, useEffect, useState } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Image from "react-bootstrap/Image";
import { ListingDetails, RequestAction } from "@/types";
import { Carousel } from "react-bootstrap";
import { SendApiRequest } from "@/pages/MainPage";

export interface CreateListing {
  show: boolean;
  handleClose: () => void;
  sendApiRequest: SendApiRequest;
}

interface InitCreateListingDetails {
  title?: string;
  description?: string;
  price?: number;
  images?: File[];
}

function CreateListing({ show, handleClose, sendApiRequest }: CreateListing) {
  const [listing, setListing] = useState<InitCreateListingDetails>({});
  const [validated, setValidated] = useState(false);

  const fetchImages = async () => {
    const images: File[] = [];
    const response = await fetch(`/images/no-image.png`);
    const blob = await response.blob();
    const image = new File([blob], `/images/no-image.png`, { type: blob.type });
    images.push(image);
    setListing({
      images,
    });
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const uploadImages = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const filesArray = Array.from(event.target.files);
      setListing({
        ...listing,
        images: filesArray,
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

  const sendCreateListing = (event: FormEvent<HTMLFormElement>) => {
    const form = event.currentTarget;
    if (
      form.checkValidity() === false ||
      !listing.title ||
      !listing.description ||
      !listing.price ||
      !listing.images
    ) {
      event.preventDefault();
      event.stopPropagation();
      setValidated(false);
    } else {
      setValidated(true);
      const listingDetails: ListingDetails = {
        title: listing.title,
        description: listing.description,
        price: listing.price,
        images: listing.images,
      };
      const a = async () => {
        await sendApiRequest({
          requestAction: RequestAction.Create,
          listingDetails,
        });
      };
      a();
      handleClose();
    }
  };

  const imagesPreview = (
    <Carousel className="mb-3" style={{ width: "50%", margin: "auto" }}>
      {listing?.images &&
        listing?.images.map((image) => (
          <Carousel.Item key={image.name}>
            <Image alt="no image" src={URL.createObjectURL(image)} fluid />
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
        <Form validated={validated} onSubmit={sendCreateListing}>
          <Form.Group controlId="formFile" className="mb-3">
            <Form.Control
              type="file"
              accept="image/*"
              onChange={uploadImages}
              className="mb-3"
              multiple
              required
            />
            <Form.Control
              type="text"
              name="title"
              placeholder="Title"
              onChange={setDetails}
              className="mb-3"
              required
            />
            <Form.Control
              type="number"
              name="price"
              placeholder="Price"
              onChange={setDetails}
              className="mb-3"
              required
            />
            <Form.Control
              type="text"
              name="description"
              placeholder="Description"
              onChange={setDetails}
              className="mb-3"
              required
            />
            <Form.Control.Feedback type="invalid">
              Please fill all listing details
            </Form.Control.Feedback>
          </Form.Group>
          <Button variant="primary" type="submit" className="float-end">
            Submit
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
}

export default CreateListing;
