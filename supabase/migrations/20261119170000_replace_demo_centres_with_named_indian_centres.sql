-- QueueLess showcase centre records: remove placeholder demo centres and replace
-- with named Meerut service locations. Queue figures are illustrative demo data.
DELETE FROM public.services WHERE centre_id IN (
  '22222222-2222-2222-2222-222222222201',
  '22222222-2222-2222-2222-222222222202',
  '22222222-2222-2222-2222-222222222203',
  '22222222-2222-2222-2222-222222222204',
  '22222222-2222-2222-2222-222222222205'
);
DELETE FROM public.queue_tokens WHERE centre_id IN (
  '22222222-2222-2222-2222-222222222201',
  '22222222-2222-2222-2222-222222222202',
  '22222222-2222-2222-2222-222222222203',
  '22222222-2222-2222-2222-222222222204',
  '22222222-2222-2222-2222-222222222205'
);
DELETE FROM public.service_centres WHERE id IN (
  '22222222-2222-2222-2222-222222222201',
  '22222222-2222-2222-2222-222222222202',
  '22222222-2222-2222-2222-222222222203',
  '22222222-2222-2222-2222-222222222204',
  '22222222-2222-2222-2222-222222222205'
);

INSERT INTO public.service_centres
  (id, name, category, description, address, city, locality, latitude, longitude,
   image_url, avg_service_time, is_open, opens_at, closes_at, queue_status, currently_serving)
VALUES
  ('33333333-3333-3333-3333-333333333301', 'State Bank of India – Meerut', 'banking',
   'Banking services showcase listing. Queue information is illustrative for the QueueLess demo.',
   'Rama Plaza, Mool Chand Building, near Baccha Park, Western Kutchehry Road, Meerut, UP 250002', 'Meerut', 'Begum Bridge', 28.9850, 77.7040,
   'https://images.unsplash.com/photo-1601597111158-2fceff292cdc?auto=format&fit=crop&w=1200&q=80',
   12, true, '10:00', '16:00', 'moderate', 8),
  ('33333333-3333-3333-3333-333333333302', 'Punjab National Bank – Meerut', 'banking',
   'Banking services showcase listing. Queue information is illustrative for the QueueLess demo.',
   'Ground Floor, Delhi-Haridwar Bypass Road, Subharti Puram, Meerut, UP 250002', 'Meerut', 'Subharti Puram', 28.959611, 77.638131,
   'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
   10, true, '10:00', '16:00', 'low', 4),
  ('33333333-3333-3333-3333-333333333303', 'Subharti Hospital', 'healthcare',
   'Hospital showcase listing. Queue information is illustrative for the QueueLess demo.',
   'Subharti Puram, NH-58, Delhi-Haridwar Bypass Road, Meerut, UP 250005', 'Meerut', 'Subharti Puram', 28.9596, 77.6381,
   'https://images.unsplash.com/photo-1586779134956-2f8c3f3b2f6f?auto=format&fit=crop&w=1200&q=80',
   20, true, '00:00', '23:59', 'busy', 15),
  ('33333333-3333-3333-3333-333333333304', 'Military Hospital – Meerut', 'healthcare',
   'Military hospital showcase listing. Queue information is illustrative for the QueueLess demo.',
   'Meerut Cantonment, Meerut, Uttar Pradesh', 'Meerut', 'Meerut Cantt', 28.9990, 77.6970,
   'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80',
   18, true, '00:00', '23:59', 'moderate', 6),
  ('33333333-3333-3333-3333-333333333305', 'Meerut Salon & Beauty Service', 'beauty',
   'Salon showcase listing. Queue information is illustrative for the QueueLess demo.',
   'Meerut', 'Meerut', 'Meerut', 28.9845, 77.7064,
   'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=80',
   25, true, '10:00', '20:00', 'low', 3),
  ('33333333-3333-3333-3333-333333333306', 'Meerut Vehicle Service Centre', 'repair',
   'Vehicle service showcase listing. Queue information is illustrative for the QueueLess demo.',
   'Meerut', 'Meerut', 'Meerut', 28.9845, 77.7064,
   'https://images.unsplash.com/photo-1487756191054-0f0b4a4a0f7d?auto=format&fit=crop&w=1200&q=80',
   35, true, '09:00', '18:00', 'busy', 7)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, category = EXCLUDED.category, description = EXCLUDED.description,
  address = EXCLUDED.address, city = EXCLUDED.city, locality = EXCLUDED.locality,
  latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, image_url = EXCLUDED.image_url,
  avg_service_time = EXCLUDED.avg_service_time, is_open = EXCLUDED.is_open,
  opens_at = EXCLUDED.opens_at, closes_at = EXCLUDED.closes_at,
  queue_status = EXCLUDED.queue_status, currently_serving = EXCLUDED.currently_serving;

INSERT INTO public.services (centre_id, name, duration_minutes)
VALUES
  ('33333333-3333-3333-3333-333333333301', 'Cash and Counter Services', 12),
  ('33333333-3333-3333-3333-333333333301', 'Account Services', 15),
  ('33333333-3333-3333-3333-333333333302', 'Cash and Counter Services', 10),
  ('33333333-3333-3333-3333-333333333302', 'Account Services', 15),
  ('33333333-3333-3333-3333-333333333303', 'OPD Consultation', 20),
  ('33333333-3333-3333-3333-333333333303', 'Diagnostics', 30),
  ('33333333-3333-3333-3333-333333333304', 'OPD Consultation', 18),
  ('33333333-3333-3333-3333-333333333305', 'Haircut and Styling', 25),
  ('33333333-3333-3333-3333-333333333305', 'Beauty Service', 40),
  ('33333333-3333-3333-3333-333333333306', 'Vehicle Inspection', 35),
  ('33333333-3333-3333-3333-333333333306', 'Basic Service', 45)
ON CONFLICT DO NOTHING;
