"use client";

import { ChangeEvent, useEffect, useState } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Image from "react-bootstrap/Image";
import Card from "react-bootstrap/Card";
import Container from "react-bootstrap/Container";
import Alert from "react-bootstrap/Alert";
import { Carousel } from "react-bootstrap";
import { Formik } from "formik";
import * as yup from "yup";
import { useRouter } from "next/navigation";

import { createListing } from "@/lib/redux/thunks";
import { useAppDispatch } from "@/lib/redux/hooks";
import { apiRequest } from "@/lib/apiRequest";

const CreateListingSchema = yup.object({
  title: yup.string().min(1).max(20).required(),
  price: yup.number().min(0).required(),
  description: yup.string().min(10).max(255).required(),
  images: yup
    .array()
    .of(yup.mixed<File>().required())
    .min(1, "You must upload at least one image")
    .max(5, "You can upload up to 5 images")
    .test("fileType", "Only JPG/PNG files are allowed", (files) =>
      files
        ? files.every((file) => ["image/jpeg", "image/png"].includes(file.type))
        : false,
    )
    .required(),
});

export type CreateListingDetails = {
  title: string;
  price: number;
  description: string;
  images: File[];
};

function CreateListing() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const [paymentStatus, setPaymentStatus] = useState<
    "loading" | "not_started" | "pending" | "onboarding_required" | "ready"
  >("loading");
  const [paymentError, setPaymentError] = useState<string>();
  const [startingOnboarding, setStartingOnboarding] = useState(false);
  const [imagesUrls, setImagesUrls] = useState<string[]>([
    "/images/no-image.png",
  ]);
  const [createError, setCreateError] = useState<string>();

  useEffect(() => {
    let active = true;
    apiRequest
      .get<{
        status: "not_started" | "pending" | "onboarding_required" | "ready";
      }>("/users/me/payment/status")
      .then(({ status }) => {
        if (active) setPaymentStatus(status);
      })
      .catch((error: unknown) => {
        if (!active) return;
        setPaymentError(
          error instanceof Error
            ? error.message
            : "Unable to check Stripe setup",
        );
        setPaymentStatus("not_started");
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(
    () => () => {
      imagesUrls.forEach((imageUrl) => {
        if (imageUrl.startsWith("blob:")) URL.revokeObjectURL(imageUrl);
      });
    },
    [imagesUrls],
  );

  const startOnboarding = async () => {
    setStartingOnboarding(true);
    setPaymentError(undefined);
    try {
      const { onboardingUrl } = await apiRequest.post<{
        onboardingUrl: string;
      }>("/users/me/payment/onboarding-link");
      window.location.assign(onboardingUrl);
    } catch (error) {
      setPaymentError(
        error instanceof Error
          ? error.message
          : "Unable to start Stripe onboarding",
      );
      setStartingOnboarding(false);
    }
  };

  const handleCreate = async (data: CreateListingDetails) => {
    setCreateError(undefined);
    try {
      await dispatch(createListing(data)).unwrap();
      router.push("/");
    } catch (error) {
      console.error("Failed to create listing:", error);
      setCreateError(
        String(error).includes("409")
          ? "Complete Stripe seller setup from your profile before creating a listing."
          : "Listing could not be created. Please try again.",
      );
    }
  };

  return (
    <Container className="py-5">
      <div className="mx-auto" style={{ maxWidth: "700px" }}>
        <Card>
          <Card.Header>
            <Card.Title className="mb-0">Create listing</Card.Title>
          </Card.Header>

          <Card.Body>
            {paymentStatus !== "ready" ? (
              <>
                {paymentStatus === "loading" ? (
                  <Alert variant="info">Checking Stripe seller setup...</Alert>
                ) : (
                  <>
                    <p>
                      Complete Stripe seller onboarding before creating your
                      first listing. You’ll return here when you finish.
                    </p>
                    <Button
                      onClick={startOnboarding}
                      disabled={startingOnboarding}
                    >
                      {startingOnboarding
                        ? "Redirecting to Stripe..."
                        : paymentStatus === "pending" ||
                            paymentStatus === "onboarding_required"
                          ? "Continue Stripe setup"
                          : "Set up seller payments"}
                    </Button>
                  </>
                )}
                {paymentError && (
                  <Alert variant="danger" className="mt-3">
                    {paymentError}
                  </Alert>
                )}
              </>
            ) : (
              <>
                {createError && (
                  <Alert variant="warning">{createError}</Alert>
                )}
                <Carousel className="mb-4">
                  {imagesUrls.map((imageUrl) => (
                    <Carousel.Item key={imageUrl}>
                      <div className="listing-carousel-frame">
                        <Image
                          alt="listing image"
                          src={imageUrl}
                          fluid
                          className="d-block listing-carousel-image"
                        />
                      </div>
                    </Carousel.Item>
                  ))}
                </Carousel>

                <Formik<CreateListingDetails>
                  validationSchema={CreateListingSchema}
                  onSubmit={handleCreate}
                  initialValues={{
                    title: "",
                    price: 0,
                    description: "",
                    images: [],
                  }}
                >
                  {({
                    handleSubmit,
                    handleChange,
                    touched,
                    errors,
                    setFieldValue,
                  }) => (
                    <Form noValidate onSubmit={handleSubmit}>
                      <Form.Group className="mb-3">
                        <Form.Label>Select images</Form.Label>

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
                                images.map((image) =>
                                  URL.createObjectURL(image),
                                ),
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
                          min={0}
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
                          maxLength={255}
                          name="description"
                          id="description"
                          placeholder="Describe your item"
                          onChange={handleChange}
                          isInvalid={
                            touched.description && !!errors.description
                          }
                        />

                        <Form.Control.Feedback type="invalid">
                          {errors.description}
                        </Form.Control.Feedback>
                      </Form.Group>

                      <div className="d-flex justify-content-between">
                        <Button
                          variant="secondary"
                          type="button"
                          onClick={() => router.push("/")}
                        >
                          Cancel
                        </Button>

                        <Button variant="primary" type="submit">
                          Create listing
                        </Button>
                      </div>
                    </Form>
                  )}
                </Formik>
              </>
            )}
          </Card.Body>
        </Card>
      </div>
    </Container>
  );
}

export default CreateListing;
