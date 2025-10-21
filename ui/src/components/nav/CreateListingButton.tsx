import { redirect } from "next/navigation";
import { Button } from "react-bootstrap";
import { PlusLg } from "react-bootstrap-icons";

function CreateListingButton() {
  return (
    <Button onClick={() => redirect("/create")}>
      <PlusLg className="pb-1 pe-1" />
      Create listing
    </Button>
  );
}

export default CreateListingButton;
