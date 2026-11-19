/*
# Seed demo service centres and services

1. Data
- 10 realistic service centres across the five categories (healthcare, beauty, government, repair, banking) with photos, addresses, opening hours, queue status and average service times. Rows are given explicit fixed uuids so rebuilds are idempotent and re-runs update rather than duplicate.
- Each centre gets 3-4 services with durations (only inserted when the centre has no services yet).

2. Security
- No policy changes; inserts run as the migration's privileged role and rows are publicly readable per existing policies.
*/

INSERT INTO service_centres (id, name, category, description, address, city, image_url, avg_service_time, is_open, opens_at, closes_at, queue_status, currently_serving)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'City Care Clinic', 'healthcare', 'Full-service family clinic with general practitioners, paediatrics and diagnostic lab.', '12 Wellness Avenue', 'Central District', 'https://images.pexels.com/photos/7108324/pexels-photo-7108324.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 12, true, '08:00', '20:00', 'moderate', 23),
  ('11111111-1111-1111-1111-111111111112', 'Glow & Grace Salon', 'beauty', 'Premium unisex salon for hair, skin and grooming services by certified stylists.', '48 Rosewood Street', 'Riverside', 'https://images.pexels.com/photos/9146943/pexels-photo-9146943.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 25, true, '09:00', '19:00', 'low', 8),
  ('11111111-1111-1111-1111-111111111113', 'Civic Services Office', 'government', 'One-stop government office for IDs, permits, licences and document verification.', '200 Parliament Plaza', 'Downtown', 'https://images.pexels.com/photos/14544989/pexels-photo-14544989.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 15, true, '08:30', '17:00', 'busy', 41),
  ('11111111-1111-1111-1111-111111111114', 'AutoFix Service Hub', 'repair', 'Authorised vehicle service centre for periodic maintenance, repairs and inspection.', '7 Industrial Loop', 'North Side', 'https://images.pexels.com/photos/33814734/pexels-photo-33814734.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 40, true, '08:00', '18:00', 'low', 5),
  ('11111111-1111-1111-1111-111111111115', 'Meridian Bank Branch', 'banking', 'Full-service banking branch with account services, loans and wealth advisory.', '350 Commerce Boulevard', 'Financial Quarter', 'https://images.pexels.com/photos/38816564/pexels-photo-38816564.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 10, true, '09:00', '16:00', 'moderate', 17),
  ('11111111-1111-1111-1111-111111111116', 'BrightSmile Dental', 'healthcare', 'Modern dental studio for cleanings, fillings, whitening and orthodontics.', '95 Maple Court', 'Riverside', 'https://images.pexels.com/photos/7108325/pexels-photo-7108325.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 30, true, '09:00', '18:00', 'low', 12),
  ('11111111-1111-1111-1111-111111111117', 'The Barber Chair', 'beauty', 'Classic barber shop specialising in precision cuts, shaves and beard care.', '23 Old Town Lane', 'Old Town', 'https://images.pexels.com/photos/37764947/pexels-photo-37764947.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 20, true, '10:00', '20:00', 'low', 3),
  ('11111111-1111-1111-1111-111111111118', 'Regional License Bureau', 'government', 'Vehicle registration, driving licences and official document processing.', '18 Civic Center Drive', 'Central District', 'https://images.pexels.com/photos/40963436/pexels-photo-40963436.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 12, false, '08:30', '16:30', 'moderate', 28),
  ('11111111-1111-1111-1111-111111111119', 'TechRepair Studio', 'repair', 'Phone, laptop and appliance repairs with genuine parts and 90-day warranty.', '64 Gadget Lane', 'Tech Park', 'https://images.pexels.com/photos/8985516/pexels-photo-8985516.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 20, true, '10:00', '19:00', 'low', 9),
  ('11111111-1111-1111-1111-111111111120', 'Unity Community Bank', 'banking', 'Neighbourhood bank branch with quick counters for deposits and remittances.', '5 Harmony Square', 'West End', 'https://images.pexels.com/photos/36631701/pexels-photo-36631701.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 8, true, '09:30', '15:30', 'low', 14)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  address = EXCLUDED.address,
  city = EXCLUDED.city,
  image_url = EXCLUDED.image_url,
  avg_service_time = EXCLUDED.avg_service_time,
  is_open = EXCLUDED.is_open,
  opens_at = EXCLUDED.opens_at,
  closes_at = EXCLUDED.closes_at,
  queue_status = EXCLUDED.queue_status,
  currently_serving = EXCLUDED.currently_serving;

INSERT INTO services (centre_id, name, duration_minutes)
SELECT s.id, v.name, v.duration
FROM service_centres s
JOIN (VALUES
  ('11111111-1111-1111-1111-111111111111'::uuid, 'General Consultation', 12),
  ('11111111-1111-1111-1111-111111111111'::uuid, 'Paediatric Check-up', 15),
  ('11111111-1111-1111-1111-111111111111'::uuid, 'Lab Tests', 10),
  ('11111111-1111-1111-1111-111111111112'::uuid, 'Haircut & Styling', 30),
  ('11111111-1111-1111-1111-111111111112'::uuid, 'Hair Colouring', 60),
  ('11111111-1111-1111-1111-111111111112'::uuid, 'Facial Treatment', 45),
  ('11111111-1111-1111-1111-111111111113'::uuid, 'ID Card Application', 15),
  ('11111111-1111-1111-1111-111111111113'::uuid, 'Permit Processing', 20),
  ('11111111-1111-1111-1111-111111111113'::uuid, 'Document Verification', 10),
  ('11111111-1111-1111-1111-111111111114'::uuid, 'Periodic Service', 60),
  ('11111111-1111-1111-1111-111111111114'::uuid, 'Oil Change', 30),
  ('11111111-1111-1111-1111-111111111114'::uuid, 'Vehicle Inspection', 40),
  ('11111111-1111-1111-1111-111111111115'::uuid, 'Account Services', 10),
  ('11111111-1111-1111-1111-111111111115'::uuid, 'Loan Advisory', 25),
  ('11111111-1111-1111-1111-111111111115'::uuid, 'Card Collection', 5),
  ('11111111-1111-1111-1111-111111111116'::uuid, 'Dental Cleaning', 30),
  ('11111111-1111-1111-1111-111111111116'::uuid, 'Tooth Filling', 45),
  ('11111111-1111-1111-1111-111111111116'::uuid, 'Teeth Whitening', 60),
  ('11111111-1111-1111-1111-111111111117'::uuid, 'Precision Haircut', 25),
  ('11111111-1111-1111-1111-111111111117'::uuid, 'Hot Towel Shave', 20),
  ('11111111-1111-1111-1111-111111111117'::uuid, 'Beard Trim', 15),
  ('11111111-1111-1111-1111-111111111118'::uuid, 'Licence Renewal', 12),
  ('11111111-1111-1111-1111-111111111118'::uuid, 'Vehicle Registration', 18),
  ('11111111-1111-1111-1111-111111111119'::uuid, 'Phone Screen Repair', 40),
  ('11111111-1111-1111-1111-111111111119'::uuid, 'Laptop Diagnostics', 20),
  ('11111111-1111-1111-1111-111111111120'::uuid, 'Cash Deposit', 5),
  ('11111111-1111-1111-1111-111111111120'::uuid, 'Remittance', 8),
  ('11111111-1111-1111-1111-111111111120'::uuid, 'Account Opening', 20)
) AS v(centre_pk, name, duration) ON s.id = v.centre_pk
WHERE NOT EXISTS (
  SELECT 1 FROM services existing WHERE existing.centre_id = s.id
);