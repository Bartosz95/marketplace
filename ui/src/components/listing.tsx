import { UUID } from "crypto";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";

export interface ListingProps {
  description: string;
  imagesUrls: string[];
  listingId: UUID;
  price: number;
  status: string;
  title: string;
  version: number;
}

function Listing({
  description,
  imagesUrls,
  listingId,
  price,
  status,
  title,
  version,
}: ListingProps) {
  return (
    <Card style={{ width: "18rem" }}>
      <Card.Body>
        <Card.Img
          variant="top"
          className="width: 20%"
          src={`http://localhost:3000/images/${listingId}/${imagesUrls[0]}`}
        />
        <Card.Title>{title}</Card.Title>
        <Card.Subtitle>Price: {price} AUD</Card.Subtitle>
        <Card.Text className="card-text">{description}</Card.Text>
        <Button variant="primary">View</Button>
      </Card.Body>
    </Card>
  );
}

export default Listing;
