"use client";
import { FormEvent, useCallback, useEffect, useState } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Image from "react-bootstrap/Image";
import { Listing, ListingDetails, RequestAction } from "@/types";
import { Carousel } from "react-bootstrap";
import { SendApiRequest } from "@/pages/MainPage";

export interface EditListing {
  listing: Listing;
  show: boolean;
  handleClose: () => void;
  sendApiRequest: SendApiRequest;
  requestAction: RequestAction.Create | RequestAction.Update;
}

function EditListing({
  show,
  handleClose,
  listing: listingDetails,
  sendApiRequest,
}: EditListing) {
  const [listing, setListing] = useState<ListingDetails>({
    title: listingDetails.title,
    description: listingDetails.description,
    price: listingDetails.price,
    images: [],
  });
  const [validated, setValidated] = useState(false);

  const fetchImages = useCallback(async () => {
    const images: File[] = [];
    for (const imageUrl of listingDetails.imagesUrls) {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const image = new File([blob], imageUrl, { type: blob.type });
      images.push(image);
    }
    setListing({
      ...listing,
      images,
    });
  }, [listing, listingDetails.imagesUrls]);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

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

  const sendEditListing = (event: FormEvent<HTMLFormElement>) => {
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
      setValidated(false);
    } else {
      setValidated(true);
      const a = async () => {
        await sendApiRequest({
          requestAction: RequestAction.Update,
          listingId: listingDetails.listingId,
          listingDetails: listing,
        });
      };
      a();
      handleClose();
    }
  };

  const imagesPreview = (
    <Carousel className="mb-3" style={{ width: "50%", margin: "auto" }}>
      {listing.images &&
        listing.images.map((image) => (
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
        <Form validated={validated} onSubmit={sendEditListing}>
          <Form.Group controlId="formFile" className="mb-3">
            <Form.Control
              type="file"
              accept="image/*"
              onChange={uploadImages}
              className="mb-3"
              multiple
              required
              defaultValue={listing.images.map((image) => image.name)}
            />
            <Form.Control
              type="text"
              name="title"
              placeholder="Title"
              onChange={setDetails}
              className="mb-3"
              required
              defaultValue={listing.title}
            />
            <Form.Control
              type="number"
              name="price"
              placeholder="Price"
              onChange={setDetails}
              className="mb-3"
              defaultValue={listing.price}
              required
            />
            <Form.Control
              type="text"
              name="description"
              placeholder="Description"
              onChange={setDetails}
              className="mb-3"
              defaultValue={listing.description}
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

export default EditListing;
