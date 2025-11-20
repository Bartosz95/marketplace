import { de } from "zod/locales";
import { BookmarkRepository } from "../repositories/bookmarkRepository";
import { EventSourceRepository } from "../repositories/eventSourceRepository";
import { Event } from "../types";

export const Iteration = (
  bookmarkRepository: BookmarkRepository,
  eventSourceRepository: EventSourceRepository,
  processManager: (event: Event) => Promise<void>,
  eventsNumber: number,
  iterationMetrics: {
    startMetricsServer?: (port?: number) => void;
    eventsProcessed: any;
    bookmartDepth: any;
    eventDuration: any;
  }
) => {
  const { eventsProcessed, bookmartDepth, eventDuration } = iterationMetrics;
  const iterate = async () => {
    const bookmarkPosition = await bookmarkRepository.getBookmark();
    const events = await eventSourceRepository.getEventsFromPosition(
      bookmarkPosition + 1,
      eventsNumber
    );
    if (events.length === 0) return;
    const start = process.hrtime();
    for (const event of events) {
      await processManager(event);
      eventsProcessed.labels({ event_type: event.eventType }).inc();
      const depth = bookmarkPosition + events.length - event.position;
      bookmartDepth.set(depth);
      await bookmarkRepository.setBookmark(event.position);
    }
    const diff = process.hrtime(start);
    const duration = diff[0] + diff[1] / (1e9 * events.length);
    eventDuration.observe(duration);
  };
  return iterate;
};
