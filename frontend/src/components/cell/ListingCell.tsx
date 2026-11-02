import Card from "react-bootstrap/Card";
import { Listing } from "@/types";
import ViewButton from "./ViewButton";
import { User } from "@/lib/redux/listingsSlice";
import UpdateButton from "./UpdateButton";

interface ListingCellProps {
  listing: Listing;
  user: User | undefined;
}
function ListingCell({ listing, user }: ListingCellProps) {
  const { userId, title, price, imagesUrls } = listing;

  const listingActionButton =
    user?.userId === userId ? (
      <UpdateButton listing={listing} />
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
