"use client";
import { useCallback, useEffect, useState } from "react";
import Modal from "react-bootstrap/Modal";
import Image from "react-bootstrap/Image";
import Button from "react-bootstrap/Button";
import Alert from "react-bootstrap/Alert";
import Spinner from "react-bootstrap/Spinner";
import { User } from "@auth0/auth0-react";
import { apiRequest } from "@/lib/apiRequest";

interface ProfileProps {
  show: boolean;
  handleClose: () => void;
  user: User;
}

function ViewProfile({ show, handleClose, user }: ProfileProps) {
  const [paymentStatus, setPaymentStatus] = useState<
    "loading" | "not_started" | "pending" | "onboarding_required" | "ready"
  >("loading");
  const [paymentError, setPaymentError] = useState<string>();
  const [startingOnboarding, setStartingOnboarding] = useState(false);

  const refreshPaymentStatus = useCallback(async () => {
    const response = await apiRequest.get<{
      status: "not_started" | "pending" | "onboarding_required" | "ready";
    }>("/users/me/payment/status");
    return response.status;
  }, []);

  useEffect(() => {
    if (!show) return;
    let active = true;
    refreshPaymentStatus()
      .then((status) => {
        if (active) setPaymentStatus(status);
      })
      .catch((error: unknown) => {
        if (!active) return;
        setPaymentError(
          error instanceof Error
            ? error.message
            : "Unable to check seller payment setup",
        );
        setPaymentStatus("not_started");
      });

    return () => {
      active = false;
    };
  }, [refreshPaymentStatus, show]);

  const closeProfile = () => {
    setPaymentStatus("loading");
    setPaymentError(undefined);
    handleClose();
  };

  const startOnboarding = async () => {
    setStartingOnboarding(true);
    setPaymentError(undefined);
    try {
      let response = await apiRequest.post<{
        status?: string;
        onboardingUrl?: string;
      }>("/users/me/payment/onboarding-link");

      for (
        let attempt = 0;
        attempt < 30 && !response.onboardingUrl;
        attempt++
      ) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        const status = await apiRequest.get<{
          status: "not_started" | "pending" | "onboarding_required" | "ready";
        }>("/users/me/payment/status");
        setPaymentStatus(status.status);
        if (status.status === "ready") return;
        if (status.status === "onboarding_required") {
          response = await apiRequest.post<{
            status?: string;
            onboardingUrl?: string;
          }>("/users/me/payment/onboarding-link");
          break;
        }
      }

      if (!response.onboardingUrl) {
        setPaymentStatus("pending");
        setPaymentError(
          "Your Stripe account is still being created. Try again shortly.",
        );
        return;
      }
      window.location.assign(response.onboardingUrl);
    } catch (error) {
      setPaymentError(
        error instanceof Error
          ? error.message
          : "Unable to start Stripe onboarding",
      );
    } finally {
      setStartingOnboarding(false);
    }
  };

  const createdAt = new Date(user.updated_at || Date());
  return (
    <Modal
      show={show}
      onHide={closeProfile}
      backdrop="static"
      aria-labelledby="contained-modal-title-vcenter"
      className="blure m-auto"
      centered
    >
      <Modal.Header closeButton></Modal.Header>
      <Modal.Body className="m-auto">
        <Image
          className="profile-modal-image mb-3"
          src={user?.picture}
          alt="profile image"
          roundedCircle
          fluid
        />
        <h4>Name: {user.nickname}</h4>
        <h5>E-mail: {user.email}</h5>
        <h5>Since: {createdAt.toDateString()}</h5>
        <hr />

        {paymentStatus === "ready" ? (
          <Alert variant="success">Stripe payments are ready.</Alert>
        ) : (
          <Button
            onClick={startOnboarding}
            disabled={startingOnboarding || paymentStatus === "loading"}
          >
            {startingOnboarding ? (
              <>
                <Spinner size="sm" className="me-2" />
                Connecting to Stripe...
              </>
            ) : paymentStatus === "pending" ? (
              "Continue account setup"
            ) : paymentStatus === "onboarding_required" ? (
              "Complete Stripe setup"
            ) : (
              "Set up seller payments"
            )}
          </Button>
        )}
        {paymentError && (
          <Alert variant="danger" className="mt-3">
            {paymentError}
          </Alert>
        )}
      </Modal.Body>
    </Modal>
  );
}

export default ViewProfile;
