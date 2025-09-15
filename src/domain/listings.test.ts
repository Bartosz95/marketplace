import { UUID } from "crypto";
import crypto from "crypto";
import { ListingsRepository } from "../listings/listingsRepository";
import { EventType, Event } from "../types";
import { Listings } from "./listings";
import winston from "winston";

const logger = winston.createLogger();

const LocalRepository = (inMemoryDB: Event[]) => {
  const insertEvent = async (event_type: EventType, data: any) => {
    const event: Event = {
      position_id: inMemoryDB.length + 1,
      listing_id: data.listing_id || (crypto.randomUUID() as UUID),
      version: 1,
      created_at: new Date().toISOString(),
      event_type,
      data,
      metadata: {},
    };
    inMemoryDB.push(event);
  };
  const getEvents = async (limit: number, returnDeleted: boolean) => {
    return inMemoryDB;
  };
  const insertEventByID = async (
    listing_id: UUID,
    event_type: EventType,
    data?: any
  ) => {
    const event: Event = {
      position_id: inMemoryDB.length + 1,
      listing_id: listing_id || (crypto.randomUUID() as UUID),
      version: inMemoryDB.filter((e) => e.listing_id === listing_id).length + 1,
      created_at: new Date().toISOString(),
      event_type,
      data,
      metadata: {},
    };
    inMemoryDB.push(event);
  };
  const getEventsByID = async (listing_id: UUID) => {
    return inMemoryDB.filter((e) => e.listing_id === listing_id);
  };

  return {
    insertEvent,
    getEvents,
    insertEventByID,
    getEventsByID,
  } as ListingsRepository;
};

describe("listing", () => {
  const inMemoryDB: Event[] = [];
  const repository = LocalRepository(inMemoryDB);
  const listings = Listings(repository, logger);
  beforeEach(() => {
    inMemoryDB.length = 0;
  });
  describe("create", () => {
    test("call create > create new listing", async () => {
      await listings.createListing({
        title: "Test",
        description: "Test description",
        price: 100,
      });
      const result = await repository.getEvents();
      expect(result).toHaveLength(1);
      expect(result).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            data: expect.objectContaining({
              title: "Test",
              description: "Test description",
              price: 100,
            }),
          }),
        ])
      );
    });

    test("call create 2 times > repository has length 2 and listings have different ids", async () => {
      await listings.createListing({
        title: "listing 1",
        description: "Test description",
        price: 100,
      });
      await listings.createListing({
        title: "listing 2",
        description: "Test description",
        price: 100,
      });
      const result = await repository.getEvents();
      expect(result).toHaveLength(2);
      expect(result[0].listing_id).not.toEqual(result[1].listing_id);
    });
  });

  describe("update", () => {
    test("call update > create new event for the same listing id", async () => {
      await listings.createListing({
        title: "Before update",
        description: "Test description",
        price: 100,
      });
      const events = await repository.getEvents();
      const listing_id = events[0].listing_id;
      await listings.updateListing(listing_id, {
        title: "After update",
        description: "Test description",
        price: 200,
      });
      const result = await repository.getEventsByID(listing_id);
      expect(result).toHaveLength(2);
      expect(result[0].listing_id).toEqual(listing_id);
      expect(result[1].listing_id).toEqual(listing_id);
      expect(result).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            event_type: EventType.LISTING_UPDATED,
            version: 2,
            data: expect.objectContaining({
              title: "After update",
              description: "Test description",
              price: 200,
            }),
          }),
        ])
      );
    });
  });
});
