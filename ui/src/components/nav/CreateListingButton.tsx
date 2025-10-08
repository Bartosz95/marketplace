import { Button } from "react-bootstrap";

function CreateListingButton() {
  return (
    <Button href="/create">
      <i className="bi bi-plus-lg me-1" />
      Create listing
    </Button>
  );
}

export default CreateListingButton;
