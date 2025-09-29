import { Carousel } from "react-bootstrap";
import Image from "react-bootstrap/Image";

interface ImagePreviewProps {
  imagesUrls: string[];
}

function ImagePreview({ imagesUrls }: ImagePreviewProps) {
  return (
    <Carousel className="mb-3" style={{ width: "70%", margin: "auto" }}>
      {imagesUrls.map((imageUrl) => (
        <Carousel.Item key={imageUrl}>
          <Image
            alt="no image"
            src={imageUrl}
            style={{ margin: "auto" }}
            fluid
          />
        </Carousel.Item>
      ))}
    </Carousel>
  );
}

export default ImagePreview;
