# Noroff API

Educational REST API backend for Noroff School of Technology assignments. Turborepo monorepo with two API versions (v1, v2), a documentation site, and shared packages.

## Tech Stack

- **Runtime**: Node.js >= 22.14.0
- **Framework**: Fastify 4.23.2 (TypeScript)
- **ORM**: Prisma 5.4.1 with PostgreSQL
- **Validation**: Zod with `fastify-type-provider-zod`
- **Auth**: JWT (`@fastify/jwt`) + API keys (v2 only)
- **Docs**: Swagger/OpenAPI auto-generated from Zod schemas
- **Package Manager**: pnpm 9.1.2
- **Build**: Turbo, tsup
- **Linter/Formatter**: Biome (not ESLint/Prettier)
- **Testing**: Jest + ts-jest (v2 only)

## Repository Structure

```
apps/
  v1/                    # API v1 - Fastify, prefix /api/v1, port 3001
  v2/                    # API v2 - Fastify, no prefix, port 3000
  docs/                  # Documentation site (Next.js 15, Fumadocs)
packages/
  api-utils/             # Shared schemas, validation helpers, media guard
  logger/                # Pino + Pino Loki logging
tooling/github/          # GitHub Actions setup utilities
configs/                 # Prometheus & Grafana configs
docker/                  # Docker setup scripts
documentation/           # Project planning documents
```

## Commands

```bash
# Development
pnpm dev                 # Run all apps (Turbo)
pnpm dev -F v2...        # Run v2 only (with dependencies)

# Build
pnpm build               # Build all
pnpm build:v1            # Build v1 only
pnpm build:v2            # Build v2 only

# Lint & Format
pnpm lint                # Biome lint
pnpm format:write        # Biome format (auto-fix)
pnpm typecheck           # TypeScript type checking

# Database (run inside apps/v1 or apps/v2)
pnpm prisma:generate     # Generate Prisma client
pnpm migrate:dev         # Run migrations (v2)
pnpm db:seed             # Seed database (v2)

# Testing (v2 only)
pnpm test                # Run all tests (--runInBand)
pnpm test:dev            # Integration tests with Docker
pnpm docker:up           # Start test containers
pnpm docker:down         # Stop test containers
```

## Module Pattern

Both v1 and v2 follow the same module structure:

```
modules/<domain>/
  <resource>.route.ts       # Route definitions with Zod schemas
  <resource>.controller.ts  # Request handlers
  <resource>.service.ts     # Business logic / Prisma queries (v2)
  <resource>.schema.ts      # Zod validation schemas
  __tests__/                # Integration tests (v2 only)
```

Routes are registered in `src/modules/routes.ts` via `fastify.register(import("./path"), { prefix: "name" })`.

## API Architecture

### Route Definition Pattern

```typescript
export async function bookRoutes(server: FastifyInstance) {
  server.get(
    "/:id",
    {
      schema: {
        tags: ["books"],
        params: bookParamsSchema,
        querystring: querySchema,
        response: { 200: bookResponseSchema }
      }
    },
    getBookHandler
  )
}
```

### Controller/Handler Pattern

```typescript
export async function getBookHandler(
  request: FastifyRequest<{ Params: { id: number } }>
) {
  const { id } = request.params
  const book = await getBook(id)
  if (!book) throw new NotFound("No book with such ID")
  return book
}
```

### Authentication

- **JWT**: Applied via `preHandler: [server.authenticate]` (v1) or `onRequest: [server.authenticate]` (v2)
- **API Key** (v2): Header `X-Noroff-API-Key`, validated via `onRequest: [server.apiKey]`
- Routes needing auth use: `onRequest: [server.authenticate, server.apiKey]`

### Response Format

**v1**: Returns data directly from handlers.

**v2**: Wrapped responses with pagination metadata:
```typescript
{
  data: [...],
  meta: { isFirstPage, isLastPage, currentPage, previousPage, nextPage, pageCount, totalCount }
}
```

Use `createResponseSchema()` from `@noroff/api-utils` to wrap schemas.

### Error Format

```json
{
  "errors": [{ "code": "...", "message": "...", "path": ["field"] }],
  "status": "Bad Request",
  "statusCode": 400
}
```

## v1 vs v2 Differences

| Aspect | v1 | v2 |
|--------|----|----|
| Route prefix | `/api/v1` | None (root) |
| Auth hooks | `preHandler` | `onRequest` |
| API keys | No | Yes |
| Response wrapping | Raw data | `{ data, meta }` |
| Pagination | Manual | `prisma-extension-pagination` |
| Media | Inline fields | Centralized `Media` model |
| Profiles | Domain-specific (SocialProfile, AuctionProfile, HolidazeProfile) | Unified `UserProfile` |
| Tests | None | Jest integration tests |

## Database

Prisma schemas are at `apps/v1/prisma/schema.prisma` and `apps/v2/prisma/schema.prisma`.

**v1 models**: Book, OldGame, NbaTeam, Joke, CatFact, Quote, OnlineShopProduct, RainyDaysProduct, GameHubProducts, SquareEyesProduct, Profile, Post, Comment, Reaction, AuctionProfile, AuctionListing, AuctionBid, HolidazeProfile, HolidazeVenue, HolidazeBooking

**v2 models**: All above (unified) plus Media, ApiKey, BlogPost, Pet, Artwork, LibraryBook

## API Modules

### Shared (both versions)
- `/books` - Book catalog
- `/cat-facts`, `/jokes`, `/quotes` - Random content
- `/nba-teams`, `/old-games` - Sports/gaming data
- `/online-shop`, `/rainy-days`, `/square-eyes`, `/gamehub` - E-commerce product catalogs

### Domain Modules
- `/auth` - Registration, login, JWT tokens (v2 adds API key creation)
- `/social/posts` - Social media posts with reactions and comments
- `/social/profiles` - User profiles
- `/auction/listings` - Auction items with bidding
- `/auction/profiles` - Auction user profiles
- `/holidaze/venues` - Holiday venue management
- `/holidaze/bookings` - Booking management
- `/holidaze/profiles` - Holidaze user profiles

### v2-Only Modules
- `/blog/posts/:name` - Blog posts by profile
- `/artworks` - Artwork gallery
- `/library` - Library books with reviews
- `/pets` - Pet adoption

## Plugin Architecture

Auto-loaded from `src/plugins/`, `src/hooks/`, `src/decorators/`:

- **cors.ts** - `origin: "*"`
- **jwt.ts** - JWT verification plugin
- **swagger.ts** - OpenAPI doc generation with `jsonSchemaTransform`
- **rate-limit.ts** - 600 req / 10 min, keyed by IP + User-Agent + username
- **metrics.ts** - Fastify metrics for Prometheus
- **authenticate.ts** - Decorator calling `request.jwtVerify()`
- **apiKey.ts** (v2) - Validates `X-Noroff-API-Key` header against DB

## Environment Variables

```
DATABASE_URL       # PostgreSQL connection string
JWT_SECRET         # JWT signing secret
PORT               # Server port (3000 for v2, 3001 for v1)
```

Docker Compose uses: `DC_POSTGRES_USER`, `DC_POSTGRES_PASSWORD`, `DC_POSTGRES_URI`, `DC_JWT_SECRET`

## CI/CD

GitHub Actions workflows:
- `ci.yml` - General CI
- `v1_build.yml` - v1 build
- `v2_build_and_test.yml` - v2 build + Jest tests with PostgreSQL service
- `docs_build.yml` - Documentation build
