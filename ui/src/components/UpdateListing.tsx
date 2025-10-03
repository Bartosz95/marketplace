"use client";
import { ChangeEvent, useState } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { Listing } from "@/types";
import Image from "react-bootstrap/Image";
import { Carousel } from "react-bootstrap";
import { sendApiV1Request } from "@/helpers/sendApiV1Request";
import { useAuthContext } from "@/providers/AuthContext";
import { Formik } from "formik";
import * as yup from "yup";

export interface UpdateListing {
  show: boolean;
  handleClose: () => void;
  listing: Listing;
}

export interface CreateListing {
  show: boolean;
  handleClose: () => void;
}

const UpdateListingSchema = yup.object().shape({
  title: yup.string().min(1).max(20),
  price: yup.number().min(0),
  description: yup.string().min(10).max(255),
  images: yup
    .array()
    .min(1, "You must upload at least one image")
    .max(5, "You can upload up to 5 images")
    .test("fileType", "Only JPG/PNG files are allowed", (files) =>
      files
        ? files.every((file) => ["image/jpeg", "image/png"].includes(file.type))
        : true
    ),
});

type UpdateListingDetails = Partial<yup.InferType<typeof UpdateListingSchema>>;

function UpdateListing({ show, handleClose, listing }: UpdateListing) {
  const [imagesUrls, setImagesUrls] = useState<string[]>(listing.imagesUrls);
  const { token } = useAuthContext();

  const updateListing = async ({
    title,
    price,
    description,
    images,
  }: UpdateListingDetails) => {
    const formData = new FormData();
    if (images)
      images.forEach((image) => {
        formData.append("images", image);
      });

    if (title) formData.append("title", title);
    if (price) formData.append("price", price.toString());
    if (description) formData.append("description", description);
    await sendApiV1Request(`/listings/${listing.listingId}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
    handleClose();
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
      className="modal-view"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>Enter listing details</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {imagePreview}
        <Formik
          validationSchema={UpdateListingSchema}
          onSubmit={updateListing}
          initialValues={{
            title: undefined,
            price: undefined,
            description: undefined,
            images: undefined,
          }}
        >
          {({ handleSubmit, handleChange, touched, errors, setFieldValue }) => (
            <Form noValidate onSubmit={handleSubmit}>
              <Form.Group controlId="images" className="mb-3">
                <Form.Label>Add images</Form.Label>
                <Form.Control
                  type="file"
                  accept="image/*"
                  name="images"
                  onChange={(event: ChangeEvent<HTMLInputElement>) => {
                    handleChange(event);
                    const images = Array.from(event.currentTarget.files || []);
                    if (images.length > 0) {
                      setFieldValue("images", images);
                      setImagesUrls(
                        images.map((image) => URL.createObjectURL(image))
                      );
                    }
                  }}
                  className="mb-3"
                  multiple
                  required
                  isInvalid={touched.images && !!errors.images}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.images}
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group controlId="title" className="mb-3">
                <Form.Label>Listing title</Form.Label>
                <Form.Control
                  type="text"
                  name="title"
                  placeholder="Title"
                  onChange={handleChange}
                  className="mb-3"
                  isInvalid={touched.title && !!errors.title}
                  defaultValue={listing.title}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.title}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group controlId="price" className="mb-3">
                <Form.Label>Price:</Form.Label>
                <Form.Control
                  type="number"
                  name="price"
                  placeholder="Price"
                  onChange={handleChange}
                  className="mb-3"
                  isInvalid={touched.price && !!errors.price}
                  defaultValue={listing.price}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.price}
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group controlId="description" className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  type="text"
                  name="description"
                  placeholder="Description"
                  onChange={handleChange}
                  className="mb-3"
                  isInvalid={touched.description && !!errors.description}
                  defaultValue={listing.description}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.description}
                </Form.Control.Feedback>
              </Form.Group>
              <Button variant="primary" type="submit" className="float-end">
                Add
              </Button>
            </Form>
          )}
        </Formik>
      </Modal.Body>
    </Modal>
  );
}

export default UpdateListing;
