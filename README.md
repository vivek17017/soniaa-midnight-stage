# Soniaa · Midnight Stage

## Run the portfolio locally

Install Node.js 22.13 or later with npm. The clean-start checks used Node.js 24. Extract the ZIP first. Open a terminal in the `soniaa-midnight-stage` folder containing `package.json` and run:

```sh
npm ci
npm run dev
```

Open **http://127.0.0.1:5173** when the terminal says the server is ready. Leave the terminal open while using the site. Press **Ctrl+C** to stop. On later runs, start it again with `npm run dev`. The same commands work in Windows PowerShell or Command Prompt.

The first installation needs internet access. The local database starts automatically. You can explore the portfolio, save enquiries, and review engagement without Docker, a Supabase login, or an email key. The SlideShare guide, YouTube introduction, and LinkedIn profile open on their respective websites.

## Try the visitor flow

1. Select **Explore my work**, then open **Team leadership** and **Read the story**.
2. Select **Discuss a leadership role**. The contact form selects **Hiring opportunity** and **Team leadership** for you.
3. Enter a name, a reply email and a short test message. Select **Send enquiry** and wait for **Enquiry received**.
4. Open **http://127.0.0.1:5173/studio**. Choose **Sign in to open the report** to enter as the local test owner. The local sign-in works on this computer without a ChatGPT password.
5. Open the saved enquiry. The report also shows visits, story views, form starts and messages by topic.

Local enquiries and engagement are stored in the `.local-preview/postgres` folder and survive a restart. Local testing keeps messages on your computer and sends no Gmail notifications. The hosted email integration is included in the source. Live delivery still needs an email provider key.

## Verify this milestone

With the portfolio running, open another terminal in the same folder and run `npm run test:local`. It creates one labelled test enquiry in your local database. Run `npx tsc --noEmit` to type-check the web project and `npm run build` to build it.

The four handoff files are `PROJECT_REQUIREMENTS.md`, `ARCHITECTURE.md`, `PROGRESS.md` and `AGENTS.md`. Manual publishing steps are in `DEPLOYMENT.md`.

## Where to make changes

| File or directory | What it controls |
| --- | --- |
| `lib/portfolio.ts` | Profile copy, case stories, recommendations and featured links |
| `app/page.tsx` and `app/globals.css` | One-page layout, Midnight Stage styling, and responsive behavior |
| `components/story-section.tsx` and `components/enquiry-form.tsx` | Story navigation, contextual contact form and confirmation |
| `app/api/` and `app/studio/` | Server-side validation, engagement events and the private report |
| `supabase/migrations/` | The PostgreSQL schema and functions shared by local and hosted storage |
| `supabase/functions/notify-enquiry/` | Hosted enquiry email delivery |
| `public/assets/` | Portfolio images, fonts and font licenses |
| `scripts/local-preview.mjs` | Starts the loopback-only development database and app |

Run `npm run build` to create a production build. The local launcher uses PGlite to run the included PostgreSQL migration. The database and the web server bind to this computer on ports 5174 and 5173. If a port is in use, close the earlier run before starting another.

For a configuration using your own Supabase project, `npm run dev:cloud` starts the original app entry point and reads server settings from an untracked `.dev.vars`. Its keys are listed in `.dev.vars.example`. The hosted notification function reads its Resend key separately, from Supabase Edge Function secrets. Production credentials and visitor records are excluded from this export.
