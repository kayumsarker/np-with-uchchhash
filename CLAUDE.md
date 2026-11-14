@AGENTS.md

# Natural Philosophy with Uchchhash — Project Memory

Free physics learning platform for tutor **Uchchhash**. All content free, no payments, students need NO login. Site language: English. Communicate with the developer in **English** (overrides the original prompt's "Bangla" rule).

## Golden rules (non-negotiable)

1. Never decide alone. Any library, package, file structure, schema change, design change, or unspecified behavior → STOP and ASK with options + a recommendation.
2. Work phase by phase. End of each phase: summarize, explain how to test, STOP, wait for "next".
3. If the spec conflicts with current official docs (Next.js, Prisma, Supabase, Tailwind, GSAP, Cloudinary) → tell the developer and ask; never adapt silently. Bundled Next.js docs live in `node_modules/next/dist/docs/` — read them before writing Next.js code.
4. Developer is on Windows (PowerShell/cmd). Every command must work on Windows.

## Security rules (non-negotiable)

- GitHub repo is PUBLIC. Never commit `.env`, `.env.local`, or any `.env*` except `.env.example`. `.gitignore` has `.env*` + `!.env.example`. Run `git status` before EVERY commit and confirm no secret files.
- NEVER read, print, echo, or log `.env.local`. The developer fills secrets. `.env.example` = names only, empty values.
- `NEXT_PUBLIC_` prefix allowed ONLY for: SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, CLOUDINARY_CLOUD_NAME, SITE_URL. `CLOUDINARY_API_SECRET` never reaches the client.
- Prisma connects as DB owner → Supabase RLS does NOT protect data. EVERY server action and route handler that mutates data MUST call `requireAdmin()` — in addition to `proxy.ts` protecting `/admin/*`. Never rely on proxy alone.
- No Supabase service-role/secret key anywhere.
- Do not change git config (name/email already set to the developer's GitHub noreply address).

## Locked tech stack (versions verified 2026-11-14)

- Next.js **16.4.6** (App Router, TypeScript, Turbopack default), React 19.3, npm.
  - Next 16: `middleware.ts` is renamed **`proxy.ts`** (at `src/proxy.ts`).
  - **Cache Components ON** (`cacheComponents: true`, `partialPrefetching: true` in `next.config.ts`) — chosen because Next 17 makes them mandatory. Public data reads use `"use cache"` + `cacheTag()`; admin mutations call `updateTag()` / `revalidateTag()` so public pages update immediately.
- Tailwind CSS **v4** (CSS-first config; no `tailwind.config.js`), wired via `@tailwindcss/turbopack` loader in `next.config.ts`.
- GSAP + `@gsap/react` (`useGSAP`) for animation.
- Prisma ORM **7.10.1 (stable, pinned exact)** — npm `latest` tag points to 8.0.0-rc; do NOT use it. Verified Prisma 7 setup:
  - `prisma.config.ts`: `datasource.url = DIRECT_URL` (CLI/migrations, port 5432). `directUrl` no longer exists in v7. Seed configured at `migrations.seed = "tsx prisma/seed.ts"`.
  - Runtime: `src/lib/db.ts` exports `db` = `PrismaClient` + `PrismaPg` adapter on `DATABASE_URL` (6543, `?pgbouncer=true` kept, works). Singleton across dev hot reloads.
  - Env loading: Prisma 7 loads no env files → Node built-in `process.loadEnvFile(".env.local")` (ignored if ENOENT). No `dotenv` package.
  - Generator `prisma-client`, output `src/generated/prisma` (gitignored, rebuilt by `postinstall: prisma generate`). Import: `@/generated/prisma/client`.
  - No `"type": "module"` in package.json (not needed so far).
  - Seeding is never automatic: `npm run db:seed`. Migrations: `npm run db:migrate`. Studio: `npm run db:studio`.
  - npm 11 `allowScripts`: install scripts approved for `prisma`, `@prisma/engines`, `esbuild`.
  - Verified: Next.js `"use cache"` function reading via `db` prerenders fine with Cache Components.
- Supabase PostgreSQL + Supabase Auth (admin login only) via `@supabase/ssr`. New `sb_publishable_` key; prefer `getClaims()` for server checks (confirm in Phase 2).
- Cloudinary for images + PDFs, **signed uploads only**. Cloud name `np-with-uchchhash`, PDF delivery enabled.
- YouTube lite embed: thumbnail first, iframe loads only on click, `youtube-nocookie.com` domain.
- Lint/format: ESLint (flat config, `eslint-config-next`) + Prettier (`prettier-plugin-tailwindcss`, `eslint-config-prettier`). Scripts: `npm run lint`, `npm run format`, `npm run format:check`.
- Hosting: Vercel (not set up yet — Phase 7). Local Node is v26; align Node version with Vercel in Phase 7.

## Environment variables (`.env.example`)

DATABASE_URL (transaction pooler 6543, `?pgbouncer=true`), DIRECT_URL (session pooler 5432, migrations), NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, ADMIN_EMAILS (comma-separated), NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, NEXT_PUBLIC_SITE_URL.
Supabase: public signups DISABLED, admin user created manually. Current DB is **ap-south-1 (Mumbai)**; developer may recreate in Singapore later → then update `.env.local`, run `npm run db:migrate` + `npm run db:seed`. Pick Vercel function region to match the DB in Phase 7.

## Folder structure (approved)

```
prisma/                 schema.prisma, seed.ts, migrations/
public/
src/
  app/
    (public)/           layout with navbar + footer
      page.tsx          home
      courses/[slug]/[chapter]/
      resources/
      about/
    admin/              login/, courses/, resources/, settings/
    api/cloudinary/sign/route.ts
    globals.css         @theme design tokens (single source)
    sitemap.ts, robots.ts
  components/           ui/, public/, admin/, hero/
  lib/                  db.ts, auth.ts (requireAdmin), supabase/{server,client}.ts,
                        cloudinary.ts, youtube.ts, validation/
  actions/              server actions
  proxy.ts              Next 16 "middleware"
.env.example  CLAUDE.md  AGENTS.md  prisma.config.ts  next.config.ts
```

## Data model (APPROVED + migrated: `prisma/migrations/*_init`) — source of truth is `prisma/schema.prisma`

- IDs: `cuid()` strings. All description/about fields are **Markdown** (render with `react-markdown`, to install in the phase that needs it).
- Course: `isFeatured` (admin toggle → home "featured"), `order` is **per category** (`@@index([category, order])`).
- Chapter: cascade-deleted with course; `@@unique([courseId, slug])`.
- Resource: **one optional chapter** (`chapterId`, `onDelete: SetNull` → deleting a chapter keeps its resources as standalone). A published resource shows on `/resources` AND on its chapter page.
- SiteSettings: single row, `id = 1`. Socials: `youtubeUrl`, `facebookUrl`, `instagramUrl`.
- No Admin table: admin = Supabase Auth user whose email is in ADMIN_EMAILS.
- Seed (`prisma/seed.ts`, idempotent): 5 courses / 12 chapters / 4 LINK resources / settings. Real YouTube IDs verified via oEmbed (Khan Academy, CrashCourse, Stanford). All sample descriptions start with "Sample content". Always verify YouTube IDs via `https://www.youtube.com/oembed?url=...` — never invent them.

## Routes

Public: `/`, `/courses` (category tabs), `/courses/[slug]`, `/courses/[slug]/[chapter]` (lite embed, description, resources, prev/next, sidebar), `/resources` (filter by type + category), `/about`. Footer with social links on every page.
Admin: `/admin/login`, `/admin` (counts), `/admin/courses` (chapters managed inside course edit), `/admin/resources`, `/admin/settings`.

## Admin features

Full CRUD, draft/publish toggle, ↑↓ reorder (no drag-and-drop), YouTube URL → ID parsing (watch, youtu.be, shorts, embed, extra params; reject invalid with clear error; show thumbnail preview), Cloudinary signed upload (admin-protected signature route, browser uploads directly; delete old asset on replace/delete), confirm dialog before every delete (course delete warns chapters go too), revalidate affected public pages after every mutation, form validation.

## Design system

Dark premium. Tokens in `src/app/globals.css` `@theme`: background #05060A, surface #0D1020, primary #2F80FF (Electric Blue), secondary #A855F7 (Neon Purple), accent #F5C451 (Gold). Fonts via next/font: Space Grotesk (`font-heading`), Inter (`font-sans`, body), JetBrains Mono (`font-mono`, formulas). Mobile-first, accessible contrast + focus states.

## Hero animation (Phase 5)

SVG orbit rings rotated with GSAP, floating monospace formulas (F = ma, E = mc², ∇·E = ρ/ε₀), particles on ONE `<canvas>`. Desktop ~80 particles / ~6 formulas; mobile ~25 / ~3. Pause when tab hidden or hero off-screen. `prefers-reduced-motion` → static. Cleanup via `useGSAP`.

## Performance & SEO

Public pages static/cached, revalidated on admin changes. next/image everywhere (Cloudinary configured). YouTube iframe only on click. Per-page metadata, Open Graph, sitemap.xml, robots.txt (block /admin). Lighthouse mobile: Performance ≥ 90, Accessibility ≥ 95.

## Phases (STOP after each)

0 Scaffold ✅ · 1 Database ✅ · 2 Admin auth · 3 Admin CRUD (courses, chapters, settings) · 4 Public pages · 5 Hero animation · 6 Resources + Cloudinary · 7 SEO/perf/security review, then step-by-step Vercel setup.

## Git

Remote: https://github.com/kayumsarker/np-with-uchchhash.git, branch `main`. After each approved phase: `git status` → confirm no secrets → commit → push.

## Open questions (ask before the relevant phase)

- Validation lib (rec: Zod v4); YouTube embed (rec: custom component); admin UI (plain Tailwind + native dialog vs shadcn/ui), toasts, icons (lucide-react?); Cloudinary approach (rec: SDK + custom fetch); tests (rec: Vitest for YouTube parser).
- Slug auto + editable; admin draft preview.
- Login method (password vs magic link); unpublished course → chapters 404; Cloudinary delete failure behavior; upload size limit; logo/favicon/OG image; analytics.
- `server-only` import guard for `src/lib/db.ts` (ask in Phase 2).
