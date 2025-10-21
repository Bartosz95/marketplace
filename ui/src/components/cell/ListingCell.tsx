import Card from "react-bootstrap/Card";
import { Container } from "react-bootstrap";
import { EventType, Listing } from "@/types";
import { useAuth0 } from "@auth0/auth0-react";
import ModifyListingDropdown from "./ModifyListingDropdown";
import ViewButton from "./ViewButton";

interface ListingCellProps {
  listing: Listing;
}
function ListingCell({ listing }: ListingCellProps) {
  const { userId, title, price, imagesUrls, status } = listing;
  const { user } = useAuth0();

  const isUserListing =
    user?.sub === userId && status !== EventType.LISTING_PURCHASED;

  const listingActionButton = isUserListing ? (
    <ModifyListingDropdown listing={listing} />
  ) : (
    <ViewButton listing={listing} />
  );

  return (
    <>
      <Card className="listing-cell">
        <Card.Body>
          <Card.Img
            variant="top"
            src={imagesUrls[0]}
            className="listing-cell-image"
            alt="listing image"
          />
          <Card.Title>{title}</Card.Title>
          <Card.Text>${price}</Card.Text>
          {listingActionButton}
        </Card.Body>
      </Card>
    </>
  );
}

export default ListingCell;
