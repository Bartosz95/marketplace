import { useAppDispatch } from "@/lib/redux/hooks";
import { setShowListingUpdate } from "@/lib/redux/listingsSlice";
import {
  archiveListing,
  deleteListing,
  restoreListing,
} from "@/lib/redux/thunks";
import { EventType, Listing } from "@/types";
import { useRouter } from "next/navigation";
import { Dropdown } from "react-bootstrap";

interface ModifyListingDropdownProps {
  listing: Listing;
}

function ModifyListingDropdown({ listing }: ModifyListingDropdownProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { listingId, status } = listing;

  const archiveButton =
    status === EventType.LISTING_ARCHIVED ? (
      <Dropdown.Item
        onClick={() => {
          void dispatch(restoreListing(listingId))
            .unwrap()
            .catch((error) => console.error("Failed to restore listing", error));
        }}
      >
        Restore
      </Dropdown.Item>
    ) : (
      <Dropdown.Item
        onClick={() => {
          void dispatch(archiveListing(listingId))
            .unwrap()
            .catch((error) => console.error("Failed to archive listing", error));
        }}
      >
        Archive
      </Dropdown.Item>
    );

  return (
    <Dropdown>
      <Dropdown.Toggle className="button-style set-center" id="dropdown-basic">
        Modify
      </Dropdown.Toggle>
      <Dropdown.Menu>
        <Dropdown.Item
          onClick={() => {
            dispatch(setShowListingUpdate(listing));
            router.push("/update");
          }}
        >
          Update
        </Dropdown.Item>
        {archiveButton}
        <Dropdown.Item
          onClick={() => {
            void dispatch(deleteListing(listingId))
              .unwrap()
              .catch((error) => console.error("Failed to delete listing", error));
          }}
        >
          Delete
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
}

export default ModifyListingDropdown;
