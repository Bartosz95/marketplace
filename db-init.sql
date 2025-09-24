
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
  listing_id  UUID PRIMARY KEY,
  user_id     TEXT,
  modified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status      TEXT NOT NULL,
  version     INTEGER NOT NULL,
  title       TEXT NOT NULL,
  description TEXT NOT NULL,
  price       INTEGER NOT NULL,
  images_urls TEXT[] NOT NULL
);

ALTER TABLE states.listings OWNER TO default_user;

CREATE TABLE IF NOT EXISTS states.bookmarks (
  process_name  TEXT NOT NULL PRIMARY KEY,
  bookmark      INTEGER NOT NULL
);

ALTER TABLE states.bookmarks OWNER TO default_user;