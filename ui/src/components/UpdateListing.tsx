"use client";
import { FormEvent, useState } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { Listing, ListingDetails, RequestAction } from "@/types";
import Image from "react-bootstrap/Image";
import { Carousel } from "react-bootstrap";
import { sendApiV1Request } from "@/helpers/sendApiV1Request";
import { useAuthContext } from "@/providers/AuthContext";

export interface UpdateListing {
  show: boolean;
  handleClose: () => void;
  listing: Listing;
}

export type UpdateListingDetails = Partial<ListingDetails>;

function UpdateListing({
  show,
  handleClose,
  listing: currentListingDetails,
}: UpdateListing) {
  const [listingUpdatedDetails, setListingUpdatedDetails] =
    useState<UpdateListingDetails>({});
  const [imagesUrls, setImagesUrls] = useState<string[]>(
    currentListingDetails.imagesUrls
  );
  const [validated, setValidated] = useState(false);
  const { token } = useAuthContext();

  const uploadImages = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const filesArray = Array.from(event.target.files);
      if (filesArray.length > 0) {
        setImagesUrls(filesArray.map((image) => URL.createObjectURL(image)));
        setListingUpdatedDetails({
          ...listingUpdatedDetails,
          images: filesArray,
        });
      }
    }
  };

  const setDetails = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setListingUpdatedDetails((prev) => {
      return {
        ...prev,
        [name]: value,
      };
    });
  };

  const updateListingDetails = (event: FormEvent<HTMLFormElement>) => {
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
      setValidated(false);
    } else {
      setValidated(true);
      const send = async () => {
        const formData = new FormData();
        const { title, price, description, images } = listingUpdatedDetails;
        formData.append(
          `details`,
          JSON.stringify({ title, price, description })
        );
        if (images && images.length > 0) {
          for (const image of images) {
            formData.append(`images`, image);
          }
        }

        await sendApiV1Request(`/listings/${currentListingDetails.listingId}`, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });
      };
      send();
      handleClose();
      console.log(listingUpdatedDetails);
    }
  };

  const imagePreview = (
    <Carousel className="mb-3 imagePreview">
      {imagesUrls.map((imageUrl) => (
        <Carousel.Item key={imageUrl}>
          <Image alt="no image" src={imageUrl} fluid />
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
      className="blurred-background"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>Enter listing details</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {imagePreview}
        <Form validated={validated} onSubmit={updateListingDetails}>
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
              defaultValue={currentListingDetails.title}
              required
            />
            <Form.Control
              type="number"
              name="price"
              placeholder="Price"
              onChange={setDetails}
              className="mb-3"
              defaultValue={currentListingDetails.price}
              required
            />
            <Form.Control
              type="text"
              name="description"
              placeholder="Description"
              onChange={setDetails}
              className="mb-3"
              defaultValue={currentListingDetails.description}
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

export default UpdateListing;
