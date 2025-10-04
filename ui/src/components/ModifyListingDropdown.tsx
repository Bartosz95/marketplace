import { useAppDispatch } from "@/lib/redux/hooks";
import { setShowListingUpdate } from "@/lib/redux/listingsSlice";
import {
  archiveListing,
  deleteListing,
  restoreListing,
} from "@/lib/redux/thunks";
import { EventType } from "@/types";
import { Dropdown } from "react-bootstrap";

interface ModifyListingDropdownProps {
  listingId: string;
  status: EventType;
}

function ModifyListingDropdown({ listingId, status }: ModifyListingDropdownProps) {
  const dispatch = useAppDispatch();

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
        <Dropdown.Item
          onClick={() => dispatch(setShowListingUpdate(listingId))}
        >
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
