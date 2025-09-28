
CREATE USER default_user WITH PASSWORD 'password';
CREATE DATABASE marketplace OWNER default_user;
GRANT ALL PRIVILEGES ON DATABASE marketplace TO default_user;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

\connect marketplace;

CREATE SCHEMA event_store AUTHORIZATION default_user;

CREATE TABLE IF NOT EXISTS event_store.events (
  stream_id   UUID DEFAULT gen_random_uuid(),
  position    SERIAL PRIMARY KEY,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  version     INT DEFAULT 1,
  event_type  TEXT NOT NULL,
  data        JSONB,
  metadata    JSONB 
);

ALTER TABLE event_store.events OWNER TO default_user;

CREATE SCHEMA states AUTHORIZATION default_user;

CREATE TABLE IF NOT EXISTS states.listings (
  listing_id    UUID PRIMARY KEY,
  user_id       TEXT,
  modified_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status        TEXT NOT NULL,
  version       INTEGER NOT NULL,
  title         TEXT NOT NULL,
  description   TEXT NOT NULL,
  price         INTEGER NOT NULL,
  images_urls   TEXT[] NOT NULL
);

ALTER TABLE states.listings OWNER TO default_user;
CREATE TABLE IF NOT EXISTS states.purchases (
  listing_id    UUID PRIMARY KEY,
  seller_id     TEXT,
  buyer_id      TEXT,
  price         INTEGER NOT NULL,
  modified_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status        TEXT NOT NULL,
  version       INTEGER NOT NULL
);

ALTER TABLE states.purchases OWNER TO default_user;

CREATE TABLE IF NOT EXISTS states.bookmarks (
  process_name  TEXT NOT NULL PRIMARY KEY,
  bookmark      INTEGER NOT NULL
);

ALTER TABLE states.bookmarks OWNER TO default_user;

INSERT INTO event_store.events (stream_id, version, event_type, data, metadata) VALUES 
    ('D8E31AB4-0D4F-4031-A9B9-2BC0A963A4B0', 1, 'LISTING_CREATED',
    '{"userId": "d0f2ab60-65ff-4567-9b56-901abcdef245", 
      "title":"Green Men T-Shirt",
      "price":"25",
      "description":"A soft and comfortable green T-shirt made from 100% cotton. Its modern fit makes it suitable for both casual outings and sports activities. The shirt retains its color and shape even after multiple washes."}'::jsonb, '{}'::jsonb);

INSERT INTO event_store.events (stream_id, version, event_type, data, metadata) VALUES 
    ('D8E31AB4-0D4F-4031-A9B9-2BC0A963A4B0', 2, 'IMAGES_UPLOADED',
    '{"imagesUrls": ["images/D8E31AB4-0D4F-4031-A9B9-2BC0A963A4B0/1.jpeg"]}'::jsonb, '{}'::jsonb);

INSERT INTO event_store.events (stream_id, version, event_type, data, metadata) VALUES 
    ('5F0E6081-9247-410C-A7B5-4E5FCF7AA365', 1, 'LISTING_CREATED',
    '{"userId": "e1f3bc71-76aa-4567-8c67-012abcdef256", 
      "title":"Brown shoes",
      "price":"30",
      "description":"These brown high heels are gently used but still in excellent condition, offering both comfort and style. Their classic design makes them a versatile choice for both casual outings and more formal occasions."}'::jsonb, '{}'::jsonb);

INSERT INTO event_store.events (stream_id, version, event_type, data, metadata) VALUES 
    ('5F0E6081-9247-410C-A7B5-4E5FCF7AA365', 2, 'IMAGES_UPLOADED',
    '{"imagesUrls": ["images/5F0E6081-9247-410C-A7B5-4E5FCF7AA365/1.jpeg"]}'::jsonb, '{}'::jsonb);

INSERT INTO event_store.events (stream_id, version, event_type, data, metadata) VALUES 
    ('0E8C0F75-7FFF-431A-938C-AD18F5D2265E', 1, 'LISTING_CREATED',
    '{"userId": "e1f3bc71-76aa-4567-8c67-012abcdef256", 
      "title":"Purple Women T-Shirt",
      "price":"30",
      "description":"This purple women’s T-shirt offers both comfort and style. It is designed with a flattering cut and soft-touch fabric. The vibrant color adds a bold statement to any casual outfit."}'::jsonb, '{}'::jsonb);

INSERT INTO event_store.events (stream_id, version, event_type, data, metadata) VALUES 
    ('0E8C0F75-7FFF-431A-938C-AD18F5D2265E', 2, 'IMAGES_UPLOADED',
    '{"imagesUrls": ["images/0E8C0F75-7FFF-431A-938C-AD18F5D2265E/1.jpeg"]}'::jsonb, '{}'::jsonb);

INSERT INTO event_store.events (stream_id, version, event_type, data, metadata) VALUES 
    ('2F77D3D5-73D3-4C2C-99E1-E9C6EF9F7A79', 1, 'LISTING_CREATED',
    '{"userId": "images/d4b7e60f-54a9-4567-9ef0-4567890abcde", "title":"Blue cup","price":"10","description":"This elegant blue cup adds a touch of calm and charm to your everyday routine. Crafted with durability and style in mind, it’s perfect for coffee, tea, or any beverage of your choice. Its rich color and simple design make it a versatile piece for both home and office use."}'::jsonb, '{}'::jsonb);

INSERT INTO event_store.events (stream_id, version, event_type, data, metadata) VALUES 
    ('2F77D3D5-73D3-4C2C-99E1-E9C6EF9F7A79', 2, 'IMAGES_UPLOADED',
    '{"imagesUrls": ["images/d4b7e60f-54a9-4567-9ef0-4567890abcde/1.jpeg", "images/d4b7e60f-54a9-4567-9ef0-4567890abcde/2.jpeg"]}'::jsonb, '{}'::jsonb);

INSERT INTO event_store.events (stream_id, version, event_type, data, metadata) VALUES 
    ('2BE04F60-EC70-4AC4-A792-21B5CAE89546', 1, 'LISTING_CREATED',
    '{"userId": "b2f5c48d-98e7-4567-9cde-234567890abc", "title":"Boots","price":"30","description":"These classic brown boots offer a timeless look that pairs effortlessly with both casual and dressy outfits. Made with sturdy materials, they provide comfort and durability for everyday wear. Their versatile design makes them a must-have staple for any wardrobe."}'::jsonb, '{}'::jsonb);

INSERT INTO event_store.events (stream_id, version, event_type, data, metadata) VALUES 
    ('2BE04F60-EC70-4AC4-A792-21B5CAE89546', 2, 'IMAGES_UPLOADED',
    '{"imagesUrls": ["images/b2f5c48d-98e7-4567-9cde-234567890abc/1.jpeg","images/b2f5c48d-98e7-4567-9cde-234567890abc/2.png"]}'::jsonb, '{}'::jsonb);

INSERT INTO event_store.events (stream_id, version, event_type, data, metadata) VALUES 
    ('2B45301F-CDE7-4646-A51A-9FED7CEBBB6E', 1, 'LISTING_CREATED',
    '{"userId": "b8d0f94e-43ed-4567-9f34-7890abcdef23", 
      "title":"Black Blazer",
      "price":"85",
      "description":"A sleek black blazer designed for versatility in any wardrobe. It pairs well with both professional and casual outfits. The fabric provides comfort and breathability without compromising style."}'::jsonb, '{}'::jsonb);

INSERT INTO event_store.events (stream_id, version, event_type, data, metadata) VALUES 
    ('2B45301F-CDE7-4646-A51A-9FED7CEBBB6E', 2, 'IMAGES_UPLOADED',
    '{"imagesUrls": ["images/2B45301F-CDE7-4646-A51A-9FED7CEBBB6E/1.jpeg"]}'::jsonb, '{}'::jsonb);


INSERT INTO event_store.events (stream_id, version, event_type, data, metadata) VALUES 
    ('B2EA4CB5-7324-4D34-BEAD-30C55F6F67BC', 1, 'LISTING_CREATED',
    '{"userId": "a1f4e37c-12d3-4567-89ab-1234567890ab", "title":"Red Jacket","price":"50","description":"This vibrant red jacket combines comfort with a modern, stylish fit, making it perfect for casual outings or evenings out. Crafted from durable yet lightweight fabric, it provides warmth without feeling bulky. The bold color adds a statement to any outfit while keeping you cozy and confident."}'::jsonb, '{}'::jsonb);

INSERT INTO event_store.events (stream_id, version, event_type, data, metadata) VALUES 
    ('B2EA4CB5-7324-4D34-BEAD-30C55F6F67BC', 2, 'IMAGES_UPLOADED',
    '{"imagesUrls": ["images/B2EA4CB5-7324-4D34-BEAD-30C55F6F67BC/1.jpeg","images/B2EA4CB5-7324-4D34-BEAD-30C55F6F67BC/2.jpeg","images/B2EA4CB5-7324-4D34-BEAD-30C55F6F67BC/2.jpeg"]}'::jsonb, '{}'::jsonb);

INSERT INTO event_store.events (stream_id, version, event_type, data, metadata) VALUES 
    ('11A28B7B-6F8E-42C2-9269-671EFFB3A3EB', 1, 'LISTING_CREATED',
    '{"userId": "c9e1fa5f-54fe-4567-8a45-890abcdef234", 
      "title":"Colorful Cup",
      "price":"15",
      "description":"This colorful cup brings fun and energy to your tableware collection. Its vibrant design makes it a great gift for both kids and adults. The material is sturdy and dishwasher-safe for easy cleaning."}'::jsonb, '{}'::jsonb);

INSERT INTO event_store.events (stream_id, version, event_type, data, metadata) VALUES 
    ('11A28B7B-6F8E-42C2-9269-671EFFB3A3EB', 2, 'IMAGES_UPLOADED',
    '{"imagesUrls": ["images/11A28B7B-6F8E-42C2-9269-671EFFB3A3EB/1.jpeg"]}'::jsonb, '{}'::jsonb);

INSERT INTO event_store.events (stream_id, version, event_type, data, metadata) VALUES 
    ('9E81D303-E6E0-4B72-BD49-43C9D10B726F', 1, 'LISTING_CREATED',
    '{"userId": "f6d9g82b-10cb-4567-9012-67890abcdef1", "title":"Blue t-shirt","price":"15","description":"Rock the casual look with this comfy blue t-shirt, perfect for your everyday adventures. It is a great go-to shirt that is easy to pair with anything and is ready for its new home!"}'::jsonb, '{}'::jsonb);

INSERT INTO event_store.events (stream_id, version, event_type, data, metadata) VALUES 
    ('9E81D303-E6E0-4B72-BD49-43C9D10B726F', 2, 'IMAGES_UPLOADED',
    '{"imagesUrls": ["images/9E81D303-E6E0-4B72-BD49-43C9D10B726F/1.jpeg","images/9E81D303-E6E0-4B72-BD49-43C9D10B726F/2.png","images/9E81D303-E6E0-4B72-BD49-43C9D10B726F/3.png"]}'::jsonb, '{}'::jsonb);

INSERT INTO event_store.events (stream_id, version, event_type, data, metadata) VALUES 
    ('5FDA6AE3-4783-41FF-94C3-BADC7390D340', 1, 'LISTING_CREATED',
    '{"userId": "c3a6d59e-76f8-4567-8def-34567890abcd", "title":"High hills","price":"80","description":"These vibrant colorful high heels are designed to make a bold statement at any event. With a sleek silhouette and eye-catching hues, they bring energy and confidence to your outfit. Perfect for parties or nights out, they combine style with comfort for all-day wear."}'::jsonb, '{}'::jsonb);

INSERT INTO event_store.events (stream_id, version, event_type, data, metadata) VALUES 
    ('5FDA6AE3-4783-41FF-94C3-BADC7390D340', 2, 'IMAGES_UPLOADED',
    '{"imagesUrls": ["images/5FDA6AE3-4783-41FF-94C3-BADC7390D340/1.jpeg","images/5FDA6AE3-4783-41FF-94C3-BADC7390D340/2.png"]}'::jsonb, '{}'::jsonb);

INSERT INTO event_store.events (stream_id, version, event_type, data, metadata) VALUES 
    ('5932B820-6FB0-40E7-925A-3FA7A8C1FD41', 1, 'LISTING_CREATED',
    '{"userId": "e5c8f71a-32ba-4567-90f1-567890abcdef", "title":"Green t-shirt","price":"12","description":"This comfortable green t-shirt is perfect for everyday wear and easy to match with any outfit. Made from soft, breathable fabric, it keeps you cool and relaxed throughout the day. Its classic design makes it a versatile choice for casual outings or layering under a jacket."}'::jsonb, '{}'::jsonb);

INSERT INTO event_store.events (stream_id, version, event_type, data, metadata) VALUES 
    ('5932B820-6FB0-40E7-925A-3FA7A8C1FD41', 2, 'IMAGES_UPLOADED',
    '{"imagesUrls": ["images/5932B820-6FB0-40E7-925A-3FA7A8C1FD41/1.jpeg","images/5932B820-6FB0-40E7-925A-3FA7A8C1FD41/2.png","images/5932B820-6FB0-40E7-925A-3FA7A8C1FD41/3.png"]}'::jsonb, '{}'::jsonb);

INSERT INTO event_store.events (stream_id, version, event_type, data, metadata) VALUES 
    ('156BEEF5-25C1-4979-BCE1-842BA114F54F', 1, 'LISTING_CREATED',
    '{"userId": "a7c9f83d-21dc-4567-8f23-67890abcdef2", 
      "title":"Blue Blazer",
      "price":"70",
      "description":"This classic blue blazer is perfect for both casual and formal occasions. The tailored fit ensures comfort while maintaining a sharp appearance. The fabric is lightweight yet durable, making it suitable for all seasons."}'::jsonb, '{}'::jsonb);

INSERT INTO event_store.events (stream_id, version, event_type, data, metadata) VALUES 
    ('156BEEF5-25C1-4979-BCE1-842BA114F54F', 2, 'IMAGES_UPLOADED',
    '{"imagesUrls": ["images/156BEEF5-25C1-4979-BCE1-842BA114F54F/1.jpeg","images/156BEEF5-25C1-4979-BCE1-842BA114F54F/2.jpg","images/156BEEF5-25C1-4979-BCE1-842BA114F54F/3.jpg"]}'::jsonb, '{}'::jsonb);
