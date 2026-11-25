# Manual deployment

Local testing is ready with the commands in `README.md`. Deployment is a later phase. The current cloud architecture uses a private Sites worker for the web app and a separate Supabase project for PostgreSQL and email.

## GitHub source checkpoint

After extracting the ZIP, work in the folder containing `package.json`. In a new local repository, run:

```sh
git init -b main
git add .
git status --short
git commit -m "feat: checkpoint Soniaa Midnight Stage portfolio"
```

The archive includes a `.gitignore` for real environment files, local messages, dependencies and build artifacts. To publish the source to a new private GitHub repository when you choose, install the GitHub CLI and run:

```sh
gh auth login
gh repo create soniaa-midnight-stage --private --source=. --remote=origin --push
```

If you already have a repository, use its existing remote and push the milestone commit there. A GitHub push preserves source. The web host needs its own deployment.

## Supabase database and notifications

Soniaa already has a separate cloud project in Mumbai. Use that project’s dashboard to inspect the `portfolio` schema. For release work, compare local and remote migration history before applying pending migrations. The first SQL migration is already installed on the existing cloud project. On a fresh target the sequence is:

```sh
npx supabase init
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase migration list
npx supabase db push --dry-run
npx supabase db push
npx supabase functions deploy notify-enquiry --no-verify-jwt
```

Replace `YOUR_PROJECT_REF` with the selected project's reference. The function authenticates each request with the portfolio server token and claims a saved enquiry before attempting delivery. This is why gateway JWT verification is disabled for this function.

For a new target, generate a random server token in your password manager. Put the raw value only in the web host's `PORTFOLIO_DATABASE_TOKEN` secret. Calculate its SHA-256 hex digest privately. In the new project's SQL editor, use that digest when provisioning the slot:

```sql
INSERT INTO portfolio.server_credentials (slot, token_digest)
VALUES ('portfolio', decode('REPLACE_WITH_64_CHARACTER_HEX_DIGEST', 'hex'));
```

Set the web host's `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SITE_ORIGIN`, `REPORT_OWNER_EMAIL` and `ENQUIRY_RECIPIENT`. For email, save a sending-only `RESEND_API_KEY` in **Supabase → Edge Functions → Secrets**. Set `EMAIL_FROM` there if using a verified sender. Once configured, submit one labelled enquiry, confirm it appears in the owner report, and verify receipt in the intended mailbox before public launch. Restrict the report to the owner throughout.

References for database migrations and Edge Functions are available from Supabase. [Migrations](https://supabase.com/docs/guides/deployment/database-migrations) · [Function deployment](https://supabase.com/docs/guides/functions/deploy) · [Function secrets](https://supabase.com/docs/guides/functions/secrets)

## Current web host

The private web deployment uses Cloudflare Worker bindings through ChatGPT Sites. Its owner identity is supplied by the host. The ZIP omits the live project binding so a local copy cannot accidentally overwrite the hosted portfolio. You can continue developing and committing locally without creating a cloud project.

## Vercel or Render migration

Both are optional future web hosts. The current source imports `cloudflare:workers` and relies on the Sites identity gateway. A direct import into either host would leave the server routes and owner sign-in unsupported. Keep the existing Supabase schema during a host migration.

| Target | Implementation required first | Manual deployment after the adapter passes tests |
| --- | --- | --- |
| Vercel | Use a standard Next.js build, read secrets from its server environment, replace Worker background execution and implement verified owner sessions | Import the private GitHub repository, select Next.js, configure the server environment variables, deploy a preview and run the enquiry and owner-access checks |
| Render | Provide a production Node entry point that listens on `0.0.0.0` and the assigned `PORT`. Replace the Worker bindings and implement verified owner sessions | Create a Node Web Service from the private repository, set its build and start commands to the tested Node adapter's commands, add the server secrets and deploy a preview |

The current local preview login and local database launcher are for loopback development. A hosted Node adapter must authenticate the owner independently of request-supplied headers. [Vercel framework guide](https://vercel.com/docs/frameworks/full-stack/nextjs) · [Render web services](https://render.com/docs/web-services)
