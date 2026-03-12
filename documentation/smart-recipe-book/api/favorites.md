# Favorites

Base path: `/recipe-book/favorites`

Users can favorite recipes to save them for quick access. All endpoints require authentication. Favorites are unique per user+recipe pair — you cannot favorite the same recipe twice.

## Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/recipe-book/favorites` | Yes | List current user's favorites |
| POST | `/recipe-book/favorites` | Yes | Add a recipe to favorites |
| DELETE | `/recipe-book/favorites/:recipeId` | Yes | Remove a recipe from favorites |

---

## Favorite Object

The GET response returns full recipe objects nested inside the favorite, so you don't need a second fetch.

```json
{
  "id": "fav-uuid",
  "recipeId": "recipe-uuid",
  "recipe": {
    "id": "recipe-uuid",
    "title": "Classic Margherita Pizza",
    "description": "A simple and delicious homemade pizza.",
    "prepTime": 20,
    "cookTime": 15,
    "servings": 4,
    "difficulty": "Easy",
    "category": "Dinner",
    "ingredients": [...],
    "instructions": [...],
    "tags": ["Italian"],
    "image": { "url": "...", "alt": "..." },
    "owner": { "name": "jane_doe", ... },
    "created": "2026-03-12T10:30:00.000Z",
    "updated": "2026-03-12T10:30:00.000Z"
  },
  "owner": { "name": "john_doe", ... },
  "created": "2026-03-12T14:00:00.000Z"
}
```

---

## GET `/recipe-book/favorites`

List the current user's favorited recipes. Supports pagination and sorting.

### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | 1 | Page number |
| `limit` | integer | 100 | Items per page (max 100) |
| `sort` | string | `created` | Sort field |
| `sortOrder` | string | `desc` | `asc` or `desc` |

### Response `200`

```json
{
  "data": [
    { "id": "...", "recipeId": "...", "recipe": { ... }, ... }
  ],
  "meta": { ... }
}
```

---

## POST `/recipe-book/favorites`

Add a recipe to the current user's favorites.

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `recipeId` | string (UUID) | Yes | The ID of the recipe to favorite |

### Example

```bash
curl -X POST /recipe-book/favorites \
  -H "Authorization: Bearer <token>" \
  -H "X-Noroff-API-Key: <key>" \
  -H "Content-Type: application/json" \
  -d '{ "recipeId": "f229424c-da96-4725-b112-4a880cc7f2e0" }'
```

### Response `201`

Returns the created favorite object (with full recipe).

### Response `404`

Returned when the recipe does not exist.

### Response `409`

Returned when the user has already favorited this recipe.

---

## DELETE `/recipe-book/favorites/:recipeId`

Remove a recipe from the current user's favorites. Note: the URL parameter is the **recipe ID**, not the favorite ID.

### Example

```bash
curl -X DELETE /recipe-book/favorites/f229424c-da96-4725-b112-4a880cc7f2e0 \
  -H "Authorization: Bearer <token>" \
  -H "X-Noroff-API-Key: <key>"
```

### Response `204`

No content returned on success.

### Response `404`

Returned when the user has not favorited this recipe.
