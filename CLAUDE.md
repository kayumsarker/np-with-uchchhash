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
- Supabase PostgreSQL + Supabase Auth (admin login only) via `@supabase/ssr` 0.12 + `@supabase/supabase-js` 2.119. New `sb_publishable_` key. **Auth implementation (Phase 2):**
  - Login: **email + password** via server action `login` in `src/actions/auth.ts` (`useActionState` form). Generic "Invalid email or password." error. A valid Supabase user NOT in ADMIN_EMAILS is signed out immediately. Logout: `signOut({ scope: "local" })`.
  - Identity check: `supabase.auth.getClaims()` (verifies JWT signature) → `claims.email` vs ADMIN_EMAILS. Never trust `getSession()` on the server.
  - `src/lib/admin-emails.ts` `isAdminEmail()` — pure, case-insensitive, fail-closed when ADMIN_EMAILS is empty.
  - `src/lib/auth.ts`: `getAdmin()` (returns admin or null — use in Route Handlers to answer 401) and `requireAdmin()` (redirects to /admin/login). Call `requireAdmin()` at the top of EVERY admin server action and inside every admin page's data component.
  - `src/lib/supabase/server.ts` `createSupabaseServerClient()` — new client per request.
  - `src/proxy.ts` — matcher `/admin`, `/admin/:path*` only. Refreshes session, applies the no-cache headers from `setAll(cookies, headers)`, copies cookies onto redirects. Non-admin → /admin/login; admin on /admin/login → /admin.
  - Admin routes: `src/app/admin/login/` (public) and `src/app/admin/(protected)/` (layout with nav + logout; all admin pages go here). Admin pages are `noindex`.
  - Cache Components: anything reading cookies/session or uncached DB data must sit inside `<Suspense>` (pattern: page renders shell, async child calls `requireAdmin()` then queries).
  - `import "server-only"` in `db.ts`, `auth.ts`, `supabase/server.ts` (built into Next, no package).
  - Verified: anon / forged-cookie / forged-unsigned-JWT requests redirect; with proxy removed, `requireAdmin()` alone still leaks no data.
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

0 Scaffold ✅ · 1 Database ✅ · 2 Admin auth ✅ · 3 Admin CRUD (courses, chapters, settings) ✅ · 4 Public pages ✅ · 5 Hero animation ✅ · 6 Resources + Cloudinary · 7 SEO/perf/security review, then step-by-step Vercel setup.

## Git

Remote: https://github.com/kayumsarker/np-with-uchchhash.git, branch `main`. After each approved phase: `git status` → confirm no secrets → commit → push.

## Phase 3 decisions (done)

- Zod v4 validation (`src/lib/validation/`), plain Tailwind + native `<dialog>` confirm, lucide-react icons, sonner toasts (admin only). Vitest (`npm test`) for `src/lib/youtube.ts` + `src/lib/slug.ts`; `@types/node` ^24.
- Slug auto from title, editable; published slug change → old URL 404s (form warns). No draft preview.
- Cache tags in `src/lib/cache-tags.ts` (`courses`, `course:<id>`, `settings`) — Phase 4 public reads must `cacheTag()` these. Actions call `updateTag` + `refresh()`.
- Admin forms submit via onSubmit (no React form reset); actions return `ActionState`. Edit pages show `MissingNotice` instead of `notFound()`.
- `next.config.ts` images allow `i.ytimg.com/vi/**`. Thumbnail/photo uploads deferred to Phase 6 (TODOs).

## Phase 4 decisions (done)

- Public reads: `src/lib/data/public.ts` (`"use cache"`, `cacheLife("max")`, tags from cache-tags.ts incl. new `resources`). Only published content; chapter public only if chapter AND course published, else 404.
- Course/chapter pages: `generateStaticParams` (placeholder `__none__` when empty, Cache Components requires ≥1), params awaited inside `<Suspense>`. Unknown slugs render not-found with noindex (status 200 due to streaming).
- /courses tabs and /resources filters are client-side over static data, URL synced via `history.replaceState` (`?category=`, `?type=`).
- Markdown: react-markdown + remark-gfm, `skipHtml` (`src/components/markdown.tsx`). Brand icons are inline SVG (lucide 1.x has none).
- `getAdmin()` calls `await connection()` (Supabase getClaims reads the clock; not allowed in runtime prerender).
- Home hero is static; Phase 5 replaces it. Tutor photo + course thumbnails still Phase 6.

## Phase 5 decisions (done)

- gsap **3.15.0** + @gsap/react **2.1.2**, pinned exact (3.15.1 was <2 weeks old at install).
- `src/components/hero/hero-visual.tsx` (client, `aria-hidden`): split layout — text left, orbit right on desktop (md+); faint (30%) orbit behind text on mobile. Hero `min-h-[85svh]`.
- Formulas: F = ma, E = mc², ∇·E = ρ/ε₀, λ = h/p, PV = nRT, F = Gm₁m₂/r² (mobile shows first 3 via CSS).
- `gsap.matchMedia` picks desktop/mobile particle count + reduced-motion static frame. Electrons move on ellipses via proxy-angle tween; rings spin with `svgOrigin`. Particles on one canvas via `gsap.ticker`, DPR capped at 2, colors read from theme CSS vars.
- Pause: IntersectionObserver + `visibilitychange` pause all tweens and remove ticker. Cleanup returned from `mm.add` + `mm.revert()`.

## Open questions (ask before the relevant phase)

- Cloudinary approach (rec: SDK + custom fetch).
- Cloudinary delete failure behavior; upload size limit; logo/favicon/OG image; analytics.
