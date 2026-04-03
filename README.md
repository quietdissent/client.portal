# Quiet Dissent — Client Portal

A private client portal for Quiet Dissent AI strategy engagements. Clients log in to view documents, exchange messages with Bailey, and schedule calls. The admin side lets you manage clients, push documents, and run the conversation from a single workspace.

Built with Next.js 16 (App Router), Clerk, Supabase, and Tailwind CSS 4.

---

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router, `proxy.ts` for auth) |
| Auth | Clerk — role-based (`admin` / `client`) via `publicMetadata` |
| Database | Supabase (Postgres + Realtime) |
| Styling | Tailwind CSS 4 (`@theme inline` tokens), DM Sans / Fraunces / DM Mono |
| Hosting | Vercel (recommended) |

---

## Project structure

```
src/
  app/
    (auth)/           sign-in and sign-up pages (Clerk components)
    (admin)/          admin-only routes — layout guards role === "admin"
      clients/        client list + detail (docs, messages, schedule, notes)
      documents/new   standalone document creation page
    (portal)/         client-facing routes — layout guards authenticated non-admin
      dashboard/      welcome page with summary cards
      documents/      document list with expand-to-view
      messages/       real-time message thread (Supabase Realtime)
      schedule/       upcoming events + Cal.com embed
    api/
      clients/        CRUD — admin only (POST sends Clerk invitation)
      documents/      CRUD — admin create/delete, clients read their own
      events/         CRUD — admin create, clients read their own
      messages/       read + post — both roles, scoped per client
      me/             returns the current client's record
      invitations/    Clerk webhook — wires up clerk_user_id after invite accept
  components/
    admin/            AdminSidebar, ClientDetailTabs, tab components, forms
    portal/           Sidebar, DocumentViewer, MessagesThread
    ui/               Button, Badge, Card, Input / Textarea / Select
  lib/
    supabase.ts       browser client (anon key) + server client (service role)
    clerk.ts          getRole(), requireRole(), getClerkUserId()
    types.ts          TypeScript interfaces for all DB tables
  proxy.ts            Next.js 16 Proxy (formerly Middleware) — Clerk auth guard
supabase/
  schema.sql          Full schema — run once in the Supabase SQL editor
```

---

## Setup

### 1. Clone and install

```bash
git clone <repo>
cd client.portal
npm install
```

### 2. Environment variables

Copy the example file and fill in your credentials:

```bash
cp .env.local.example .env.local
```

| Variable | Where to find it |
|---|---|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk Dashboard → API Keys |
| `CLERK_SECRET_KEY` | Clerk Dashboard → API Keys |
| `CLERK_WEBHOOK_SECRET` | See **Webhooks** section below |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API |
| `NEXT_PUBLIC_CAL_URL` | Your Cal.com booking page embed URL |
| `NEXT_PUBLIC_APP_URL` | Your production URL (e.g. `https://portal.quietdissent.com`) |

### 3. Supabase schema

In the Supabase SQL editor, run the contents of `supabase/schema.sql`. This creates all tables, RLS policies, the `updated_at` trigger, and scaffolds Realtime.

After running the schema, enable Realtime for the `messages` table in **Database → Replication → Tables**.

### 4. Clerk configuration

**Admin user** — after creating your Clerk account, set your role via the Clerk Dashboard:

1. Go to **Users** → select your account
2. Open **Public metadata** and set:
   ```json
   { "role": "admin" }
   ```

**Clerk routing variables** — set in `.env.local`:

```
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/portal/dashboard
```

### 5. Webhooks (invitation flow)

When you invite a client via **+ Invite Client**, the API:
1. Sends a Clerk invitation email to the client
2. Creates a client row with `clerk_user_id = pending_<invitationId>`

When the client accepts and completes sign-up, Clerk fires a `user.created` webhook that updates the row to their real Clerk user ID.

**To configure:**

1. In the Clerk Dashboard → **Webhooks**, create a new endpoint:
   - URL: `https://your-domain.com/api/invitations`
   - Events: `user.created`
   - Custom header: `Authorization: Bearer <your-secret>`
2. Generate any random string as your secret (e.g. `openssl rand -hex 32`)
3. Add it to `.env.local`:
   ```
   CLERK_WEBHOOK_SECRET=<your-secret>
   ```

> **Production hardening**: Install the `svix` package and replace the bearer-token check in `src/app/api/invitations/route.ts` with full Svix signature verification using `svix-id`, `svix-timestamp`, and `svix-signature` headers.

### 6. Cal.com embed (optional)

Set `NEXT_PUBLIC_CAL_URL` to your Cal.com booking page URL (e.g. `https://cal.com/bailey/30min`). The Schedule page renders it in an iframe. If unset, clients see a "contact Bailey to schedule" message.

### 7. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You'll be redirected to `/sign-in`.

---

## Inviting a client

1. Sign in as admin → **Clients** → **+ Invite Client**
2. Fill in name, email, and engagement type
3. The client receives a Clerk invitation email
4. After they sign up, the webhook updates their `clerk_user_id` and they can access their portal

---

## Pushing a document

Two entry points:

- **Client detail page** → Documents tab → **+ Add Document** — paste HTML directly
- **New Document** in the admin sidebar — cross-client, same form

PDF upload is scaffolded (the "Upload PDF" mode toggle exists) but requires a Supabase Storage bucket and a `/api/documents/upload` handler.

---

## Deployment (Vercel)

```bash
vercel --prod
```

Set all environment variables in **Vercel → Project → Settings → Environment Variables**. Make sure `NEXT_PUBLIC_APP_URL` is set to your production domain — it's used in the Clerk invitation `redirectUrl`.

---

## Design system

Tokens are defined in `src/app/globals.css` under `@theme inline` and usable as Tailwind utilities:

| Token | Value | Usage |
|---|---|---|
| `bg-[var(--color-bg-primary)]` | `#F5F4EF` | Page background |
| `bg-[var(--color-bg-secondary)]` | `#EDECEA` | Cards, inputs |
| `bg-[var(--color-bg-tertiary)]` | `#E5E3DE` | Hover states |
| `text-[var(--color-text-primary)]` | `#1A1A1A` | Body copy |
| `text-[var(--color-text-muted)]` | `#7A7875` | Labels, metadata |
| `border-[var(--color-border)]` | `#D8D6D1` | All borders |
| `text-[var(--color-accent)]` | `#5F8575` | Primary actions, active states |
| `bg-[var(--color-bg-dark)]` | `#111111` | Admin sidebar |

Fonts: **Fraunces** (display headings), **DM Sans** (body), **DM Mono** (labels, metadata, badges).

---

## Phase 2 scaffolds

The schema includes an `invoices` table and `pipeline_stage` / `source` fields on `clients`. Not wired to UI yet — ready for Phase 2 billing and CRM views.
