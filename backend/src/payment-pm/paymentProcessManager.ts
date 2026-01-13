import { ModifyImagesUrls } from "../libs/modifyImagesUrls";
import { EventSourceRepository } from "../repositories/eventSourceRepository";
import { PaymentProviderRepository } from "../repositories/paymentProviderRepository";
import { Event, EventType } from "../types";

export const PaymentProcessManager =
  (
    paymentProvider: PaymentProviderRepository,
    eventSourceRepository: EventSourceRepository,
    modifyImagesUrls: ModifyImagesUrls
  ) =>
  async (event: Event) => {
    const { eventType } = event;
    switch (eventType) {
      case EventType.LISTING_CREATED:
        const created_id = event.streamId;
        const created_name = event.data.title;
        const created_price = event.data.price;
        const paymentLink = await paymentProvider.createProduct(
          created_id,
          created_name,
          created_price
        );
        eventSourceRepository.insertEventByStreamId(
          created_id,
          EventType.PAYMENT_LINK_CREATED,
          { paymentLink }
        );
        break;
      case EventType.LISTING_UPDATED:
        const updated_id = event.streamId;
        const updated_name = event.data.title;
        const updated_price = event.data.price;
        if (updated_name) {
          await paymentProvider.updateProductName(updated_id, updated_name);
        }
        if (updated_price) {
          await paymentProvider.updateProductPrice(updated_id, updated_price);
        }
        break;
      case EventType.IMAGES_UPLOADED:
        const images_updated_id = event.streamId;
        const images_updated_images_urls = modifyImagesUrls.addImageHostToLinks(
          event.data.imagesUrls
        );
        await paymentProvider.updateProductImages(
          images_updated_id,
          images_updated_images_urls
        );
        break;
    }
  };
