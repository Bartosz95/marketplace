import { UUID } from "crypto";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";

export interface ListingProps {
  description: string;
  imageUrls: string[];
  listingId: UUID;
  price: number;
  status: string;
  title: string;
  version: number;
}

function Listing({
  description,
  imageUrls,
  listingId,
  price,
  status,
  title,
  version,
}: ListingProps) {
  return (
    <Card style={{ width: "18rem;" }}>
      <Card.Body>
        <Card.Img
          variant="top"
          className="width: 20%"
          src="https://media.canva.com/v2/mockup-template-rasterize/color0:ffffff/image0:s3%3A%2F%2Ftemplate.canva.com%2FEAGWY1Jthrw%2F1%2F0%2F933w-RDMlCrPnjG4.png/mockuptemplateid:FqXFzEXX7/size:L?csig=AAAAAAAAAAAAAAAAAAAAABnagLfVb2CaKB9odeDlWn6HDzLmb4Yg1UEQfWCH66w3&exp=1758233270&osig=AAAAAAAAAAAAAAAAAAAAACTYRtHt-Ro0KJcMuI1RbFr17pOkXux4VXn2k96m9M9a&seoslug=black-white-minimal-inspirational-t-shirt&signer=marketplace-rpc"
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
