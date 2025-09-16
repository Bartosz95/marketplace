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
      data: { ...data, version: 1 },
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
    const version =
      inMemoryDB.filter((e) => e.listing_id === listing_id).length + 1;
    const event: Event = {
      position_id: inMemoryDB.length + 1,
      listing_id: listing_id || (crypto.randomUUID() as UUID),
      version,
      created_at: new Date().toISOString(),
      event_type,
      data: { ...data, version },
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
  describe("createListing", () => {
    test("when call > create new listing", async () => {
      await listings.createListing({
        title: "Test",
        description: "Test description",
        price: 100,
      });

      expect(inMemoryDB).toHaveLength(1);
      expect(inMemoryDB).toEqual(
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

    test("when call 2 times > repository has length 2 and listings have different ids", async () => {
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
      expect(inMemoryDB).toHaveLength(2);
      expect(inMemoryDB[0].listing_id).not.toEqual(inMemoryDB[1].listing_id);
    });
  });

  describe("getListing", () => {
    test("when call > build listing from events", async () => {
      const listing_id = crypto.randomUUID() as UUID;
      inMemoryDB.push({
        position_id: 1,
        listing_id,
        version: 1,
        created_at: "2025-09-15T10:29:11.699Z",
        event_type: EventType.LISTING_CREATED,
        data: {
          title: "Shoes",
          description: "Test description",
          price: 100,
        },
        metadata: {},
      });
      inMemoryDB.push({
        position_id: 2,
        listing_id,
        version: 2,
        created_at: "2025-09-15T10:29:11.699Z",
        event_type: EventType.LISTING_UPDATED,
        data: {
          title: "Kicks",
          description: "Test description",
          price: 200,
        },
        metadata: {},
      });
      inMemoryDB.push({
        position_id: 1,
        listing_id: crypto.randomUUID() as UUID,
        version: 1,
        created_at: "2025-09-15T10:29:11.699Z",
        event_type: EventType.LISTING_CREATED,
        data: {
          title: "Another listing",
          description: "Test description",
          price: 10,
        },
        metadata: {},
      });

      const result = await listings.getListing(listing_id);
      expect(result).toEqual({
        listing_id,
        version: 2,
        status: EventType.LISTING_UPDATED,
        title: "Kicks",
        description: "Test description",
        price: 200,
      });
    });
  });

  describe("updateListing", () => {
    test("when call > create new event for the same listing", async () => {
      const listing_id = crypto.randomUUID() as UUID;
      const event: Event = {
        position_id: 1,
        listing_id,
        version: 1,
        created_at: "2025-09-15T10:29:11.699Z",
        event_type: EventType.LISTING_CREATED,
        data: {
          title: "Shoes",
          description: "Test description",
          price: 100,
        },
        metadata: {},
      };
      inMemoryDB.push(event);

      await listings.updateListing(listing_id, {
        title: "Kicks",
        description: "Test description",
        price: 200,
      });

      expect(inMemoryDB).toHaveLength(2);
      expect(inMemoryDB[0].listing_id).toEqual(listing_id);
      expect(inMemoryDB[1].listing_id).toEqual(listing_id);
      expect(inMemoryDB).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            event_type: EventType.LISTING_UPDATED,
            version: 2,
            data: expect.objectContaining({
              title: "Kicks",
              description: "Test description",
              price: 200,
            }),
          }),
        ])
      );
      await expect(listings.getListing(listing_id)).resolves.toEqual({
        listing_id,
        version: 2,
        status: EventType.LISTING_UPDATED,
        title: "Kicks",
        description: "Test description",
        price: 200,
      });
    });
  });

  describe("purchaseListing", () => {
    test("when call > set listing state as purchases", async () => {
      const listing_id = crypto.randomUUID() as UUID;
      const event: Event = {
        position_id: 1,
        listing_id,
        version: 1,
        created_at: "2025-09-15T10:29:11.699Z",
        event_type: EventType.LISTING_CREATED,
        data: {
          title: "Shoes",
          description: "Test description",
          price: 100,
        },
        metadata: {},
      };
      inMemoryDB.push(event);

      await listings.purchaseListing(listing_id);

      await expect(inMemoryDB).toHaveLength(2);
      expect(inMemoryDB[0].listing_id).toEqual(listing_id);
      expect(inMemoryDB[1].listing_id).toEqual(listing_id);
      console.log(inMemoryDB);
      expect(inMemoryDB).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            event_type: EventType.LISTING_PURCHASED,
          }),
        ])
      );
      await expect(listings.getListing(listing_id)).resolves.toEqual({
        listing_id,
        version: 2,
        status: EventType.LISTING_PURCHASED,
        title: "Shoes",
        description: "Test description",
        price: 100,
      });
    });
  });

  describe("deleteListing", () => {
    test("when call > set listing state as deleted", async () => {
      const listing_id = crypto.randomUUID() as UUID;
      const event: Event = {
        position_id: 1,
        listing_id,
        version: 1,
        created_at: "2025-09-15T10:29:11.699Z",
        event_type: EventType.LISTING_CREATED,
        data: {
          title: "Shoes",
          description: "Test description",
          price: 100,
        },
        metadata: {},
      };
      inMemoryDB.push(event);

      await listings.purchaseListing(listing_id);

      await expect(inMemoryDB).toHaveLength(2);
      expect(inMemoryDB[0].listing_id).toEqual(listing_id);
      expect(inMemoryDB[1].listing_id).toEqual(listing_id);
      console.log(inMemoryDB);
      expect(inMemoryDB).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            event_type: EventType.LISTING_PURCHASED,
          }),
        ])
      );
      await expect(listings.getListing(listing_id)).resolves.toEqual({
        listing_id,
        version: 2,
        status: EventType.LISTING_PURCHASED,
        title: "Shoes",
        description: "Test description",
        price: 100,
      });
    });
  });
});
