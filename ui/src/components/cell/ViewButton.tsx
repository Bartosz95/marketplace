import { useAppDispatch } from "@/lib/redux/hooks";
import { setShowListingView } from "@/lib/redux/listingsSlice";
import { Listing } from "@/types";
import { Button } from "react-bootstrap";

interface ViewButtonProps {
  listing: Listing;
}

function ViewButton({ listing }: ViewButtonProps) {
  const dispatch = useAppDispatch();
  return (
    <Button
      style={{ width: "10rem" }}
      onClick={() => {
        dispatch(setShowListingView(listing));
      }}
    >
      View
    </Button>
  );
}

export default ViewButton;
