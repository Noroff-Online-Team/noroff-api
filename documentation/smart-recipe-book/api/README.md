# Smart Recipe Book API

The Smart Recipe Book API is a module of the Noroff API v2. It provides endpoints for managing recipes, pantry items, favorites, comments, meal plans, and AI-powered features.

All endpoints are prefixed with `/recipe-book`.

## Base URL

```
https://v2.api.noroff.dev/recipe-book
```

## Authentication

The Smart Recipe Book uses the existing Noroff API v2 authentication system. Most write operations require:

1. A valid **Bearer token** in the `Authorization` header
2. A valid **API key** in the `X-Noroff-API-Key` header

To obtain these, use the standard Noroff auth endpoints:

```
POST /auth/register   — Create an account
POST /auth/login      — Get an access token
POST /auth/create-api-key — Get an API key
```

### Authenticated request example

```bash
curl -X POST https://v2.api.noroff.dev/recipe-book/recipes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-token>" \
  -H "X-Noroff-API-Key: <your-api-key>" \
  -d '{ "title": "My Recipe", ... }'
```

## Response Format

All responses follow this shape:

```json
{
  "data": { ... },
  "meta": { ... }
}
```

For paginated list endpoints, `meta` contains:

```json
{
  "isFirstPage": true,
  "isLastPage": false,
  "currentPage": 1,
  "previousPage": null,
  "nextPage": 2,
  "pageCount": 5,
  "totalCount": 47
}
```

For single-resource endpoints, `meta` is `{}`.

## Error Format

```json
{
  "errors": [
    {
      "code": "invalid_type",
      "message": "Title is required",
      "path": ["title"]
    }
  ]
}
```

### Common HTTP status codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 204 | Deleted (no content) |
| 400 | Validation error |
| 401 | Not authenticated / missing API key |
| 403 | Not authorized (e.g., not the owner) |
| 404 | Resource not found |
| 409 | Conflict (e.g., duplicate favorite) |

## Pagination & Sorting

All list endpoints support these query parameters:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | 1 | Page number |
| `limit` | integer | 100 | Items per page (max 100) |
| `sort` | string | `created` | Field to sort by |
| `sortOrder` | string | `desc` | `asc` or `desc` |

## Media (Images)

Images use the Noroff `Media` model pattern. When providing an image, send an object:

```json
{
  "image": {
    "url": "https://example.com/photo.jpg",
    "alt": "Description of the image"
  }
}
```

- `url` — Required. Must be a valid URL (max 300 characters).
- `alt` — Optional. Alt text (max 120 characters). Defaults to `""`.

## Owner / Author

Resources are tied to users via the `ownerName` field (the user's unique name). In responses, the `owner` (or `author`) field includes the user profile:

```json
{
  "owner": {
    "name": "jane_doe",
    "email": "jane@stud.noroff.no",
    "bio": null,
    "avatar": { "url": "...", "alt": "" },
    "banner": { "url": "...", "alt": "" }
  }
}
```

## API Sections

- [Recipes](./recipes.md) — CRUD for recipes + nested comments
- [Pantry](./pantry.md) — User's pantry items
- [Favorites](./favorites.md) — Favorited recipes
- [Comments](./comments.md) — Edit/delete comments
- [Meal Plans](./meal-plans.md) — Weekly meal planning
- [AI](./ai.md) — Substitutions, scaling, recipe generation
