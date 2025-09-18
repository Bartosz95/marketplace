import { ChangeEventHandler, useState } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Image from "react-bootstrap/Image";

interface ExampleProps {
  show: boolean;
  handleClose: () => void;
}

function Example({ show, handleClose }: ExampleProps) {
  const [images, setImages] = useState<File[] | null>(null);
  const [previewImage, setPreviewImage] = useState<string[] | null>(null);

  const uploadImages = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      // Convert FileList to an array
      const filesArray = Array.from(event.target.files);
      setImages(filesArray);
      setPreviewImage(filesArray.map((file) => URL.createObjectURL(file)));
    }
  };

  const createListing = () => {
    handleClose();
  };

  return (
    <Modal show={show} onHide={handleClose} backdrop="static" keyboard={false}>
      <Modal.Header closeButton>
        <Modal.Title>
          <Form.Control type="text" placeholder="Title" />
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Control type="text" placeholder="Price" className="mb-3" />
        <Form.Control type="text" placeholder="Description" className="mb-3" />
        <Form>
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
