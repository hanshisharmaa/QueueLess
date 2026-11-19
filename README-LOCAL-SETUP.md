# QueueLess — local setup

## Run the app
1. Extract this folder and open the `project` directory in VS Code.
2. Open a terminal in this directory.
3. Run `npm install`.
4. Run `npm run dev`.
5. Open the localhost URL printed by Vite.

## Supabase setup
This app uses Supabase Auth and the database. The supplied `.env` contains a Supabase project URL and anon/public key. Never put a `service_role` key in a Vite `.env` file or browser code.

If you use a different Supabase project:
- Copy `.env.example` to `.env`.
- Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
- In the Supabase SQL Editor, run the SQL migration files in `supabase/migrations/` in filename order.
- In Supabase Auth settings, configure the site URL and local redirect URL for your local Vite address.

## Checks
- `npm run build` creates a production build.
- `npm run typecheck` checks TypeScript.
- `npm run lint` runs ESLint.

## Important project scope
The uploaded source contains the customer-facing pages, token flow and admin-related database policies. It does **not** contain an admin management page; `/admin` now displays an explanatory screen instead of going blank.

## Location-based centre discovery (new)
- On the Explore page, choose a city/locality or use the browser's location permission.
- GPS distance filtering works only for centres with latitude/longitude saved in Supabase.
- Manual city/locality filtering uses the centre's city, locality and address fields.
- Run the new `20261119090000_location_based_centres.sql` migration in Supabase SQL Editor after the existing migrations. It adds location fields and clearly labelled fictional demo centres around Meerut for testing. The coordinates are approximate locality-centre points, not real business locations.
- Browser location access generally requires HTTPS or localhost and the user's permission.

## Real nearby businesses (OpenStreetMap)
- The "Nearby Places" tab on Explore fetches real businesses from OpenStreetMap (Overpass API) based on your selected city or GPS location.
- Categories include hospitals/clinics, banks/ATMs, salons, vehicle service centres, dining, and government offices.
- OpenStreetMap listings are external and are **not** QueueLess partners — they show names, addresses, distance, and directions only. Token generation and queue tracking are NOT available for them.
- No API key is required for OpenStreetMap. It relies on public Overpass/Nominatim endpoints (rate-limited).

## AI assistant
- A QueueLess AI assistant is available as a floating widget on every page. It helps users find nearby places, explains token generation and queue tracking, and guides navigation.
- No secret API key is stored in the frontend. The assistant calls `VITE_AI_CHAT_ENDPOINT`, which must point to a proxy you deploy that holds the AI provider key.
- If `VITE_AI_CHAT_ENDPOINT` is not set, the assistant falls back to built-in help responses so the demo still works.
- Add `VITE_AI_CHAT_ENDPOINT` to your local `.env` (from `.env.example`) to connect a real AI provider.

## Environment file safety
This updated archive intentionally does not include `.env`. Keep your existing local `.env` file (or create one from `.env.example`) with your own Supabase URL and public/anon key. Do not commit `.env` or any service-role key to GitHub.
