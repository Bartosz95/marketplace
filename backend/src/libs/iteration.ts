import { Counter, Gauge, Histogram } from "prom-client";
import { BookmarkRepository } from "../repositories/bookmarkRepository";
import { EventSourceRepository } from "../repositories/eventSourceRepository";
import { Event } from "../types";

export const Iteration = (
  bookmarkRepository: BookmarkRepository,
  eventSourceRepository: EventSourceRepository,
  processManager: (event: Event) => Promise<void>,
  eventsNumber: number,
  iterationMetrics: {
    processName: string;
    eventsProcessed: Counter<string>;
    bookmarkDepth: Gauge<string>;
    bookmarkPosition: Gauge<string>;
    latestEventPosition: Gauge<string>;
    eventDuration: Histogram<string>;
  },
) => {
  const {
    processName,
    eventsProcessed,
    bookmarkDepth,
    bookmarkPosition,
    latestEventPosition,
    eventDuration,
  } = iterationMetrics;
  const iterate = async () => {
    const savedBookmarkPosition = await bookmarkRepository.getBookmark();
    const currentEventPosition =
      await eventSourceRepository.getLatestEventPosition();
    const processLabels = { process_name: processName };
    bookmarkPosition.labels(processLabels).set(savedBookmarkPosition);
    latestEventPosition.labels(processLabels).set(currentEventPosition);
    bookmarkDepth
      .labels(processLabels)
      .set(Math.max(0, currentEventPosition - savedBookmarkPosition));
    const events = await eventSourceRepository.getEventsFromPosition(
      savedBookmarkPosition + 1,
      eventsNumber
    );
    if (events.length === 0) return;
    for (const event of events) {
      const start = process.hrtime();
      await processManager(event);
      const diff = process.hrtime(start);
      const duration = diff[0] + diff[1] / 1e9;
      eventsProcessed
        .labels({ process_name: processName, event_type: event.eventType })
        .inc();
      eventDuration
        .labels({ process_name: processName })
        .observe(duration);
      await bookmarkRepository.setBookmark(event.position);
      bookmarkPosition.labels(processLabels).set(event.position);
      bookmarkDepth
        .labels(processLabels)
        .set(Math.max(0, currentEventPosition - event.position));
    }
  };
  return iterate;
};
