"use client";
import { FormEvent, useState } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Image from "react-bootstrap/Image";
import { Carousel } from "react-bootstrap";
import { ListingDetails } from "@/types";
import { useAuthContext } from "@/providers/AuthContext";
import { sendApiV1Request } from "@/helpers/sendApiV1Request";

export interface CreateListing {
  show: boolean;
  handleClose: () => void;
}

type InitListingDetails = Partial<ListingDetails>;

function CreateListing({ show, handleClose }: CreateListing) {
  const [listing, setListing] = useState<InitListingDetails>({});
  const [validated, setValidated] = useState(false);
  const [imagesUrls, setImagesUrls] = useState<string[]>([
    `/images/no-image.png`,
  ]);
  const { token } = useAuthContext();

  const uploadImages = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const filesArray = Array.from(event.target.files);
      if (filesArray.length > 0) {
        setImagesUrls(filesArray.map((image) => URL.createObjectURL(image)));
        setListing({
          ...listing,
          images: filesArray,
        });
      }
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

  const createListing = async (event: FormEvent<HTMLFormElement>) => {
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
      const formData = new FormData();
      formData.append(
        `details`,
        JSON.stringify({
          title: listing.title,
          description: listing.description,
          price: listing.price,
        })
      );
      for (const image of listing.images) {
        formData.append(`images`, image);
      }
      await sendApiV1Request(`/listings`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      handleClose();
    }
  };

  const imagePreview = (
    <Carousel className="mb-3 image-preview">
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
      centered
      className="modal-view"
    >
      <Modal.Header closeButton>
        <Modal.Title>Enter listing details</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {imagePreview}
        <Form validated={validated} onSubmit={createListing}>
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
