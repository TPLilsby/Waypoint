-- Lets a country/state/park/site be upserted safely: without this, clicking
-- the same place twice (e.g. cycling default -> visited -> want_to_visit)
-- could otherwise insert a second row instead of updating the first one.
alter table public.places
  add constraint places_user_type_ref_code_unique unique (user_id, type, ref_code);
