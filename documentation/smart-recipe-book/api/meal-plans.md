# Meal Plans

Base path: `/recipe-book/meal-plans`

Meal plans let users schedule recipes for specific dates and meal types. All endpoints require authentication and are scoped to the current user.

## Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/recipe-book/meal-plans` | Yes | List user's meal plan entries |
| POST | `/recipe-book/meal-plans` | Yes | Add a recipe to the meal plan |
| DELETE | `/recipe-book/meal-plans/:id` | Yes | Remove an entry (owner only) |

---

## Meal Plan Object

```json
{
  "id": "mp-uuid",
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
  "date": "2026-03-18T00:00:00.000Z",
  "mealType": "Dinner",
  "owner": { "name": "john_doe", ... },
  "created": "2026-03-16T09:00:00.000Z"
}
```

---

## GET `/recipe-book/meal-plans`

List the current user's meal plan entries. Supports filtering by date range, pagination, and sorting.

### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | 1 | Page number |
| `limit` | integer | 100 | Items per page (max 100) |
| `sort` | string | `date` | Sort field |
| `sortOrder` | string | `asc` | `asc` or `desc` |
| `startDate` | ISO date string | — | Filter: entries on or after this date |
| `endDate` | ISO date string | — | Filter: entries on or before this date |

### Example: Get this week's plan

```bash
GET /recipe-book/meal-plans?startDate=2026-03-16&endDate=2026-03-22
```

### Response `200`

```json
{
  "data": [
    { "id": "...", "recipeId": "...", "recipe": { ... }, "date": "...", "mealType": "Dinner", ... }
  ],
  "meta": { ... }
}
```

---

## POST `/recipe-book/meal-plans`

Add a recipe to the user's meal plan.

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `recipeId` | string (UUID) | Yes | The recipe to schedule |
| `date` | ISO date string | Yes | The date (e.g., `"2026-03-18"` or `"2026-03-18T00:00:00.000Z"`) |
| `mealType` | string | Yes | `"Breakfast"`, `"Lunch"`, `"Dinner"`, or `"Snack"` |

### Example

```bash
curl -X POST /recipe-book/meal-plans \
  -H "Authorization: Bearer <token>" \
  -H "X-Noroff-API-Key: <key>" \
  -H "Content-Type: application/json" \
  -d '{
    "recipeId": "f229424c-da96-4725-b112-4a880cc7f2e0",
    "date": "2026-03-18",
    "mealType": "Dinner"
  }'
```

### Response `201`

Returns the created meal plan entry (with full recipe).

### Response `404`

Returned when the recipe does not exist.

### Response `400`

Returned when `mealType` is not one of the allowed values.

---

## DELETE `/recipe-book/meal-plans/:id`

Remove a meal plan entry. Only the owner can delete.

### Response `204`

No content returned on success.

### Response `403`

Returned when a non-owner tries to delete.

### Response `404`

Returned when no meal plan entry exists with the given ID.
