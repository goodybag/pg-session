create table if not exists "pg_sessions" (
  id          serial,
  sid         text,
  data        json,
  expiration  timestamp
);