-- Location support for QueueLess.
-- Demo centre coordinates are approximate locality-centre points, not real business addresses.
ALTER TABLE public.service_centres
  ADD COLUMN IF NOT EXISTS locality text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS latitude double precision,
  ADD COLUMN IF NOT EXISTS longitude double precision;

-- Clearly labelled demo data for testing manual locality search and GPS distance filtering.
INSERT INTO public.service_centres
  (id, name, category, description, address, city, locality, latitude, longitude,
   image_url, avg_service_time, is_open, opens_at, closes_at, queue_status, currently_serving)
VALUES
  ('22222222-2222-2222-2222-222222222201', 'Demo Kanker Khera Health Centre', 'healthcare',
   'Sample clinic record for testing location-based centre discovery. Not a real listing.',
   'Demo address near Kanker Khera', 'Meerut', 'Kanker Khera', 28.9938, 77.6902,
   '', 12, true, '09:00', '20:00', 'moderate', 10),
  ('22222222-2222-2222-2222-222222222202', 'Demo Kanker Khera Salon', 'beauty',
   'Sample salon record for testing location-based centre discovery. Not a real listing.',
   'Demo address near Kanker Khera', 'Meerut', 'Kanker Khera', 28.9946, 77.6920,
   '', 25, true, '10:00', '20:00', 'low', 4),
  ('22222222-2222-2222-2222-222222222203', 'Demo Vehicle Service Kanker Khera', 'repair',
   'Sample vehicle service record for testing location-based centre discovery. Not a real listing.',
   'Demo address near Kanker Khera', 'Meerut', 'Kanker Khera', 28.9919, 77.6884,
   '', 35, true, '09:00', '18:00', 'busy', 7),
  ('22222222-2222-2222-2222-222222222204', 'Demo Modipuram Health Centre', 'healthcare',
   'Sample clinic record for testing nearby search. Not a real listing.',
   'Demo address near Modipuram', 'Meerut', 'Modipuram', 29.0120, 77.6735,
   '', 15, true, '09:00', '19:00', 'low', 2),
  ('22222222-2222-2222-2222-222222222205', 'Demo Pallavpuram Salon', 'beauty',
   'Sample salon record for testing nearby search. Not a real listing.',
   'Demo address near Pallavpuram', 'Meerut', 'Pallavpuram', 28.9795, 77.6707,
   '', 20, true, '10:00', '19:00', 'moderate', 5)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  address = EXCLUDED.address,
  city = EXCLUDED.city,
  locality = EXCLUDED.locality,
  latitude = EXCLUDED.latitude,
  longitude = EXCLUDED.longitude,
  image_url = EXCLUDED.image_url,
  avg_service_time = EXCLUDED.avg_service_time,
  is_open = EXCLUDED.is_open,
  opens_at = EXCLUDED.opens_at,
  closes_at = EXCLUDED.closes_at,
  queue_status = EXCLUDED.queue_status,
  currently_serving = EXCLUDED.currently_serving;

INSERT INTO public.services (centre_id, name, duration_minutes)
SELECT x.centre_id, x.service_name, x.duration_minutes
FROM (VALUES
  ('22222222-2222-2222-2222-222222222201'::uuid, 'General Consultation', 12),
  ('22222222-2222-2222-2222-222222222201'::uuid, 'Basic Health Check', 15),
  ('22222222-2222-2222-2222-222222222202'::uuid, 'Haircut & Styling', 25),
  ('22222222-2222-2222-2222-222222222202'::uuid, 'Facial', 45),
  ('22222222-2222-2222-2222-222222222203'::uuid, 'Vehicle Inspection', 35),
  ('22222222-2222-2222-2222-222222222203'::uuid, 'Oil Change', 30),
  ('22222222-2222-2222-2222-222222222204'::uuid, 'General Consultation', 15),
  ('22222222-2222-2222-2222-222222222205'::uuid, 'Haircut', 20)
) AS x(centre_id, service_name, duration_minutes)
WHERE NOT EXISTS (
  SELECT 1 FROM public.services existing
  WHERE existing.centre_id = x.centre_id AND existing.name = x.service_name
);
