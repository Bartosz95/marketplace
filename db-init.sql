
CREATE USER defaut_user WITH PASSWORD 'password';
CREATE DATABASE store OWNER defaut_user;
GRANT ALL PRIVILEGES ON DATABASE store TO defaut_user;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

\connect store;

CREATE SCHEMA event_store AUTHORIZATION defaut_user;

CREATE TABLE IF NOT EXISTS event_store.events (
  event_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID DEFAULT gen_random_uuid(),
  position_id SERIAL,
  version INT NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  event_type VARCHAR(100) NOT NULL,
  data JSONB NOT NULL,
  metadata JSONB NOT NULL
);

ALTER TABLE event_store.events OWNER TO defaut_user;