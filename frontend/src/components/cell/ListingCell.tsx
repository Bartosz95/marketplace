import Card from "react-bootstrap/Card";
import { EventType, Listing } from "@/types";
import { useAuth0 } from "@auth0/auth0-react";
import ModifyListingDropdown from "./ModifyListingDropdown";
import ViewButton from "./ViewButton";
import { User } from "@/lib/redux/listingsSlice";

interface ListingCellProps {
  listing: Listing;
  user: User | undefined;
}
function ListingCell({ listing, user }: ListingCellProps) {
  const { userId, title, price, imagesUrls } = listing;

  const listingActionButton =
    user?.userId === userId ? (
      <ModifyListingDropdown listing={listing} />
    ) : (
      <ViewButton listing={listing} />
    );

  return (
    <Card className="listing-cell m-3">
      <Card.Body>
        <Card.Img
          variant="top"
          src={imagesUrls[0]}
          className="mb-3"
          alt="listing image"
        />
        <Card.Title>{title}</Card.Title>
        <Card.Text>${price}</Card.Text>
        {listingActionButton}
      </Card.Body>
    </Card>
  );
}

export default ListingCell;
