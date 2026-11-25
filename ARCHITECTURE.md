# Architecture

The React and TypeScript page uses Vinext, Vite and Cloudflare Workers for its web runtime. The hosted database is PostgreSQL in the separate Soniaa Supabase project. At home, PGlite runs the same migration and SQL functions on the developer’s computer.

| Part | Source | Behavior |
| --- | --- | --- |
| Visitor interface | `app/page.tsx`, `app/globals.css`, `lib/portfolio.ts` | One-page content, responsive styling and supplied media |
| Story selection | `components/story-section.tsx` | Expandable story, linkable URL hash, browser history and enquiry context |
| Contact | `components/enquiry-form.tsx`, `app/api/enquiries/route.ts` | Client and server validation, input limits, duplicate protection and a saved confirmation |
| Measurement | `lib/visits.ts`, `app/api/events/route.ts` | A random visit ID in session storage and allowlisted events deduplicated by visit, event and topic |
| Storage | `lib/server-data.ts`, `supabase/migrations/` | Server-authenticated requests to PostgreSQL. Private tables hold enquiries and engagement |
| Owner report | `app/chatgpt-auth.ts`, `app/api/studio/route.ts`, `app/studio/` | The signed-in owner can read enquiries, compare 30 days of engagement and retry hosted email |
| Hosted mail | `lib/notifications.ts`, `supabase/functions/notify-enquiry/index.ts` | A background call claims a saved enquiry. Resend acceptance and delivery to Gmail are separate outcomes |
| Local launcher | `scripts/local-preview.mjs`, `vite.config.ts` | Runs an isolated database and loopback-only owner sign-in. Local notifications stay pending |

## Data flow

1. A work story sets the topic and purpose on the enquiry form.
2. The server validates the submission and saves it with a unique reference. Repeating a request returns the original confirmation.
3. A hosted notification runs after the save. A temporary delivery issue does not erase the message. Local mode skips outbound email.
4. The report summarizes unique visits at each step and shows individual messages separately. Only the server can call the underlying storage function with its private token.

Use `README.md` for local commands and `PROGRESS.md` for the release state. The local development login works on the loopback interface. Production authentication is supplied by the hosting platform.
