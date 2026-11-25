CREATE SCHEMA portfolio;
REVOKE ALL ON SCHEMA portfolio FROM PUBLIC;
CREATE TABLE portfolio.server_credentials (
  slot text PRIMARY KEY CHECK (slot = 'portfolio'),
  token_digest bytea NOT NULL
);
CREATE TABLE portfolio.engagement (
  visit uuid NOT NULL,
  event text NOT NULL CHECK (event IN ('visit','story_open','form_start')),
  topic text NOT NULL CHECK (topic IN ('direct','brand','demand','leadership')),
  created_at bigint NOT NULL,
  PRIMARY KEY (visit,event,topic)
);
CREATE INDEX engagement_date ON portfolio.engagement (created_at);
CREATE TABLE portfolio.enquiries (
  id uuid PRIMARY KEY,
  visit uuid NOT NULL,
  name text NOT NULL CHECK (length(name) BETWEEN 1 AND 100),
  email text NOT NULL CHECK (length(email) BETWEEN 3 AND 254),
  intent text NOT NULL CHECK (intent IN ('project','hiring','event','peer')),
  topic text NOT NULL CHECK (topic IN ('direct','brand','demand','leadership')),
  message text NOT NULL CHECK (length(message) BETWEEN 5 AND 4000),
  created_at bigint NOT NULL,
  notification text NOT NULL DEFAULT 'pending'
    CHECK (notification IN ('pending','sending','activation','retry','accepted')),
  attempted_at bigint NOT NULL DEFAULT 0
);
CREATE INDEX enquiries_date ON portfolio.enquiries (created_at DESC);
CREATE INDEX enquiries_email_date ON portfolio.enquiries (email,created_at);
CREATE INDEX enquiries_visit_date ON portfolio.enquiries (visit,created_at);

ALTER TABLE portfolio.server_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio.engagement ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio.enquiries ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON ALL TABLES IN SCHEMA portfolio FROM PUBLIC, anon, authenticated;

-- This function runs outside the exposed API schemas and only accepts requests
-- authenticated by the portfolio server. The caller cannot supply SQL.
CREATE FUNCTION portfolio.dispatch(operation text, payload jsonb)
RETURNS jsonb LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path = '' AS $fn$
DECLARE
  key_header text := current_setting('request.headers',true)::jsonb ->> 'x-portfolio-key';
  now_ms bigint := floor(extract(epoch FROM clock_timestamp()) * 1000)::bigint;
  since_ms bigint := now_ms - 2592000000;
  enquiry portfolio.enquiries%ROWTYPE;
  enquiry_id uuid;
  visit_id uuid;
  reply_email text;
BEGIN
  IF key_header IS NULL OR NOT EXISTS (
    SELECT 1 FROM portfolio.server_credentials
     WHERE slot = 'portfolio' AND token_digest = sha256(convert_to(key_header,'UTF8'))
  ) THEN
    RAISE EXCEPTION 'Portfolio server authentication required' USING ERRCODE = '42501';
  END IF;
  CASE operation
    WHEN 'event' THEN
      INSERT INTO portfolio.engagement(visit,event,topic,created_at)
      VALUES ((payload->>'visit')::uuid,payload->>'event',payload->>'topic',now_ms)
      ON CONFLICT DO NOTHING;
      RETURN 'true'::jsonb;
    WHEN 'save' THEN
      enquiry_id := (payload->>'id')::uuid;
      visit_id := (payload->>'visit')::uuid;
      reply_email := lower(trim(payload->>'email'));
      -- Serialise duplicate IDs and competing requests for the two rate limits.
      PERFORM pg_advisory_xact_lock(1,hashtext(enquiry_id::text));
      SELECT * INTO enquiry FROM portfolio.enquiries WHERE id = enquiry_id;
      IF FOUND THEN
        IF (enquiry.visit,enquiry.email,enquiry.name,enquiry.intent,enquiry.topic,enquiry.message) =
           (visit_id,reply_email,payload->>'name',payload->>'intent',payload->>'topic',payload->>'message')
        THEN RETURN to_jsonb('duplicate'::text); END IF;
        RETURN to_jsonb('conflict'::text);
      END IF;
      PERFORM pg_advisory_xact_lock(2,hashtext(visit_id::text));
      PERFORM pg_advisory_xact_lock(3,hashtext(reply_email));
      IF (SELECT count(*) FROM portfolio.enquiries
           WHERE created_at > now_ms - 3600000 AND (visit=visit_id OR email=reply_email)) >= 4
      THEN RETURN to_jsonb('limited'::text); END IF;
      INSERT INTO portfolio.enquiries(id,visit,name,email,intent,topic,message,created_at)
      VALUES (enquiry_id,visit_id,payload->>'name',reply_email,payload->>'intent',payload->>'topic',payload->>'message',now_ms);
      RETURN to_jsonb('created'::text);
    WHEN 'claim' THEN
      UPDATE portfolio.enquiries
         SET notification='sending',attempted_at=now_ms
       WHERE id=(payload->>'id')::uuid AND (
         notification IN ('pending','retry')
         OR (notification='activation' AND attempted_at < now_ms - 30000)
         OR (notification='sending' AND attempted_at < now_ms - 120000)
       ) RETURNING * INTO enquiry;
      IF NOT FOUND THEN RETURN 'null'::jsonb; END IF;
      RETURN to_jsonb(enquiry);
    WHEN 'finish' THEN
      IF payload->>'status' NOT IN ('accepted','activation','retry','pending') THEN
        RAISE EXCEPTION 'Invalid notification status';
      END IF;
      UPDATE portfolio.enquiries SET notification=payload->>'status'
       WHERE id=(payload->>'id')::uuid AND notification='sending' AND attempted_at=(payload->>'attempted_at')::bigint;
      RETURN 'true'::jsonb;
    WHEN 'report' THEN
      RETURN jsonb_build_object(
        'events', COALESCE((SELECT jsonb_agg(to_jsonb(summary)) FROM
          (SELECT topic,event,count(*) FROM portfolio.engagement WHERE created_at>=since_ms GROUP BY topic,event) summary),'[]'::jsonb),
        'outcomes', COALESCE((SELECT jsonb_agg(to_jsonb(summary)) FROM
          (SELECT topic,count(DISTINCT visit) AS visits,count(*) FROM portfolio.enquiries WHERE created_at>=since_ms GROUP BY topic) summary),'[]'::jsonb),
        'intents', COALESCE((SELECT jsonb_agg(to_jsonb(summary)) FROM
          (SELECT intent,count(*) FROM portfolio.enquiries WHERE created_at>=since_ms GROUP BY intent) summary),'[]'::jsonb),
        'inbox', COALESCE((SELECT jsonb_agg(to_jsonb(recent) ORDER BY created_at DESC) FROM
          (SELECT id,created_at,name,email,intent,topic,message,notification,attempted_at
             FROM portfolio.enquiries ORDER BY created_at DESC LIMIT 30) recent),'[]'::jsonb)
      );
    ELSE RAISE EXCEPTION 'Unknown portfolio operation';
  END CASE;
END
$fn$;
REVOKE ALL ON FUNCTION portfolio.dispatch(text,jsonb) FROM PUBLIC, anon, authenticated;
GRANT USAGE ON SCHEMA portfolio TO anon;
GRANT EXECUTE ON FUNCTION portfolio.dispatch(text,jsonb) TO anon;

CREATE FUNCTION public.portfolio_request(operation text, payload jsonb DEFAULT '{}'::jsonb)
RETURNS jsonb LANGUAGE sql VOLATILE SECURITY INVOKER SET search_path = '' AS $fn$
  SELECT portfolio.dispatch(operation,payload);
$fn$;
REVOKE ALL ON FUNCTION public.portfolio_request(text,jsonb) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.portfolio_request(text,jsonb) TO anon;
NOTIFY pgrst, 'reload schema';
