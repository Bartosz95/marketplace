import { useRouter } from "next/navigation";
import { Button } from "react-bootstrap";
import { PlusLg } from "react-bootstrap-icons";

function CreateListingButton() {
  const router = useRouter();

  return (
    <Button onClick={() => router.push("/create")} className="button-style">
      <PlusLg className="pb-1 pe-1" />
      Create listing
    </Button>
  );
}

export default CreateListingButton;
