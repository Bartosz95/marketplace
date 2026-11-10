CREATE USER default_user WITH PASSWORD 'password';
CREATE DATABASE marketplace OWNER default_user;
GRANT ALL PRIVILEGES ON DATABASE marketplace TO default_user;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

\connect marketplace;

CREATE SCHEMA event_store AUTHORIZATION default_user;

CREATE TABLE IF NOT EXISTS event_store.events (
  position    SERIAL PRIMARY KEY,
  stream_id   UUID DEFAULT gen_random_uuid(),
  event_type  TEXT NOT NULL,
  version     INT DEFAULT 1,
  data        JSONB,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  metadata    JSONB 
);

CREATE INDEX idx_event_store_events_stream_id ON event_store.events (stream_id);
CREATE INDEX idx_event_store_events_event_type ON event_store.events (event_type);
CREATE UNIQUE INDEX IF NOT EXISTS idx_event_store_events_stream_version ON event_store.events (stream_id, version);

ALTER TABLE event_store.events OWNER TO default_user;

CREATE SCHEMA states AUTHORIZATION default_user;

CREATE TABLE IF NOT EXISTS states.listings (
  listing_id    UUID PRIMARY KEY,
  user_id       TEXT,
  status        TEXT NOT NULL,
  title         TEXT NOT NULL,
  description   TEXT NOT NULL,
  price         INTEGER NOT NULL,
  images_urls   TEXT[] NOT NULL,
  version       INTEGER NOT NULL,
  modified_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_state_listing_user_id ON states.listings (user_id);
CREATE INDEX idx_state_listing_status ON states.listings (status);

ALTER TABLE states.listings OWNER TO default_user;
CREATE TABLE IF NOT EXISTS states.purchases (
  purchase_id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id    UUID NOT NULL,
  seller_id     TEXT,
  buyer_id      TEXT,
  price         INTEGER NOT NULL,
  status        TEXT NOT NULL,
  version       INTEGER NOT NULL,
  modified_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_state_purchases_seller_id ON states.purchases (seller_id);
CREATE INDEX idx_state_purchases_buyer_id ON states.purchases (buyer_id);
CREATE INDEX idx_state_purchases_status ON states.purchases (status);

ALTER TABLE states.purchases OWNER TO default_user;

CREATE TABLE IF NOT EXISTS states.bookmarks (
  process_name  TEXT PRIMARY KEY,
  bookmark      INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS states.stripe_webhook_events (
  idempotency_key TEXT PRIMARY KEY,
  purchase_id UUID,
  source TEXT NOT NULL DEFAULT 'webhook'
    CHECK (source IN ('webhook', 'reconciliation')),
  event_type TEXT,
  received_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS states.payment_reconciliation (
  checkout_session_id TEXT PRIMARY KEY,
  purchase_id UUID NOT NULL,
  attempt_count INTEGER NOT NULL DEFAULT 0,
  next_attempt_at TIMESTAMP,
  last_checked_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_error TEXT
);

ALTER TABLE states.stripe_webhook_events
  ADD COLUMN IF NOT EXISTS purchase_id UUID;
ALTER TABLE states.payment_reconciliation
  ADD COLUMN IF NOT EXISTS purchase_id UUID;
CREATE INDEX IF NOT EXISTS idx_stripe_webhook_events_purchase_id
  ON states.stripe_webhook_events (purchase_id);
CREATE INDEX IF NOT EXISTS idx_payment_reconciliation_purchase_id
  ON states.payment_reconciliation (purchase_id);

ALTER TABLE states.stripe_webhook_events OWNER TO default_user;
ALTER TABLE states.bookmarks OWNER TO default_user;
ALTER TABLE states.payment_reconciliation OWNER TO default_user;

CREATE TABLE IF NOT EXISTS states.users (    
    user_id                     UUID PRIMARY KEY,
    authentication_provider_id  TEXT NOT NULL,
    payment_provider_id         TEXT,
    name                        TEXT NOT NULL,
    email                       TEXT NOT NULL,
    address                     JSONB,
    metadata                    JSONB,
    created_at                  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at                  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX idx_states_users_authentication_provider_id ON states.users(authentication_provider_id);

ALTER TABLE states.users OWNER TO default_user;

INSERT INTO event_store.events (stream_id, version, event_type, data, metadata) VALUES 
    ('D8E31AB4-0D4F-4031-A9B9-2BC0A963A4B0', 1, 'LISTING_CREATED',
    '{"userId": "748f3744-8636-48a6-9eaa-fb79519b07f9",
      "title":"Green Men T-Shirt",
      "price":"25",
      "description":"A soft and comfortable green T-shirt made from 100% cotton. Its modern fit makes it suitable for both casual outings and sports activities. The shirt retains its color and shape even after multiple washes."}'::jsonb, '{}'::jsonb);

INSERT INTO event_store.events (stream_id, version, event_type, data, metadata) VALUES 
    ('D8E31AB4-0D4F-4031-A9B9-2BC0A963A4B0', 2, 'IMAGES_UPLOADED',
    '{"imagesUrls": ["/demo/D8E31AB4-0D4F-4031-A9B9-2BC0A963A4B0/1.jpeg"]}'::jsonb, '{}'::jsonb);

INSERT INTO event_store.events (stream_id, version, event_type, data, metadata) VALUES 
    ('5F0E6081-9247-410C-A7B5-4E5FCF7AA365', 1, 'LISTING_CREATED',
    '{"userId": "748f3744-8636-48a6-9eaa-fb79519b07f9",
      "title":"Brown shoes",
      "price":"30",
      "description":"These brown high heels are gently used but still in excellent condition, offering both comfort and style. Their classic design makes them a versatile choice for both casual outings and more formal occasions."}'::jsonb, '{}'::jsonb);

INSERT INTO event_store.events (stream_id, version, event_type, data, metadata) VALUES 
    ('5F0E6081-9247-410C-A7B5-4E5FCF7AA365', 2, 'IMAGES_UPLOADED',
    '{"imagesUrls": ["/demo/5F0E6081-9247-410C-A7B5-4E5FCF7AA365/1.jpeg"]}'::jsonb, '{}'::jsonb);

INSERT INTO event_store.events (stream_id, version, event_type, data, metadata) VALUES 
    ('0E8C0F75-7FFF-431A-938C-AD18F5D2265E', 1, 'LISTING_CREATED',
    '{"userId": "748f3744-8636-48a6-9eaa-fb79519b07f9",
      "title":"Purple Women T-Shirt",
      "price":"30",
      "description":"This purple women’s T-shirt offers both comfort and style. It is designed with a flattering cut and soft-touch fabric. The vibrant color adds a bold statement to any casual outfit."}'::jsonb, '{}'::jsonb);

INSERT INTO event_store.events (stream_id, version, event_type, data, metadata) VALUES 
    ('0E8C0F75-7FFF-431A-938C-AD18F5D2265E', 2, 'IMAGES_UPLOADED',
    '{"imagesUrls": ["/demo/0E8C0F75-7FFF-431A-938C-AD18F5D2265E/1.jpeg"]}'::jsonb, '{}'::jsonb);

INSERT INTO event_store.events (stream_id, version, event_type, data, metadata) VALUES 
    ('2F77D3D5-73D3-4C2C-99E1-E9C6EF9F7A79', 1, 'LISTING_CREATED',
    '{"userId": "748f3744-8636-48a6-9eaa-fb79519b07f9", "title":"Blue cup","price":"10","description":"This elegant blue cup adds a touch of calm and charm to your everyday routine. Crafted with durability and style in mind, it’s perfect for coffee, tea, or any beverage of your choice. Its rich color and simple design make it a versatile piece for both home and office use."}'::jsonb, '{}'::jsonb);

INSERT INTO event_store.events (stream_id, version, event_type, data, metadata) VALUES 
    ('2F77D3D5-73D3-4C2C-99E1-E9C6EF9F7A79', 2, 'IMAGES_UPLOADED',
    '{"imagesUrls": ["/demo/d4b7e60f-54a9-4567-9ef0-4567890abcde/1.jpeg", "/demo/d4b7e60f-54a9-4567-9ef0-4567890abcde/2.jpeg"]}'::jsonb, '{}'::jsonb);

INSERT INTO event_store.events (stream_id, version, event_type, data, metadata) VALUES 
    ('2BE04F60-EC70-4AC4-A792-21B5CAE89546', 1, 'LISTING_CREATED',
    '{"userId": "748f3744-8636-48a6-9eaa-fb79519b07f9", "title":"Boots","price":"30","description":"These classic brown boots offer a timeless look that pairs effortlessly with both casual and dressy outfits. Made with sturdy materials, they provide comfort and durability for everyday wear. Their versatile design makes them a must-have staple for any wardrobe."}'::jsonb, '{}'::jsonb);

INSERT INTO event_store.events (stream_id, version, event_type, data, metadata) VALUES 
    ('2BE04F60-EC70-4AC4-A792-21B5CAE89546', 2, 'IMAGES_UPLOADED',
    '{"imagesUrls": ["/demo/b2f5c48d-98e7-4567-9cde-234567890abc/1.jpeg","/demo/b2f5c48d-98e7-4567-9cde-234567890abc/2.png"]}'::jsonb, '{}'::jsonb);

INSERT INTO event_store.events (stream_id, version, event_type, data, metadata) VALUES 
    ('2B45301F-CDE7-4646-A51A-9FED7CEBBB6E', 1, 'LISTING_CREATED',
    '{"userId": "748f3744-8636-48a6-9eaa-fb79519b07f9",
      "title":"Black Blazer",
      "price":"85",
      "description":"A sleek black blazer designed for versatility in any wardrobe. It pairs well with both professional and casual outfits. The fabric provides comfort and breathability without compromising style."}'::jsonb, '{}'::jsonb);

INSERT INTO event_store.events (stream_id, version, event_type, data, metadata) VALUES 
    ('2B45301F-CDE7-4646-A51A-9FED7CEBBB6E', 2, 'IMAGES_UPLOADED',
    '{"imagesUrls": ["/demo/2B45301F-CDE7-4646-A51A-9FED7CEBBB6E/1.jpeg"]}'::jsonb, '{}'::jsonb);


INSERT INTO event_store.events (stream_id, version, event_type, data, metadata) VALUES 
    ('B2EA4CB5-7324-4D34-BEAD-30C55F6F67BC', 1, 'LISTING_CREATED',
    '{"userId": "748f3744-8636-48a6-9eaa-fb79519b07f9", "title":"Red Jacket","price":"50","description":"This vibrant red jacket combines comfort with a modern, stylish fit, making it perfect for casual outings or evenings out. Crafted from durable yet lightweight fabric, it provides warmth without feeling bulky. The bold color adds a statement to any outfit while keeping you cozy and confident."}'::jsonb, '{}'::jsonb);

INSERT INTO event_store.events (stream_id, version, event_type, data, metadata) VALUES 
    ('B2EA4CB5-7324-4D34-BEAD-30C55F6F67BC', 2, 'IMAGES_UPLOADED',
    '{"imagesUrls": ["/demo/B2EA4CB5-7324-4D34-BEAD-30C55F6F67BC/1.jpeg","/demo/B2EA4CB5-7324-4D34-BEAD-30C55F6F67BC/2.jpeg","/demo/B2EA4CB5-7324-4D34-BEAD-30C55F6F67BC/2.jpeg"]}'::jsonb, '{}'::jsonb);

INSERT INTO event_store.events (stream_id, version, event_type, data, metadata) VALUES 
    ('11A28B7B-6F8E-42C2-9269-671EFFB3A3EB', 1, 'LISTING_CREATED',
    '{"userId": "748f3744-8636-48a6-9eaa-fb79519b07f9",
      "title":"Colorful Cup",
      "price":"15",
      "description":"This colorful cup brings fun and energy to your tableware collection. Its vibrant design makes it a great gift for both kids and adults. The material is sturdy and dishwasher-safe for easy cleaning."}'::jsonb, '{}'::jsonb);

INSERT INTO event_store.events (stream_id, version, event_type, data, metadata) VALUES 
    ('11A28B7B-6F8E-42C2-9269-671EFFB3A3EB', 2, 'IMAGES_UPLOADED',
    '{"imagesUrls": ["/demo/11A28B7B-6F8E-42C2-9269-671EFFB3A3EB/1.jpeg"]}'::jsonb, '{}'::jsonb);

INSERT INTO event_store.events (stream_id, version, event_type, data, metadata) VALUES 
    ('9E81D303-E6E0-4B72-BD49-43C9D10B726F', 1, 'LISTING_CREATED',
    '{"userId": "748f3744-8636-48a6-9eaa-fb79519b07f9", "title":"Blue t-shirt","price":"15","description":"Rock the casual look with this comfy blue t-shirt, perfect for your everyday adventures. It is a great go-to shirt that is easy to pair with anything and is ready for its new home!"}'::jsonb, '{}'::jsonb);

INSERT INTO event_store.events (stream_id, version, event_type, data, metadata) VALUES 
    ('9E81D303-E6E0-4B72-BD49-43C9D10B726F', 2, 'IMAGES_UPLOADED',
    '{"imagesUrls": ["/demo/9E81D303-E6E0-4B72-BD49-43C9D10B726F/1.jpeg","/demo/9E81D303-E6E0-4B72-BD49-43C9D10B726F/2.png","/demo/9E81D303-E6E0-4B72-BD49-43C9D10B726F/3.png"]}'::jsonb, '{}'::jsonb);

INSERT INTO event_store.events (stream_id, version, event_type, data, metadata) VALUES 
    ('5FDA6AE3-4783-41FF-94C3-BADC7390D340', 1, 'LISTING_CREATED',
    '{"userId": "748f3744-8636-48a6-9eaa-fb79519b07f9", "title":"High hills","price":"80","description":"These vibrant colorful high heels are designed to make a bold statement at any event. With a sleek silhouette and eye-catching hues, they bring energy and confidence to your outfit. Perfect for parties or nights out, they combine style with comfort for all-day wear."}'::jsonb, '{}'::jsonb);

INSERT INTO event_store.events (stream_id, version, event_type, data, metadata) VALUES 
    ('5FDA6AE3-4783-41FF-94C3-BADC7390D340', 2, 'IMAGES_UPLOADED',
    '{"imagesUrls": ["/demo/5FDA6AE3-4783-41FF-94C3-BADC7390D340/1.jpeg","/demo/5FDA6AE3-4783-41FF-94C3-BADC7390D340/2.png"]}'::jsonb, '{}'::jsonb);

INSERT INTO event_store.events (stream_id, version, event_type, data, metadata) VALUES 
    ('5932B820-6FB0-40E7-925A-3FA7A8C1FD41', 1, 'LISTING_CREATED',
    '{"userId": "748f3744-8636-48a6-9eaa-fb79519b07f9", "title":"Green t-shirt","price":"12","description":"This comfortable green t-shirt is perfect for everyday wear and easy to match with any outfit. Made from soft, breathable fabric, it keeps you cool and relaxed throughout the day. Its classic design makes it a versatile choice for casual outings or layering under a jacket."}'::jsonb, '{}'::jsonb);

INSERT INTO event_store.events (stream_id, version, event_type, data, metadata) VALUES 
    ('5932B820-6FB0-40E7-925A-3FA7A8C1FD41', 2, 'IMAGES_UPLOADED',
    '{"imagesUrls": ["/demo/5932B820-6FB0-40E7-925A-3FA7A8C1FD41/1.jpeg","/demo/5932B820-6FB0-40E7-925A-3FA7A8C1FD41/2.png","/demo/5932B820-6FB0-40E7-925A-3FA7A8C1FD41/3.png"]}'::jsonb, '{}'::jsonb);

INSERT INTO event_store.events (stream_id, version, event_type, data, metadata) VALUES 
    ('156BEEF5-25C1-4979-BCE1-842BA114F54F', 1, 'LISTING_CREATED',
    '{"userId": "748f3744-8636-48a6-9eaa-fb79519b07f9",
      "title":"Blue Blazer",
      "price":"70",
      "description":"This classic blue blazer is perfect for both casual and formal occasions. The tailored fit ensures comfort while maintaining a sharp appearance. The fabric is lightweight yet durable, making it suitable for all seasons."}'::jsonb, '{}'::jsonb);

INSERT INTO event_store.events (stream_id, version, event_type, data, metadata) VALUES 
    ('156BEEF5-25C1-4979-BCE1-842BA114F54F', 2, 'IMAGES_UPLOADED',
    '{"imagesUrls": ["/demo/156BEEF5-25C1-4979-BCE1-842BA114F54F/1.jpeg","/demo/156BEEF5-25C1-4979-BCE1-842BA114F54F/2.jpg","/demo/156BEEF5-25C1-4979-BCE1-842BA114F54F/3.jpg"]}'::jsonb, '{}'::jsonb);
