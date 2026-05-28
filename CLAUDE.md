# Noroff API

Educational REST API backend for Noroff School of Technology assignments. Turborepo monorepo with two API versions (v1, v2), a documentation site, and shared packages. Students consume these endpoints from course projects, so responses and error formats are intentionally stable and predictable.

## Tech Stack

- **Runtime**: Node.js >= 22.14.0
- **Framework**: Fastify 4.23.2 (TypeScript)
- **ORM**: Prisma 5.4.1 with PostgreSQL
- **Validation**: Zod with `fastify-type-provider-zod` (Zod schemas drive both validation and OpenAPI)
- **Auth**: JWT (`@fastify/jwt`) + API keys (v2 only)
- **Docs**: Swagger/OpenAPI auto-generated from Zod schemas; separate Fumadocs site
- **Package Manager**: pnpm 9.1.2 (workspaces)
- **Build**: Turbo + tsup (apps), Next.js (docs)
- **Linter/Formatter**: Biome (NOT ESLint/Prettier)
- **Monorepo lint**: `sherif` (dependency consistency, runs on `postinstall`)
- **Testing**: Jest + ts-jest (v2 only), against a real Postgres

## Repository Structure

```
apps/
  v1/                    # API v1 - Fastify, prefix /api/v1, port 3001
  v2/                    # API v2 - Fastify, no prefix, port 3000
  docs/                  # Documentation site (Next.js 15, Fumadocs MDX), port 3002
packages/
  api-utils/             # Shared Zod schemas, createResponseSchema, mediaGuard, hash, getRandomNumber
  logger/                # Pino + pino-loki logging factory
tooling/github/          # GitHub Actions setup utilities
configs/                 # Prometheus & Grafana configs
docker/                  # Docker setup scripts
documentation/           # Project planning docs (e.g. smart-recipe-book/)
```

## Commands

Run from the repo root unless noted.

```bash
# Development
pnpm dev                 # Run all apps in parallel (Turbo)
pnpm dev -F v2...        # Run v2 only (with its workspace deps)
pnpm dev -F v1...        # Run v1 only
pnpm dev -F docs...      # Run docs only

# Build
pnpm build               # Build everything
pnpm build:v1            # v1 only
pnpm build:v2            # v2 only
pnpm build:docs          # docs only

# Quality
pnpm lint                # Biome lint (turbo)
pnpm format:write        # Biome format + write (turbo)
pnpm typecheck           # tsc --noEmit (turbo; depends on prisma:generate + ^build)
pnpm lint:ws             # sherif (monorepo dependency check)

# Database — run inside apps/v1 or apps/v2
pnpm prisma:generate     # Generate Prisma client (custom output, see below)
pnpm migrate:dev         # prisma migrate dev (v2 has this script; v1 does not)
pnpm db:seed             # Seed database (v2 only; prisma/seed.ts)

# Testing — v2 only, run inside apps/v2
pnpm test                # jest --runInBand (expects a reachable DATABASE_URL)
pnpm test:dev            # Spins up Docker Postgres, migrate deploy, then jest --watch
pnpm docker:up           # Start test Postgres (docker-compose.tests.yml, port 5433)
pnpm docker:down         # Stop test Postgres
```

## Critical Conventions

### Prisma client import paths (gotcha)
Each app generates Prisma client to a **custom output path**, NOT the default `@prisma/client`:
- v1: `import { PrismaClient } from "@prisma/v1-client"`
- v2: `import { PrismaClient, Prisma } from "@prisma/v2-client"` (also import generated model types from here, e.g. `import type { Recipe } from "@prisma/v2-client"`)

This lets both versions coexist in one install. After changing a schema you MUST run `pnpm prisma:generate` in that app, or types/imports break.

### `db` singleton (v2)
Import the database client as `import { db } from "@/utils"`. It is a `PrismaClient` extended with `prisma-extension-pagination` (`db.<model>.paginate(...).withPages({ limit, page })`), default limit 100, `includePageCount: true`. Do not instantiate `new PrismaClient()` in modules. (v1 uses `import { prisma } from "@/utils/prisma"`, no pagination extension.)

### Path alias
`@/*` → `src/*` and `@/types/*` → `../types/*` (configured in each app's `tsconfig.json` and mirrored in `jest.config.ts` `moduleNameMapper`).

### Biome formatting (match existing style)
No semicolons (`asNeeded`), no trailing commas, single arrow-param without parens (`x => ...`), 2-space indent, 80-char line width, LF line endings, organize-imports on. Run `pnpm format:write` before committing.

## Module Pattern

Both v1 and v2 use the same per-resource layout:

```
modules/<domain>/<resource>/
  <resource>.route.ts       # Routes + Zod schema wiring + auth hooks + swagger tags
  <resource>.controller.ts  # Request handlers (thin; call services)
  <resource>.service.ts     # Prisma queries / business logic
  <resource>.schema.ts      # Zod request/response schemas (+ inferred types)
  <resource>.utils.ts       # Optional helpers
  __tests__/                # Jest integration tests (v2 only), one file per operation
```

Routes are registered in `src/modules/routes.ts` via `fastify.register(import("./path/x.route"), { prefix: "name" })`.

### Route definition
```typescript
async function recipesRoutes(server: FastifyInstance) {
  server.post(
    "/",
    {
      onRequest: [server.authenticate, server.apiKey], // v2 auth (see below)
      schema: {
        tags: ["recipe-book-recipes"],
        security: [{ bearerAuth: [], apiKey: [] }],
        body: createRecipeSchema,
        response: { 201: createResponseSchema(displayRecipeSchema) }
      }
    },
    createRecipeHandler
  )
}
export default recipesRoutes
```

### Controller/handler
Handlers are thin: parse params/body, call the service, throw `http-errors` (`NotFound`, `BadRequest`, `Forbidden`, …) on failure, return the service result. Some handlers re-validate the body with `schema.parseAsync(request.body)` before delegating.

### Authentication
- **JWT**: `preHandler: [server.authenticate]` (v1) or `onRequest: [server.authenticate]` (v2). The `authenticate` decorator calls `request.jwtVerify()`.
- **API key** (v2 only): `onRequest: [server.apiKey]`. The `apiKey` decorator reads header `X-Noroff-API-Key` and checks it exists and is `ACTIVE` in the DB.
- Most authed v2 routes use both: `onRequest: [server.authenticate, server.apiKey]`.

### Response format
- **v1**: handlers return data directly.
- **v2**: wrapped `{ data, meta }` where `meta` carries pagination (`isFirstPage, isLastPage, currentPage, previousPage, nextPage, pageCount, totalCount`). Wrap response schemas with `createResponseSchema()` from `@noroff/api-utils`.

### Error format (both versions)
A central error handler (`src/exceptions/errorHandler.ts`) runs a strategy chain — Zod → http-errors → JWT (`FST_JWT_*`) → rate-limit (429) → Prisma (`PrismaClientKnownRequestError` codes P2001/P2002/P2003/P2010, etc.) → fallback 500 — and always emits:
```json
{
  "errors": [{ "code": "...", "message": "...", "path": ["field"] }],
  "status": "Bad Request",
  "statusCode": 400
}
```
`notFoundHandler.ts` matches this shape for unknown routes.

## v1 vs v2 Differences

| Aspect | v1 | v2 |
|--------|----|----|
| Route prefix | `/api/v1` | None (root) |
| Auth hooks | `preHandler` | `onRequest` |
| API keys | No | Yes (`X-Noroff-API-Key`) |
| Response wrapping | Raw data | `{ data, meta }` |
| Pagination | Manual | `prisma-extension-pagination` |
| Media | Inline fields | Centralized `Media` model |
| Profiles | Domain-specific (Profile, AuctionProfile, HolidazeProfile) | Unified `UserProfile` |
| Tests | None | Jest integration tests |
| Prisma client | `@prisma/v1-client` | `@prisma/v2-client` |

## Database

Schemas: `apps/v1/prisma/schema.prisma` and `apps/v2/prisma/schema.prisma`. Both apps keep a `prisma/migrations/` folder. v1 is no longer migrated on build (see recent history); v2 migrates via `migrate:dev` locally and `start:migrate:prod` (`prisma migrate deploy && start`) in prod.

**v1 models**: Book, OldGame, NbaTeam, Joke, CatFact, Quote, OnlineShopProduct, OnlineShopReview, RainyDaysProduct, GameHubProducts, SquareEyesProduct, Profile, Post, Reaction, Comment, AuctionProfile, AuctionListing, AuctionBid, HolidazeProfile, HolidazeVenue, HolidazeVenueMeta, HolidazeVenueLocation, HolidazeBooking

**v2 models**: Book, OldGame, NbaTeam, Joke, CatFact, Quote, OnlineShopProduct, OnlineShopReview, RainyDaysProduct, GameHubProducts, SquareEyesProduct, Media, ApiKey (+ `ApiKeyStatus` enum), UserProfile, SocialPost, SocialPostReaction, SocialPostComment, AuctionListing, AuctionBid, HolidazeVenue, HolidazeVenueMeta, HolidazeVenueLocation, HolidazeBooking, BlogPost, Pet, Artwork, LibraryBook, LibraryBookReview, Recipe, PantryItem, RecipeFavorite, RecipeComment, MealPlan

## API Modules

### Shared (both versions)
- `/books` — Book catalog
- `/cat-facts`, `/jokes`, `/quotes` — Random content
- `/nba-teams`, `/old-games` — Sports / gaming data
- `/online-shop`, `/rainy-days`, `/square-eyes`, `/gamehub` — E-commerce product catalogs
- `/auth` — Registration, login, JWT (v2 also issues API keys)
- `/social/posts`, `/social/profiles` — Social media
- `/auction/listings`, `/auction/profiles` — Auction house with bidding
- `/holidaze/venues`, `/holidaze/bookings`, `/holidaze/profiles` — Holiday venue booking
- `/status` — Health check

### v2-only Modules
- `/blog/posts/:name` — Blog posts by profile
- `/artworks` — Artwork gallery
- `/library` — Library books with reviews
- `/pets` — Pet adoption
- **Smart Recipe Book** (`recipe-book/*`):
  - `/recipe-book/recipes` — Recipes (+ nested `/:id/comments`), search/filter by category & difficulty
  - `/recipe-book/pantry` — User pantry items
  - `/recipe-book/favorites` — Favorited recipes
  - `/recipe-book/comments` — Recipe comments
  - `/recipe-book/meal-plans` — Meal planning
  - `/recipe-book/ai` — `POST /substitutions`, `POST /scale`, `POST /generate`

> **Note on the AI module**: It is intentionally **deterministic / mocked**, not backed by a real LLM. Substitutions come from a static `SUBSTITUTION_MAP` in `ai.service.ts`, scaling is plain arithmetic, and generate returns a templated recipe. Keep this in mind before assuming external AI calls. (Current branch `feature-add-ai-documentation` documents these endpoints.)

## Plugin / Hook / Decorator Architecture

Auto-loaded with `@fastify/autoload` from `src/plugins/`, `src/hooks/`, `src/decorators/` in `server.ts`.

**Plugins** (`src/plugins/`):
- `cors.ts` — `origin: "*"`
- `jwt.ts` — `@fastify/jwt` registration (uses `JWT_SECRET`)
- `swagger.ts` — `@fastify/swagger` OpenAPI generation via `jsonSchemaTransform`; declares tags + `securityDefinitions` (`apiKey`, `bearerAuth`)
- `ui-swagger.ts` — Swagger UI served at `/docs`
- `metrics.ts` — `fastify-metrics` Prometheus endpoint at `/metrics`
- `rate-limit.ts` — 600 req / 10 min, keyed by `true-client-ip` + User-Agent + (username if authed)
- `form-body.ts` (v2) — `@fastify/formbody` parsing form bodies with `qs`

**Hooks** (`src/hooks/`):
- `logger.ts` — pino logging on `onRequest` / `onResponse` / `onError`
- `preHandler.ts` — attaches `req.jwt`
- `onRequest.ts` (v2) — strips `content-type` for `PUT /social/profiles/*/follow|unfollow` so empty-body JSON requests don't 400

**Decorators** (`src/decorators/`):
- `authenticate.ts` — `request.jwtVerify()`
- `apiKey.ts` (v2) — validates `X-Noroff-API-Key` against the `ApiKey` table

## Shared Packages

- `@noroff/api-utils` — `createResponseSchema()`, `sortAndPaginationSchema`, `mediaGuard()`/`validateImageURL()` (fetches a URL to confirm an image is reachable; throws `BadRequest` if not), `hash`, `getRandomNumber`. Imported as `workspace:*`.
- `@noroff/logger` — `createLogger({ label })` returning a Pino instance with a pino-loki transport. **Silent when `NODE_ENV=test`**; otherwise **requires `LOKI_HOST`** or it throws.

## Environment Variables

```
DATABASE_URL       # PostgreSQL connection string
JWT_SECRET         # JWT signing secret
PORT               # 3000 for v2, 3001 for v1 (docs is 3002 via npm script)
LOKI_HOST          # Required by @noroff/logger outside NODE_ENV=test
```
v2 testing uses `apps/v2/.env.test`. Docker Compose for general setup uses `DC_POSTGRES_USER`, `DC_POSTGRES_PASSWORD`, `DC_POSTGRES_URI`, `DC_JWT_SECRET`.

## Testing (v2)

- Jest + ts-jest, `--runInBand` (serial — tests share one DB). `setupFilesAfterEach`/`setupFilesAfterEnv` boots a real Fastify server (`src/test-utils/server.ts`) in `beforeAll` and closes it in `afterAll`; import the shared `server` from `@/test-utils`.
- `pnpm test:dev` runs `src/test-utils/scripts/run-integration.sh`: ensures the Docker Postgres (`docker-compose.tests.yml`, host port 5433) is up, waits for `pg_isready`, runs `prisma migrate deploy`, then `jest --watch`.
- Test data uses `@faker-js/faker`; seeded API keys/credentials live in `src/test-utils/credentials.ts`.

## Docs Site (apps/docs)

Next.js 15 + Fumadocs MDX. Content lives in `apps/docs/content/docs/{v1,v2}/...` (e.g. `v2/recipe-book/ai.mdx`). `postinstall` runs `fumadocs-mdx` to generate the `.source/` index. Dev server runs on port 3002.

## CI/CD

GitHub Actions (`.github/workflows/`):
- `ci.yml` — general CI
- `v1_build.yml` — v1 build
- `v2_build_and_test.yml` — v2 build + Jest tests against a Postgres service
- `docs_build.yml` — docs build
