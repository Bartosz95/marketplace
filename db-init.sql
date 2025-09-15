
CREATE USER default_user WITH PASSWORD 'password';
CREATE DATABASE marketplace OWNER default_user;
GRANT ALL PRIVILEGES ON DATABASE marketplace TO default_user;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

\connect marketplace;

CREATE SCHEMA event_store AUTHORIZATION default_user;

CREATE TABLE IF NOT EXISTS event_store.events (
  position_id SERIAL PRIMARY KEY,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  listing_id UUID DEFAULT gen_random_uuid(),
  version INT NOT NULL DEFAULT 1,
  event_type VARCHAR(100) NOT NULL,
  data JSONB,
  metadata JSONB 
);

ALTER TABLE event_store.events OWNER TO default_user;