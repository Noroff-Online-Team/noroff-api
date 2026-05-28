# Noroff API

This repository contains the source code for the Noroff API. It is a monorepo setup with Turborepo.

## Apps

- [docs](apps/docs): Documentation for the API.
- [v1](apps/v1): Version 1 of the API.
- [v2](apps/v2): Version 2 of the API.

## Shared Packages

- [api-utils](packages/api-utils): Utilities for the API.
- [logger](packages/logger): Logger for the API.

## Getting Started

This project uses pnpm as the package manager.

Run install from the root of the project.

```bash
pnpm install
```

### Running the API

Run the API with the following command.

To run all apps (v1, v2, docs) you can use the following command.

```bash
pnpm dev
```

To run a specific app you can use the following command. We append `...` to limit the scope to a package and its dependencies.

Replace `v2` with the app you want to run. I.e. `v1`, `v2`, `docs`.

```bash
pnpm dev -F v2...
```

## Adding a new API endpoint

New endpoints are added to **v2** (`apps/v2`). Every resource follows the same module
pattern, so adding one is a matter of mirroring an existing module and updating a few
registration points.

> **Tip:** For an automated, end-to-end workflow, hand
> [`prompts/add-v2-endpoint.md`](prompts/add-v2-endpoint.md) to an AI agent — it fills in
> the resource spec, writes all the code, updates the docs and `CLAUDE.md`, and verifies
> the result.

### 1. Create the module

Add a folder under `apps/v2/src/modules/<resource>/` mirroring an existing module — a good
reference is `recipeBook/recipes` (full CRUD) or `books` (read-only):

```
modules/<resource>/
  <resource>.route.ts       # Routes + Zod schemas + auth hooks + swagger tags
  <resource>.controller.ts  # Thin request handlers
  <resource>.service.ts     # Prisma queries via the shared `db` client
  <resource>.schema.ts      # Zod request/response schemas
  __tests__/                # One Jest integration test per operation
```

Key conventions to match:

- Import the database client as `import { db } from "@/utils"`; import model types from
  `@prisma/v2-client` (the custom Prisma output, not `@prisma/client`).
- Paginate lists with `db.<model>.paginate(...).withPages({ limit, page })` and wrap
  responses with `createResponseSchema()` from `@noroff/api-utils` so they return
  `{ data, meta }`.
- Protect routes with `onRequest: [server.authenticate, server.apiKey]` and declare
  `security: [{ bearerAuth: [], apiKey: [] }]` in the route schema.
- Throw `http-errors` (`NotFound`, `Forbidden`, `BadRequest`) — the central error handler
  formats them.

### 2. Wire it up

- Register the routes in `apps/v2/src/modules/routes.ts`:
  `fastify.register(import("./<resource>/<resource>.route"), { prefix: "<resource>" })`.
- Add the new tag(s) to the `tags` array in `apps/v2/src/plugins/swagger.ts`.
- If the resource is database-backed, add the model to `apps/v2/prisma/schema.prisma`, then
  run `pnpm prisma:generate` and `pnpm migrate:dev` inside `apps/v2`.

### 3. Document it

- Add a docs page under `apps/docs/content/docs/v2/<area>/<resource>.mdx` (follow an
  existing page such as `recipe-book/pantry.mdx`) and list it in the relevant `meta.json`.
- Update the "API Modules" and model lists in [`CLAUDE.md`](CLAUDE.md).

### 4. Verify

From `apps/v2`:

```bash
pnpm test:dev      # Docker Postgres + migrations + Jest
pnpm typecheck
pnpm format:write
```