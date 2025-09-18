import { ChangeEventHandler, useState } from "react";
import { validate as isValidUUID } from "uuid";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Image from "react-bootstrap/Image";
import { UUID } from "crypto";

interface ExampleProps {
  show: boolean;
  handleClose: () => void;
}

interface ListingDetails {
  title: string;
  description: string;
  price: number;
  imagesUrls: string[];
}

function Example({ show, handleClose }: ExampleProps) {
  const [listingDetails, setListingDetails] = useState<ListingDetails>({
    title: "",
    description: "",
    price: 0,
    imagesUrls: [],
  });
  const [images, setImages] = useState<File[] | null>(null);
  const [previewImage, setPreviewImage] = useState<string[] | null>(null);

  const uploadImages = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      // Convert FileList to an array
      const filesArray = Array.from(event.target.files);
      setImages(filesArray);
      setListingDetails((prev) => {
        return {
          ...prev,
          imagesUrls: filesArray.map((file) => file.name),
        };
      });
      setPreviewImage(filesArray.map((file) => URL.createObjectURL(file)));
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

  return (
    <Modal show={show} onHide={handleClose} backdrop="static" keyboard={false}>
      <Modal.Header closeButton>
        <Modal.Title>Create new listing</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
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

          <Form.Group controlId="formFile" className="mb-3">
            <Form.Control
              type="file"
              accept="image/*"
              onChange={uploadImages}
              multiple
            />
          </Form.Group>
          {images &&
            images.map((img, idx) => (
              <Image
                key={idx}
                src={URL.createObjectURL(img)}
                alt={`preview-${idx}`}
                width={100}
                style={{ borderRadius: "8px" }}
              />
            ))}
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={createListing}>
          Add
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default Example;
