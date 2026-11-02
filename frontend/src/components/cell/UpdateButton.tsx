import { useAppDispatch } from "@/lib/redux/hooks";
import {
  setShowListingUpdate,
  setShowListingView,
} from "@/lib/redux/listingsSlice";
import { Listing } from "@/types";
import { useRouter } from "next/navigation";
import { Button } from "react-bootstrap";

interface UpdateButtonProps {
  listing: Listing;
}

function UpdateButton({ listing }: UpdateButtonProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  return (
    <Button
      className="button-style set-center"
      onClick={() => {
        dispatch(setShowListingUpdate(listing));
        router.push("/update");
      }}
    >
      Update
    </Button>
  );
}

export default UpdateButton;
