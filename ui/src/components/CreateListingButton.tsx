import { useAppDispatch } from "@/lib/redux/hooks";
import { setShowListingCreate } from "@/lib/redux/listingsSlice";
import { Button } from "react-bootstrap";

function CreateListingButton() {
  const dispatch = useAppDispatch();
  return (
    <Button onClick={() => dispatch(setShowListingCreate(true))}>
      <i className="bi bi-plus-lg me-1" />
      Create listing
    </Button>
  );
}

export default CreateListingButton;
