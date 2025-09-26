"use client";
import { FormEvent, useState } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Image from "react-bootstrap/Image";
import { ListingProps, RequestAction } from "@/types";
import { Carousel } from "react-bootstrap";
import { SendApiRequest } from "@/pages/MainPage";

export interface EditListingProps {
  listingProps: ListingProps;
  show: boolean;
  handleClose: () => void;
  sendApiRequest: SendApiRequest;
  requestAction: RequestAction.Create | RequestAction.Update;
}

function EditListing({
  show,
  handleClose,
  listingProps,
  sendApiRequest,
  requestAction,
}: EditListingProps) {
  const [listing, setListing] = useState<ListingProps>({
    ...listingProps,
    imagesUrls:
      listingProps.imagesUrls.length > 0
        ? listingProps.imagesUrls.map(
            (image: string) => `${process.env.NEXT_PUBLIC_IMAGES_URL}/${image}`
          )
        : [`/images/no-image.png`],
  });
  const [images, setImages] = useState<File[]>([]);
  const [validated, setValidated] = useState(false);

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

  const sendEditListing = (event: FormEvent<HTMLFormElement>) => {
    const form = event.currentTarget;
    console.log(form);
    console.log(form.checkValidity());
    if (form.checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
      setValidated(false);
    } else {
      setValidated(true);
      const a = async () => {
        await sendApiRequest(requestAction, listing, images);
      };
      a();
      handleClose();
    }
  };

  const imagesPreview = (
    <Carousel className="mb-3" style={{ width: "50%", margin: "auto" }}>
      {listing.imagesUrls.map((imageUrl) => (
        <Carousel.Item key={imageUrl}>
          <Image alt="/images/no-image.png" src={imageUrl} fluid />
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
            />
            <Form.Control
              type="text"
              name="title"
              placeholder="Title"
              onChange={setDetails}
              className="mb-3"
              required
              defaultValue={listing.title === "" ? undefined : listing.title}
            />
            <Form.Control
              type="number"
              name="price"
              placeholder="Price"
              onChange={setDetails}
              className="mb-3"
              defaultValue={
                listing.price === 0 || listing.title === ""
                  ? undefined
                  : listing.price
              }
              required
            />
            <Form.Control
              type="text"
              name="description"
              placeholder="Description"
              onChange={setDetails}
              className="mb-3"
              defaultValue={
                listing.description === "" ? undefined : listing.description
              }
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
