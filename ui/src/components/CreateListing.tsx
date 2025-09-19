import { useState } from "react";
import { validate as isValidUUID } from "uuid";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Image from "react-bootstrap/Image";
import { UUID } from "crypto";
import { ListingDetails } from "./types";
import { Carousel } from "react-bootstrap";

interface CreateListingProps {
  show: boolean;
  handleClose: () => void;
}

function CreateListing({ show, handleClose }: CreateListingProps) {
  const [listingDetails, setListingDetails] = useState<ListingDetails>({
    title: "",
    description: "",
    price: 0,
    imagesUrls: [],
  });
  const [images, setImages] = useState<File[] | null>(null);

  const uploadImages = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const filesArray = Array.from(event.target.files);
      setImages(filesArray);
      setListingDetails((prev) => {
        return {
          ...prev,
          imagesUrls: filesArray.map((file) => file.name),
        };
      });
    }
  };

  const setDetails = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setListingDetails((prev) => {
      return {
        ...prev,
        [name]: value,
      };
    });
  };

  const sendListingDetails = async (): Promise<UUID> => {
    const TOKEN = process.env.NEXT_PUBLIC_TOKEN;
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${TOKEN}`,
      },
      body: JSON.stringify(listingDetails),
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

  const sendImages = async (listingId: UUID) => {
    if (images && images?.length > 0) {
      const TOKEN = process.env.NEXT_PUBLIC_TOKEN;
      const formData = new FormData();
      for (const image of images) {
        formData.append(`images`, image);
      }
      const options = {
        method: "POST",
        headers: {
          Authorization: `Bearer ${TOKEN}`,
        },
        body: formData,
      };
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/images/${listingId}`,
        options
      );
    }
  };

  const createListing = async () => {
    const listingId = await sendListingDetails();
    await sendImages(listingId);
    handleClose();
  };

  const imagesPreview =
    images &&
    images.map((image) => (
      <Carousel.Item key={image.name}>
        <Image src={URL.createObjectURL(image)} fluid />
      </Carousel.Item>
    ));

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
        <Carousel className="mb-3" style={{ width: "50%", margin: "auto" }}>
          {imagesPreview}
        </Carousel>
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
