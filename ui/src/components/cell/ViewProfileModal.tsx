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
      className="modal-view m-auto"
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
        <h5>Created at: {createdAt.toLocaleDateString()}</h5>
        <Modal.Footer></Modal.Footer>
      </Modal.Body>
    </Modal>
  );
}

export default ViewProfile;
