"use client";
import { useState } from "react";
import { validate as isValidUUID } from "uuid";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Image from "react-bootstrap/Image";
import { UUID } from "crypto";
import { CreateListingRequestBody } from "@/components/types";
import { Carousel } from "react-bootstrap";
import { useAuth0 } from "@auth0/auth0-react";

interface CreateListingProps {
  show: boolean;
  handleClose: () => void;
}

function CreateListing({ show, handleClose }: CreateListingProps) {
  const [listing, setListing] = useState<CreateListingRequestBody>({
    title: "",
    description: "",
    price: 0,
  });
  const [images, setImages] = useState<File[] | null>(null);
  const { getAccessTokenSilently } = useAuth0();

  const uploadImages = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const filesArray = Array.from(event.target.files);
      setImages(filesArray);
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

  const sendListingDetails = async (token: string): Promise<UUID> => {
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(listing),
    };
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/listings`,
      options
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result = await response.json();
    const listingId = result.listingId;
    if (!listingId || !isValidUUID(listingId))
      throw new Error("Creating listing failed");

    return listingId;
  };

  const sendImages = async (token: string, listingId: UUID) => {
    if (images && images?.length > 0) {
      const formData = new FormData();
      for (const image of images) {
        formData.append(`images`, image);
      }
      const options = {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      };
      await fetch(
        `${process.env.NEXT_PUBLIC_IMAGES_URL}/${listingId}`,
        options
      );
    }
  };

  const createListing = async () => {
    const token = await getAccessTokenSilently({
      authorizationParams: {
        audience: process.env.NEXT_PUBLIC_AUTH0_AUDIENCE,
      },
    });
    const listingId = await sendListingDetails(token);
    await sendImages(token, listingId);
    handleClose();
  };

  const imagesPreview = images && (
    <Carousel className="mb-3" style={{ width: "50%", margin: "auto" }}>
      {images.map((image) => (
        <Carousel.Item key={image.name}>
          <Image src={URL.createObjectURL(image)} fluid />
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
        <Modal.Title>Create listing</Modal.Title>
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
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={createListing}>
          Create
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default CreateListing;
