import { useAppDispatch } from "@/lib/redux/hooks";
import { setShowListingUpdate } from "@/lib/redux/listingsSlice";
import {
  archiveListing,
  deleteListing,
  restoreListing,
} from "@/lib/redux/thunks";
import { EventType, Listing } from "@/types";
import { redirect } from "next/navigation";
import { Dropdown } from "react-bootstrap";

interface ModifyListingDropdownProps {
  listing: Listing;
}

function ModifyListingDropdown({ listing }: ModifyListingDropdownProps) {
  const dispatch = useAppDispatch();
  const { listingId, status } = listing;

  const archiveButton =
    status === EventType.LISTING_ARCHIVED ? (
      <Dropdown.Item onClick={() => dispatch(restoreListing(listingId))}>
        Restore
      </Dropdown.Item>
    ) : (
      <Dropdown.Item onClick={() => dispatch(archiveListing(listingId))}>
        Archive
      </Dropdown.Item>
    );

  return (
    <Dropdown>
      <Dropdown.Toggle style={{ width: "10rem" }} id="dropdown-basic">
        Modify
      </Dropdown.Toggle>
      <Dropdown.Menu>
        <Dropdown.Item onClick={() => {dispatch(setShowListingUpdate(listing)); redirect('/update')}}>
          Update
        </Dropdown.Item>
        {archiveButton}
        <Dropdown.Item onClick={() => dispatch(deleteListing(listingId))}>
          Delete
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
}

export default ModifyListingDropdown;
