"use client";

import { ChangeEvent, useEffect, useState } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Image from "react-bootstrap/Image";
import Card from "react-bootstrap/Card";
import Container from "react-bootstrap/Container";
import { Carousel } from "react-bootstrap";
import { Formik } from "formik";
import * as yup from "yup";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import {
  archiveListing,
  deleteListing,
  restoreListing,
  updateListing,
} from "@/lib/redux/thunks";
import { setShowListingUpdate } from "@/lib/redux/listingsSlice";
import { listingStoreSelector } from "@/lib/redux/selectors";
import { useRouter } from "next/navigation";
import { ListingStatus } from "@/types";

export const UpdateListingSchema = yup.object({
  title: yup.string().min(1).max(20),
  price: yup.number().min(0),
  description: yup.string().min(10).max(255),
  images: yup
    .array()
    .of(yup.mixed<File>().required())
    .max(5, "You can upload up to 5 images")
    .test("fileType", "Only JPG/PNG files are allowed", (files) =>
      files
        ? files.every((file) => ["image/jpeg", "image/png"].includes(file.type))
        : true,
    ),
});

type UpdateListingDetails = {
  title?: string;
  price?: number;
  description?: string;
  images?: File[];
};

function UpdateListing() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const { showListingUpdate } = useAppSelector(listingStoreSelector);

  const [imagesUrls, setImagesUrls] = useState<string[]>(
    showListingUpdate?.imagesUrls || [],
  );

  useEffect(
    () => () => {
      imagesUrls.forEach((imageUrl) => {
        if (imageUrl.startsWith("blob:")) URL.revokeObjectURL(imageUrl);
      });
    },
    [imagesUrls],
  );

  useEffect(() => {
    if (!showListingUpdate) {
      router.push("/");
    }
  }, [showListingUpdate, router]);

  if (!showListingUpdate) {
    return null;
  }

  const archiveRestoreButton =
    showListingUpdate.status === ListingStatus.ARCHIVED ? (
      <Button
        className="button-style set-center"
        variant="secondary"
        type="button"
        onClick={() => {
          void dispatch(restoreListing(showListingUpdate.listingId))
            .unwrap()
            .catch((error) =>
              console.error("Failed to restore listing", error),
            );
        }}
      >
        Restore
      </Button>
    ) : (
      <Button
        className="button-style set-center"
        variant="secondary"
        type="button"
        onClick={() => {
          void dispatch(archiveListing(showListingUpdate.listingId))
            .unwrap()
            .catch((error) =>
              console.error("Failed to archive listing", error),
            );
        }}
      >
        Archive
      </Button>
    );

  const handleUpdate = async (data: UpdateListingDetails) => {
    await dispatch(
      updateListing({
        ...data,
        listingId: showListingUpdate.listingId,
      }),
    ).unwrap();

    dispatch(setShowListingUpdate(undefined));
    router.push("/");
  };

  return (
    <Container className="py-5">
      <div className="mx-auto" style={{ maxWidth: "700px" }}>
        <Card>
          <Card.Header>
            <Card.Title className="mb-0">Update listing</Card.Title>
          </Card.Header>

          <Card.Body>
            {imagesUrls.length > 0 && (
              <Carousel className="mb-4">
                {imagesUrls.map((imageUrl) => (
                  <Carousel.Item key={imageUrl}>
                    <Image
                      alt="listing image"
                      src={imageUrl}
                      fluid
                      className="d-block mx-auto"
                    />
                  </Carousel.Item>
                ))}
              </Carousel>
            )}

            <Formik<UpdateListingDetails>
              validationSchema={UpdateListingSchema}
              onSubmit={handleUpdate}
              initialValues={{
                title: showListingUpdate.title,
                price: showListingUpdate.price,
                description: showListingUpdate.description,
                images: [],
              }}
            >
              {({
                handleSubmit,
                handleChange,
                touched,
                errors,
                values,
                setFieldValue,
              }) => (
                <Form noValidate onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>Select new images</Form.Label>

                    <Form.Control
                      type="file"
                      accept="image/jpeg,image/png"
                      name="images"
                      id="images"
                      multiple
                      onChange={(event: ChangeEvent<HTMLInputElement>) => {
                        const images = Array.from(
                          event.currentTarget.files || [],
                        );

                        if (images.length > 0) {
                          setFieldValue("images", images);

                          setImagesUrls(
                            images.map((image) => URL.createObjectURL(image)),
                          );
                        }
                      }}
                      isInvalid={touched.images && !!errors.images}
                    />

                    <Form.Control.Feedback type="invalid">
                      {errors.images as string}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Title</Form.Label>

                    <Form.Control
                      type="text"
                      name="title"
                      id="title"
                      placeholder="Title"
                      value={values.title || ""}
                      onChange={handleChange}
                      isInvalid={touched.title && !!errors.title}
                    />

                    <Form.Control.Feedback type="invalid">
                      {errors.title}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Price</Form.Label>

                    <Form.Control
                      type="number"
                      name="price"
                      id="price"
                      placeholder="Price"
                      value={values.price ?? ""}
                      onChange={handleChange}
                      isInvalid={touched.price && !!errors.price}
                    />

                    <Form.Control.Feedback type="invalid">
                      {errors.price}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label>Description</Form.Label>

                    <Form.Control
                      as="textarea"
                      rows={5}
                      name="description"
                      id="description"
                      placeholder="Description"
                      maxLength={255}
                      value={values.description || ""}
                      onChange={handleChange}
                      isInvalid={touched.description && !!errors.description}
                    />

                    <Form.Control.Feedback type="invalid">
                      {errors.description}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <div className="d-flex justify-content-between mb-4">
                    {archiveRestoreButton}

                    <Button
                      variant="secondary"
                      type="button"
                      className="button-style set-center"
                      onClick={() => {
                        void dispatch(
                          deleteListing(showListingUpdate.listingId),
                        )
                          .unwrap()
                          .catch((error) =>
                            console.error("Failed to delete listing", error),
                          );
                      }}
                    >
                      Delete
                    </Button>
                  </div>

                  <div className="d-flex justify-content-between">
                    <Button
                      variant="secondary"
                      type="button"
                      className="button-style set-center"
                      onClick={() => {
                        dispatch(setShowListingUpdate(undefined));
                        router.push("/");
                      }}
                    >
                      Cancel
                    </Button>

                    <Button
                      variant="primary"
                      type="submit"
                      className="button-style set-center"
                    >
                      Update listing
                    </Button>
                  </div>
                </Form>
              )}
            </Formik>
          </Card.Body>
        </Card>
      </div>
    </Container>
  );
}

export default UpdateListing;
