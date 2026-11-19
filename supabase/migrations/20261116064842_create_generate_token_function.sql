/*
# Token generation function and index

1. Functions
- `generate_token(centre_uuid)` — SECURITY DEFINER. Called by a signed-in customer with a centre id. Atomically:
  - reads the centre and its active tokens
  - rejects when the centre is closed ('This centre is currently closed')
  - rejects duplicates ('You already have an active token for this centre')
  - computes the next token number = max token number of today's tokens + 1
  - computes people_ahead = count of today's active (waiting/called) tokens
  - computes est_wait_minutes = people_ahead * centre.avg_service_time
  - inserts the token and writes a queue_updates entry
  - returns the full token row
2. Security
- EXECUTE granted to `authenticated` only; revoked from PUBLIC and anon.
- Index on queue_tokens(centre_id, generated_at) for fast daily queue reads.
*/

CREATE OR REPLACE FUNCTION public.generate_token(p_centre_id uuid)
RETURNS queue_tokens
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_centre service_centres;
  v_last integer;
  v_ahead integer;
  v_token queue_tokens;
BEGIN
  SELECT * INTO v_centre FROM service_centres WHERE id = p_centre_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Centre not found';
  END IF;

  IF NOT v_centre.is_open THEN
    RAISE EXCEPTION 'This centre is currently closed';
  END IF;

  IF EXISTS (
    SELECT 1 FROM queue_tokens
    WHERE centre_id = p_centre_id
      AND user_id = auth.uid()
      AND status IN ('waiting', 'called')
      AND generated_at::date = now()::date
  ) THEN
    RAISE EXCEPTION 'You already have an active token for this centre';
  END IF;

  SELECT COALESCE(MAX(token_number), 0) INTO v_last
  FROM queue_tokens
  WHERE centre_id = p_centre_id AND generated_at::date = now()::date;

  SELECT COUNT(*) INTO v_ahead
  FROM queue_tokens
  WHERE centre_id = p_centre_id
    AND status IN ('waiting', 'called')
    AND generated_at::date = now()::date;

  INSERT INTO queue_tokens (centre_id, user_id, token_number, people_ahead, est_wait_minutes, status)
  VALUES (
    p_centre_id,
    auth.uid(),
    v_last + 1,
    v_ahead,
    v_ahead * v_centre.avg_service_time,
    'waiting'
  )
  RETURNING * INTO v_token;

  INSERT INTO queue_updates (centre_id, token_id, message)
  VALUES (p_centre_id, v_token.id, 'Token ' || (v_last + 1) || ' generated for ' || COALESCE((SELECT full_name FROM profiles WHERE id = auth.uid()), 'a customer'));

  UPDATE service_centres
  SET queue_status = CASE
    WHEN v_ahead >= 8 THEN 'busy'
    WHEN v_ahead >= 4 THEN 'moderate'
    ELSE 'low'
  END
  WHERE id = p_centre_id;

  RETURN v_token;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.generate_token(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.generate_token(uuid) TO authenticated;

CREATE INDEX IF NOT EXISTS idx_queue_tokens_centre_date
ON queue_tokens (centre_id, generated_at DESC);