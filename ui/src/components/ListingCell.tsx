import Card from "react-bootstrap/Card";
import { Container } from "react-bootstrap";
import { EventType, Listing } from "@/types";
import ViewListing from "@/components/ViewListing";
import UpdateListing from "@/components/UpdateListing";
import { useAuth0 } from "@auth0/auth0-react";
import ModifyListingDropdown from "./ModifyListingDropdown";
import ViewButton from "./ViewButton";

interface ListingCellProps {
  listing: Listing;
}
function ListingCell({ listing }: ListingCellProps) {
  const { userId, title, price, imagesUrls, status, listingId } = listing;
  const { user } = useAuth0();

  const isUserListing =
    user?.sub === userId && status !== EventType.LISTING_PURCHASED;

  const listingActionButton = isUserListing ? (
    <ModifyListingDropdown listingId={listingId} status={status} />
  ) : (
    <ViewButton listingId={listingId} />
  );

  return (
    <>
      <Card style={{ width: "18rem" }} className="mt-3 blure">
        <Card.Body>
          <Card.Img variant="top" src={imagesUrls[0]} />
          <Card.Title>{title}</Card.Title>
          <Card.Text>Price: {price}</Card.Text>
          <Container className="d-flex justify-content-center">
            {listingActionButton}
          </Container>
        </Card.Body>
      </Card>
      <ViewListing listing={listing} />
      <UpdateListing listing={listing} />
    </>
  );
}

export default ListingCell;
