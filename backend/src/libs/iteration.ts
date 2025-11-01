import { Logger } from "winston";
import { BookmarkRepository } from "../repositories/bookmarkRepository";
import { EventSourceRepository } from "../repositories/eventSourceRepository";
import { Event } from "../types";

export const Iteration = (
  logger: Logger,
  bookmarkRepository: BookmarkRepository,
  eventSourceRepository: EventSourceRepository,
  processManager: (event: Event) => Promise<void>,
  eventsNumber: number
) => {
  const iterate = async () => {
      const bookmarkPosition = await bookmarkRepository.getBookmark();
      const events = await eventSourceRepository.getEventsFromPosition(
        bookmarkPosition,
        eventsNumber
      );
      if (events.length === 0) return;
      logger.debug(`Processing ${events.length} events`);
      for (const event of events) {
        await processManager(event);
        await bookmarkRepository.setBookmark(event.position);
      }
  };
  return iterate;
};
