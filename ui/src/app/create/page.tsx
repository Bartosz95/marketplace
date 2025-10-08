"use client";
import { ChangeEvent, useState } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Image from "react-bootstrap/Image";
import { Carousel } from "react-bootstrap";
import { Formik } from "formik";
import * as yup from "yup";
import { createListing } from "@/redux/thunks";
import { useAppDispatch } from "@/lib/redux/hooks";
import { redirect, useRouter } from "next/navigation";

const CreateListingSchema = yup.object().shape({
  title: yup.string().min(1).max(20).required(),
  price: yup.number().min(0).required(),
  description: yup.string().min(10).max(255).required(),
  images: yup
    .array()
    .min(1, "You must upload at least one image")
    .max(5, "You can upload up to 5 images")
    .test("fileType", "Only JPG/PNG files are allowed", (files) =>
      files
        ? files.every((file) => ["image/jpeg", "image/png"].includes(file.type))
        : false
    )
    .required(),
});

export type CreateListingDetails = Partial<
  yup.InferType<typeof CreateListingSchema>
>;

function CreateListing() {
  const [imagesUrls, setImagesUrls] = useState<string[]>([
    `/images/no-image.png`,
  ]);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const imagePreview = (
    <Carousel className="mb-3 image-preview">
      {imagesUrls.map((imageUrl) => (
        <Carousel.Item key={imageUrl}>
          <Image alt="no image" src={imageUrl} fluid />
        </Carousel.Item>
      ))}
    </Carousel>
  );

  const handleCreate = async (createListingDetails: CreateListingDetails) => {
    dispatch(createListing(createListingDetails));
    router.push(`/`);
  };

  return (
    <Modal
      show={true}
      onHide={() => router.push(`/`)}
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
        <Formik
          validationSchema={CreateListingSchema}
          onSubmit={handleCreate}
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
                />
                <Form.Control.Feedback type="invalid">
                  {errors.description}
                </Form.Control.Feedback>
              </Form.Group>
              <Button
                variant="primary"
                type="submit"
                className="float-end button-style"
                style={{ width: "10rem" }}
              >
                Add
              </Button>
            </Form>
          )}
        </Formik>
      </Modal.Body>
    </Modal>
  );
}

export default CreateListing;
