"use client";
import Modal from "react-bootstrap/Modal";
import Image from "react-bootstrap/Image";
import { User } from "@auth0/auth0-react";

interface ProfileProps {
  show: boolean;
  handleClose: () => void;
  user: User;
}

function ViewProfile({ show, handleClose, user }: ProfileProps) {
  const createdAt = new Date(user.updated_at || Date());
  return (
    <Modal
      show={show}
      onHide={handleClose}
      backdrop="static"
      aria-labelledby="contained-modal-title-vcenter"
      style={{ margin: "auto" }}
      centered
    >
      <Modal.Header closeButton></Modal.Header>
      <Modal.Body style={{ margin: "auto" }}>
        <Image
          style={{ width: "14rem" }}
          className="mb-3"
          src={user?.picture}
          alt="no image"
          roundedCircle
          fluid
        />
        <h4>Name: {user.nickname}</h4>
        <h5>E-mail: {user.email}</h5>
        <h5>Created at: {createdAt.toLocaleDateString()}</h5>
        <Modal.Footer></Modal.Footer>
      </Modal.Body>
    </Modal>
  );
}

export default ViewProfile;
