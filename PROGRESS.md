# Progress and handoff

## Current milestone

**M1 — Midnight Stage source and runnable local portfolio.** The complete editable web app, database migration, notification function, visual assets and local preview launcher are included. Development is paused at this checkpoint by request.

| Phase | State | Scope |
| --- | --- | --- |
| 1. Identity and design | Implemented | LinkedIn-only professional content, three audience groups, Midnight Stage styling and selected media |
| 2. Visitor and owner experience | Implemented and locally tested | Responsive single-page portfolio, contextual enquiries and private engagement reporting |
| 3. Local full-stack handoff | Tested | Clean dependency install, local startup, type check, production build, API checks and persistence after restart |
| 4. Email and release verification | Pending | Configure a sending-only Resend key, verify receipt in the approved inbox and check the exact release with the real owner sign-in |
| 5. Client launch | Pending | Client review, production inbox and access decision, final device and accessibility checks, and authorized public release |

## What the checks covered

- A clean Node.js 24.22.3 installation of the locked packages started the portfolio. The web type check and production build passed.
- The local API saved one labelled enquiry, returned the same reference on replay and rejected a conflicting reuse of that reference. Empty input was rejected. Opening the report without owner sign-in was rejected.
- A normal local owner sign-in returned the engagement report and the saved enquiry with its selected topic and intent. Restarting the web server and local database preserved the enquiry.
- The desktop and narrow-width screens were inspected during development. The hiring path preselected Team leadership and Hiring opportunity on the phone layout. A full accessibility audit and testing on physical devices remain open.
- A hosted private-preview check previously verified a saved enquiry, recorded events and duplicate handling in the separate Soniaa Supabase project. Gmail delivery was not confirmed. The offline preview deliberately keeps all test messages local.
- This ZIP is a source checkpoint. A build passing locally does not establish a successful Vercel or Render deployment.

## Next conversation

Attach the ZIP or the updated repository. Ask the new conversation to read this file, `PROJECT_REQUIREMENTS.md`, `ARCHITECTURE.md` and `AGENTS.md`. Name the next phase and request a focused change. The next unfinished verification is an actual email arriving in the approved inbox. Check the existing pending enquiry and notification status before sending another test.

## Milestone commands

From the extracted folder, run `npm ci` and `npm run dev`. In a second terminal run `npm run test:local`. Use `npx tsc --noEmit` and `npm run build` for release checks. Commit with:

```sh
git init -b main
git add .
git commit -m "feat: checkpoint Soniaa Midnight Stage portfolio"
```

The first command is for a new repository. See `DEPLOYMENT.md` for the private GitHub push and the supported hosting paths.
