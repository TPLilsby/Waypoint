-- A configurable home point per user, used for phase 4's "distance from
-- home" stat. Nullable/no default - a fresh profile has no home set
-- until the user fills it in on the settings page.
alter table public.profiles
  add column home_name text,
  add column home_lat double precision,
  add column home_lng double precision;
