/*
# Admin read access to profiles and full centre management

1. Security
- New SELECT policy on profiles so admins can view the customer list in the admin dashboard (regular users still see only their own row).
- New INSERT and DELETE policies on service_centres so admins can add and remove centres from the Manage Centres page (previously only UPDATE existed).
*/

DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
CREATE POLICY "Admins can view all profiles" ON profiles
FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles AS p WHERE p.id = auth.uid() AND p.role = 'admin')
);

DROP POLICY IF EXISTS "Admins can add service centres" ON service_centres;
CREATE POLICY "Admins can add service centres" ON service_centres
FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

DROP POLICY IF EXISTS "Admins can remove service centres" ON service_centres;
CREATE POLICY "Admins can remove service centres" ON service_centres
FOR DELETE TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);