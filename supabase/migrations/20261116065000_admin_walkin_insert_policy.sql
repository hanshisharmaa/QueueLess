/*
# Allow admins to create walk-in tokens

1. Security
- New INSERT policy on queue_tokens so admins can add walk-in customers manually from the admin dashboard (the customer-facing insert path remains the generate_token function only).
*/

DROP POLICY IF EXISTS "Admins can create walk-in tokens" ON queue_tokens;
CREATE POLICY "Admins can create walk-in tokens" ON queue_tokens
FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);