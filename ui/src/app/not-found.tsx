"use client";
import Image from "react-bootstrap/Image";
import { Container } from "react-bootstrap";

function Page() {
  return (
    <Container className="text-center">
      <Image
        src="/images/500-error.png"
        alt="Not Found"
        className="mt-4 set-center w-50"
      />
      <h1 className="mt-3">Ups... something went wrong</h1>
    </Container>
  );
}

export default Page;
