-- Initial schema for Waypoint: profiles, trips, places, and their RLS policies.
--
-- Design notes (see docs/ARCHITECTURE.md for the full rationale):
-- - "places" is the single table for every markable entity (country, US state,
--   national park, UNESCO site). A shared shape keeps the map UI and stats
--   queries generic instead of branching per entity type.
-- - Achievements/badges are intentionally NOT stored here. They are derived
--   at query time from places/trips so there is one source of truth and no
--   risk of a badge going stale relative to the underlying data.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

create type public.place_type as enum (
  'country',
  'us_state',
  'national_park',
  'unesco_site'
);

create type public.place_status as enum (
  'visited',
  'want_to_visit'
);

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

-- One row per authenticated user. Extends auth.users with the public-facing
-- profile data (username, share slug, visibility toggle).
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null unique,
  slug text not null unique,
  is_public boolean not null default false,
  created_at timestamptz not null default now()
);

-- A named grouping of places, e.g. "Summer 2024 US road trip".
-- Optional: a place can exist without belonging to a trip.
create table public.trips (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  start_date date,
  end_date date,
  note text,
  created_at timestamptz not null default now()
);

-- The core "marked" entity on the map: a country, US state, national park,
-- or UNESCO site, with a visited/want-to-visit status.
create table public.places (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  trip_id uuid references public.trips (id) on delete set null,
  type public.place_type not null,
  -- ISO-3166 alpha-2 for countries, FIPS/postal code for US states,
  -- source dataset id for national parks and UNESCO sites.
  ref_code text not null,
  name text not null,
  lat double precision,
  lng double precision,
  status public.place_status not null default 'visited',
  visited_date date,
  note text,
  photo_url text,
  created_at timestamptz not null default now()
);

create index places_user_id_idx on public.places (user_id);
create index places_trip_id_idx on public.places (trip_id);
create index trips_user_id_idx on public.trips (user_id);

-- ---------------------------------------------------------------------------
-- Auto-provision a profile row whenever a new auth user is created, so the
-- app never has to handle a signed-in user without a matching profile.
-- ---------------------------------------------------------------------------

create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  base_username text;
begin
  base_username := coalesce(new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1));

  insert into public.profiles (id, username, slug)
  values (
    new.id,
    base_username,
    -- Append a short id fragment so the slug stays unique even if two users
    -- share the same email prefix.
    base_username || '-' || substr(new.id::text, 1, 8)
  );

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Row Level Security
--
-- Pattern used across all three tables: an owner policy that grants full
-- access to the user's own rows, plus a read-only policy that opens up rows
-- belonging to a profile with is_public = true. Postgres combines multiple
-- permissive policies for the same command with OR, so a public visitor and
-- the owner are both covered without duplicating logic in application code.
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.trips enable row level security;
alter table public.places enable row level security;

create policy "Profiles are viewable by their owner or when public"
  on public.profiles for select
  using (is_public = true or auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can manage their own trips"
  on public.trips for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Trips are viewable when the owning profile is public"
  on public.trips for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = trips.user_id and profiles.is_public = true
    )
  );

create policy "Users can manage their own places"
  on public.places for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Places are viewable when the owning profile is public"
  on public.places for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = places.user_id and profiles.is_public = true
    )
  );
