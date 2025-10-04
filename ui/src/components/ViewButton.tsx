import { useAppDispatch } from "@/lib/redux/hooks";
import { setShowListingView } from "@/lib/redux/listingsSlice";
import { Button } from "react-bootstrap";

interface ViewButtonProps {
  listingId: string;
}

function ViewButton({ listingId }: ViewButtonProps) {
  const dispatch = useAppDispatch();
  return (
    <Button
      style={{ width: "10rem" }}
      onClick={() => {
        dispatch(setShowListingView(listingId));
      }}
    >
      View
    </Button>
  );
}

export default ViewButton;
