import { Carousel } from "react-bootstrap";
import Image from "react-bootstrap/Image";

interface ImagePreviewProps {
  imagesUrls?: string[];
}

function ImagePreview({
  imagesUrls = [`/images/no-image.png`],
}: ImagePreviewProps) {
  imagesUrls = imagesUrls.length === 0 ? [`/images/no-image.png`] : imagesUrls
  return (
    <Carousel className="mb-3" style={{ width: "70%", margin: "auto" }}>
      {imagesUrls.map((imageUrl) => (
        <Carousel.Item key={imageUrl}>
          <Image alt="no image" src={imageUrl} fluid />
        </Carousel.Item>
      ))}
    </Carousel>
  );
}

export default ImagePreview;
