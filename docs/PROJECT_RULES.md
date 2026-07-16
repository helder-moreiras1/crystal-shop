# 🔮 Ametta Crystals — Project Constitution

This document is the binding architecture and coding contract for Ametta Crystals.
All contributors (human or AI) must follow these rules. When in doubt, prefer
consistency with existing code over introducing something new.

---

## 1. Stack (fixed — do not substitute)

| Layer      | Technology                  |
|------------|------------------------------|
| Framework  | Next.js 15 (App Router)     |
| Language   | TypeScript (strict mode)   |
| ORM        | Prisma                     |
| Auth       | Supabase Auth               |
| API layer  | tRPC (all backend communication) |
| Styling    | Tailwind CSS                |
| Components | shadcn/ui                   |

Do not add alternative frameworks, ORMs, auth providers, API layers, CSS
frameworks, or component libraries alongside these without explicit approval.

---

## 2. Backend Rules

1. **Never call Prisma directly from React components** (Server or Client).
   All database access is routed through tRPC procedures.
2. **All data access goes through tRPC routers** — no ad-hoc API routes for
   data fetching/mutation unless required by a third-party webhook/callback
   (e.g. Stripe, Supabase auth callback).
3. **Reuse existing routers** before creating a new one. Check
   `src/server/routers/` first; extend an existing router if the domain
   already has one.
4. **Zod validation is mandatory** for every mutation input (and preferably
   query input). No unvalidated `any`/raw input reaches Prisma.

---

## 3. Frontend Rules

1. **Default to Server Components.** Only add `"use client"` when the
   component needs interactivity (state, effects, event handlers, browser
   APIs).
2. **Reuse shadcn/ui components** already present in the project before
   building a new primitive.
3. **No new UI libraries.** Do not install component/icon/animation
   libraries that duplicate shadcn/Tailwind capability.
4. Keep client/server boundaries minimal — push interactivity down to the
   smallest possible leaf component.

---

## 4. Admin Rules

1. **All admin pages live under `/admin`.**
2. **Use `adminProcedure`** (tRPC middleware) for every admin-only
   query/mutation — never re-implement role checks inline.
3. **Never duplicate authorization logic.** If a new check is needed, add it
   to the shared middleware/helper, not per-route.
4. **Reuse the `AdminSidebar` layout** for all admin pages instead of
   building bespoke navigation per page.

---

## 5. Database Rules

1. **Never modify `prisma/schema.prisma` silently.** Any schema change must
   ship with a migration and a short note (in the PR/commit) explaining the
   change and why.
2. **Reuse existing models** wherever the data already fits — avoid
   duplicate/overlapping tables.
3. **Product images must use the `ProductImage` table** — never store image
   URLs as ad-hoc fields on `Product`.

---

## 6. Code Quality

1. **Reuse existing patterns** (hooks, utils, formatters, router shapes)
   before writing new ones — check `src/utils/`, `src/hooks/`, `src/lib/`.
2. **Avoid duplicate components.** Search `src/components/` before creating
   a new one.
3. **Keep files modular and small.** Split large components/routers instead
   of growing a single file indefinitely.
4. **Maintain Portuguese UI.** All user-facing text stays in Portuguese
   (Portugal) — no partial/mixed-language strings.

---

*This constitution takes precedence over convenience. If a change requires
breaking a rule, call it out explicitly and get sign-off first.*
