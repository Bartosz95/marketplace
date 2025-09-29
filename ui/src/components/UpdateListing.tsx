"use client";
import { FormEvent, useCallback, useEffect, useState } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Image from "react-bootstrap/Image";
import { Listing, RequestAction } from "@/types";
import { Carousel } from "react-bootstrap";
import { SendApiRequest } from "@/pages/MainPage";
import { InitListingDetails } from "./CreateListing";
import ImagePreview from "./ImagePreview";

export interface EditListing {
  show: boolean;
  handleClose: () => void;
  listing: Listing;
  sendApiRequest: SendApiRequest;
}

function UpdateListing({
  show,
  handleClose,
  listing: listingDetails,
  sendApiRequest,
}: EditListing) {
  const [listing, setListing] = useState<InitListingDetails>({});
  const [prevImagesUrls, setPrevImagesUrls] = useState<string[]>(
    listingDetails.imagesUrls
  );
  const [validated, setValidated] = useState(false);

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
      const send = async () => {
        await sendApiRequest({
          requestAction: RequestAction.Update,
          listingId: listingDetails.listingId,
          listingDetails: listing,
        });
      };
      send();
      handleClose();
    }
  };

  const imagesPreview = listing.images ? (
    <ImagePreview
      imagesUrls={listing.images.map((image) => URL.createObjectURL(image))}
    />
  ) : (
    <ImagePreview imagesUrls={prevImagesUrls} />
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
            />
            <Form.Control
              type="text"
              name="title"
              placeholder="Title"
              onChange={setDetails}
              className="mb-3"
              defaultValue={listingDetails.title}
            />
            <Form.Control
              type="number"
              name="price"
              placeholder="Price"
              onChange={setDetails}
              className="mb-3"
              defaultValue={listingDetails.price}
            />
            <Form.Control
              type="text"
              name="description"
              placeholder="Description"
              onChange={setDetails}
              className="mb-3"
              defaultValue={listingDetails.description}
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

export default UpdateListing;
