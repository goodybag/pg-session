create table if not exists "sessions" (
  sid         text,
  data        json,
  expiration  timestamp
);