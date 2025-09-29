"use client";
import { FormEvent, useState } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { Listing, RequestAction } from "@/types";
import { SendApiRequest } from "@/pages/MainPage";
import { InitListingDetails } from "./CreateListing";
import ImagePreview from "./ImagePreview";

export interface UpdateListing {
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
}: UpdateListing) {
  const [listing, setListing] = useState<InitListingDetails>({});
  const [imagesUrls, setImagesUrls ] = useState<string[]>(listingDetails.imagesUrls)
  const [validated, setValidated] = useState(false);

  const uploadImages = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const filesArray = Array.from(event.target.files);
      setImagesUrls(filesArray.map((image) => URL.createObjectURL(image)))
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

  const sendUpdateListing = (event: FormEvent<HTMLFormElement>) => {
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

  return (
    <Modal
      show={show}
      onHide={handleClose}
      backdrop="static"
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      className="blurred-background"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>Enter listing details</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <ImagePreview imagesUrls={imagesUrls} />
        <Form validated={validated} onSubmit={sendUpdateListing}>
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
