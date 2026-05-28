# Add a new v2 endpoint to the Noroff API

You are adding a brand-new endpoint/module to **API v2** (`apps/v2`) of this Turborepo,
then updating the documentation site, `README.md`, and `CLAUDE.md`. Follow the existing
conventions exactly — v2 is consumed by students from their course projects, so response
shapes, error formats, and naming must stay consistent. **Do all of the work yourself and
verify it before reporting done.**

---

## 1. Inputs

Fill these in. **If any are blank or ambiguous, ask the user before building** — do not
guess at the public contract of an endpoint.

- **Resource name**: singular + plural (e.g. `widget` / `widgets`): `____`
- **Route prefix** (kebab-case, e.g. `widgets` or `widget-shop/widgets`): `____`
- **Module dir** under `apps/v2/src/modules/` (camelCase, e.g. `widgets` or
  `widgetShop/widgets`): `____`
- **Swagger tag(s)** (e.g. `widgets`): `____`
- **Storage**: DB-backed (new Prisma model) or static/computed data? `____`
- **Fields**: name → type → validation rules (min/max, enum, optional, default): `____`
- **Relations**: owner profile? media/image? nested sub-resources (e.g. `/:id/comments`)?
  `____`
- **Auth model** per operation: public read vs. authenticated write (JWT + API key) vs.
  owner-scoped mutate/delete: `____`
- **List behaviour**: pagination + sort, and any `search`/filter query params: `____`

If the user only gave a rough description, infer sensible defaults from the closest
existing module, then **confirm the full spec with the user before writing code**.

---

## 2. Study the closest existing module first

Read a comparable module end-to-end before writing anything, and mirror its structure,
naming, and idioms:

- **Full owner-scoped CRUD** with media, nested comments, and search/filter:
  `apps/v2/src/modules/recipeBook/recipes/*`
- **Simple owner-scoped CRUD**: `apps/v2/src/modules/recipeBook/pantry/*`
- **Public read-only catalog** (no DB writes, no auth): `apps/v2/src/modules/books/*`

Each module is a folder of:

```
modules/<dir>/
  <resource>.route.ts       # routes + Zod schema wiring + auth hooks + swagger tags
  <resource>.controller.ts  # thin request handlers
  <resource>.service.ts     # Prisma queries / business logic
  <resource>.schema.ts      # Zod request/response schemas (+ inferred types)
  <resource>.utils.ts       # optional helpers
  __tests__/                # one Jest integration test file per operation
```

---

## 3. Conventions you MUST follow

- **Prisma client import**: use the shared client `import { db } from "@/utils"`. Import
  model types, enums, and `Prisma` from `@prisma/v2-client` (the custom output path —
  **NOT** `@prisma/client`). Path aliases: `@/*` → `src/*`, `@/types/*` → `../types/*`.
- **Pagination**: `db` is extended with `prisma-extension-pagination`. List/read with
  `db.<model>.paginate({ where, orderBy, include }).withPages({ limit, page })`; for a
  single record use `.withPages({ limit: 1 })` and return `data[0]`. Services return
  `{ data, meta }` (or `{ data }` for single/non-paginated results).
- **Responses**: wrap every response schema with `createResponseSchema(...)` from
  `@noroff/api-utils` so the output is `{ data, meta }`. List query schemas extend
  `sortAndPaginationSchema` (also from `@noroff/api-utils`).
- **Auth hooks** (v2 uses `onRequest`, not `preHandler`): protected routes use
  `onRequest: [server.authenticate, server.apiKey]` and declare
  `schema.security: [{ bearerAuth: [], apiKey: [] }]`. Inside handlers, read the user via
  `request.user as RequestUser` (`@/types/api`, which exposes `name` and `email`).
- **Ownership checks**: compare `name.toLowerCase()` against the record's owner; throw
  `Forbidden` from `http-errors` on mismatch. Use `NotFound` / `BadRequest` similarly. The
  central error handler formats all `http-errors`, Zod, JWT, and Prisma errors — just throw.
- **Media**: reuse `mediaProperties` / `mediaPropertiesWithErrors` / `profileCore` from
  `apps/v2/src/modules/auth/auth.schema.ts`. Validate image URLs with `mediaGuard(url)`
  from `@noroff/api-utils` in the controller before persisting.
- **Status codes**: create → `reply.code(201).send(result)`; delete → `reply.code(204)`;
  everything else returns the value directly.
- **Controllers stay thin**: re-validate with
  `schema.parseAsync(request.body | request.params | request.query)`, run ownership/media
  checks, then delegate to the service.
- **Update schemas**: make all fields optional and add
  `.refine(d => Object.keys(d).length > 0, "You must provide at least one field to update")`.
- **Biome style** (match the codebase): no semicolons, no trailing commas, bare single
  arrow params (`x => ...`), 2-space indent, 80-col width, organized imports. Run
  `pnpm format:write` when finished.

---

## 4. Files to create / modify

### Code — in `apps/v2`

1. **`prisma/schema.prisma`** — if DB-backed, add the model(s): UUID `id`
   (`@default(uuid())`) for new resources, `created`/`updated` timestamps, the owner
   relation with cascade deletes, and a `Media?` relation if it has an image. Create the
   migration in step 6.
2. **`src/modules/<dir>/<resource>.schema.ts`** — Zod schemas for `create`, `update`,
   `params`, `query`, and `display` (response), plus inferred `type`s. Provide
   `required_error` / `invalid_type_error` messages and length/enum constraints like the
   recipes module.
3. **`src/modules/<dir>/<resource>.service.ts`** — Prisma queries via `db` with a shared
   `include` object; return `{ data, meta }`.
4. **`src/modules/<dir>/<resource>.controller.ts`** — handlers doing validation, ownership,
   `mediaGuard`, and http-errors, then calling the service.
5. **`src/modules/<dir>/<resource>.route.ts`** — route definitions with `schema.tags`,
   `params`/`querystring`/`body`, `response` wrapped in `createResponseSchema`, and the
   auth hooks where the spec requires them. Export the routes function as `default`.
6. **`src/modules/__tests__`** (`src/modules/<dir>/__tests__/<operation>.test.ts`) — one
   file per operation. Use `getAuthCredentials` + the shared `server` from `@/test-utils`,
   drive endpoints with `server.inject(...)`, and reset state in `beforeEach`/`afterEach`
   via `db.$transaction([... deleteMany ...])` in FK-safe order (children before parents,
   `userProfile` and `media` last). Cover: success (200/201/204), Zod validation (400),
   missing JWT (401), missing API key (401), not found (404), and ownership (403) where
   applicable.
7. **`src/modules/routes.ts`** — register the module:
   `fastify.register(import("./<dir>/<resource>.route"), { prefix: "<route-prefix>" })`.
8. **`src/plugins/swagger.ts`** — add the new tag(s) to the `tags` array so they show up in
   the OpenAPI/Swagger UI at `/docs`.

### Docs — in `apps/docs`

9. **`content/docs/v2/<area>/<resource>.mdx`** — match the existing MDX style: frontmatter
   `title`/`description`; a `<Callout variant="warning">` linking to
   `../auth/register` for authenticated endpoints; a `## The <Model> model` section using
   `<TypeTable>`; one section per operation with
   `<EndpointDetails method="POST" path="/recipe-book/..." />` plus
   ` ```json title="Request" ` / ` ```json title="Response" ` blocks; `<Hr />` between
   sections. (See `content/docs/v2/recipe-book/pantry.mdx` as a template.)
10. **`content/docs/v2/<area>/meta.json`** — add the new page to its `pages` array. Create
    the folder + `meta.json` if it's a new area.
11. **`content/docs/v2/meta.json`** — if it's a new top-level area, add it under the
    `---Endpoints---` divider in `pages`.

### Top-level docs

12. **`CLAUDE.md`** — add the new route(s) under the "API Modules" section, add any new
    model(s) to the "v2 models" list, and note the swagger tag if relevant.
13. **`README.md`** and **`apps/v2/README.md`** — these currently do **not** enumerate
    endpoints, so usually no change is needed. Update only if a section listing
    modules/endpoints already exists; do not invent one.

---

## 5. Verify your work (do not skip)

Run from `apps/v2` unless noted, and fix anything that fails:

- `pnpm prisma:generate` — regenerate the custom client after schema changes.
- `pnpm migrate:dev` — create and apply the migration; give it a descriptive name.
- `pnpm test:dev` — spins up Docker Postgres on port 5433, applies migrations, and runs
  Jest in watch mode; or `pnpm docker:up` then `pnpm test` for a single run. **All new
  tests must pass.**
- `pnpm typecheck` and `pnpm format:write` (from the repo root or the app).
- Optional smoke check: `pnpm build:v2`, then `pnpm dev -F v2...` and confirm the new tag
  and endpoints appear at `http://localhost:3000/docs`.
- Docs check: `pnpm dev -F docs...` (port 3002) and confirm the new page renders and shows
  in the sidebar.

When done, summarize every file you created or changed and the verification results.
