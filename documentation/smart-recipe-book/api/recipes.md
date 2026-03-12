# Recipes

Base path: `/recipe-book/recipes`

Recipes are the core resource. Anyone can browse and read recipes. Creating, updating, and deleting requires authentication and ownership.

## Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/recipe-book/recipes` | No | List all recipes (paginated, filterable) |
| GET | `/recipe-book/recipes/:id` | No | Get a single recipe |
| POST | `/recipe-book/recipes` | Yes | Create a recipe |
| PUT | `/recipe-book/recipes/:id` | Yes | Update a recipe (owner only) |
| DELETE | `/recipe-book/recipes/:id` | Yes | Delete a recipe (owner only) |
| GET | `/recipe-book/recipes/:recipeId/comments` | No | List comments for a recipe |
| POST | `/recipe-book/recipes/:recipeId/comments` | Yes | Add a comment to a recipe |

---

## Recipe Object

```json
{
  "id": "f229424c-da96-4725-b112-4a880cc7f2e0",
  "title": "Classic Margherita Pizza",
  "description": "A simple and delicious homemade pizza with fresh basil.",
  "prepTime": 20,
  "cookTime": 15,
  "servings": 4,
  "difficulty": "Medium",
  "category": "Dinner",
  "ingredients": [
    { "name": "Pizza dough", "quantity": 1, "unit": "ball" },
    { "name": "Tomato sauce", "quantity": 0.5, "unit": "cup" },
    { "name": "Fresh mozzarella", "quantity": 200, "unit": "g" },
    { "name": "Fresh basil", "quantity": 6, "unit": "leaves" }
  ],
  "instructions": [
    "Preheat oven to 250C.",
    "Roll out the pizza dough on a floured surface.",
    "Spread tomato sauce evenly over the dough.",
    "Tear mozzarella into pieces and distribute over sauce.",
    "Bake for 12-15 minutes until crust is golden.",
    "Top with fresh basil leaves and serve immediately."
  ],
  "tags": ["Italian", "Vegetarian", "Quick"],
  "image": {
    "url": "https://images.unsplash.com/photo-1574071318508-1cdbab80d002",
    "alt": "Margherita pizza"
  },
  "owner": {
    "name": "jane_doe",
    "email": "jane@stud.noroff.no",
    "bio": null,
    "avatar": null,
    "banner": null
  },
  "comments": [],
  "_count": {
    "favorites": 3
  },
  "created": "2026-03-12T10:30:00.000Z",
  "updated": "2026-03-12T10:30:00.000Z"
}
```

---

## GET `/recipe-book/recipes`

List all recipes with optional filtering, sorting, and pagination.

### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | 1 | Page number |
| `limit` | integer | 100 | Items per page (max 100) |
| `sort` | string | `created` | Sort field (e.g., `title`, `created`, `category`) |
| `sortOrder` | string | `desc` | `asc` or `desc` |
| `search` | string | — | Search by title or description (case-insensitive) |
| `category` | string | — | Filter by category (case-insensitive) |
| `difficulty` | string | — | Filter by difficulty (case-insensitive) |

### Example

```bash
# Search for pasta recipes
GET /recipe-book/recipes?search=pasta&category=Dinner&limit=12&page=1

# Sort by title A-Z
GET /recipe-book/recipes?sort=title&sortOrder=asc
```

### Response `200`

```json
{
  "data": [
    { "id": "...", "title": "...", ... }
  ],
  "meta": {
    "isFirstPage": true,
    "isLastPage": false,
    "currentPage": 1,
    "previousPage": null,
    "nextPage": 2,
    "pageCount": 4,
    "totalCount": 47
  }
}
```

---

## GET `/recipe-book/recipes/:id`

Get a single recipe by ID.

### Response `200`

```json
{
  "data": { "id": "...", "title": "...", ... },
  "meta": {}
}
```

### Response `404`

Returned when no recipe exists with the given ID.

---

## POST `/recipe-book/recipes`

Create a new recipe. Requires authentication.

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | Yes | 1-280 characters |
| `description` | string | Yes | Max 2000 characters |
| `prepTime` | integer | Yes | Minutes, >= 0 |
| `cookTime` | integer | Yes | Minutes, >= 0 |
| `servings` | integer | Yes | >= 1 |
| `difficulty` | string | Yes | `"Easy"`, `"Medium"`, or `"Hard"` |
| `category` | string | Yes | Max 50 characters (e.g., `"Breakfast"`, `"Dinner"`) |
| `ingredients` | array | Yes | At least 1 ingredient object |
| `instructions` | string[] | Yes | At least 1 instruction string |
| `tags` | string[] | No | Max 8 tags, each max 24 characters. Defaults to `[]` |
| `image` | object | No | `{ url, alt }` — see Media section |

**Ingredient object:**

```json
{ "name": "Flour", "quantity": 200, "unit": "g" }
```

### Example

```bash
curl -X POST /recipe-book/recipes \
  -H "Authorization: Bearer <token>" \
  -H "X-Noroff-API-Key: <key>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Classic Margherita Pizza",
    "description": "A simple and delicious homemade pizza.",
    "prepTime": 20,
    "cookTime": 15,
    "servings": 4,
    "difficulty": "Easy",
    "category": "Dinner",
    "ingredients": [
      { "name": "Pizza dough", "quantity": 1, "unit": "ball" },
      { "name": "Tomato sauce", "quantity": 0.5, "unit": "cup" }
    ],
    "instructions": [
      "Preheat oven to 250C.",
      "Roll out dough and add toppings.",
      "Bake for 12-15 minutes."
    ],
    "tags": ["Italian", "Vegetarian"]
  }'
```

### Response `201`

Returns the created recipe object.

---

## PUT `/recipe-book/recipes/:id`

Update a recipe. Only the owner can update. All fields are optional — send only what you want to change.

### Request Body

Same fields as POST, but all optional. Must provide at least one field.

### Example

```bash
curl -X PUT /recipe-book/recipes/<id> \
  -H "Authorization: Bearer <token>" \
  -H "X-Noroff-API-Key: <key>" \
  -H "Content-Type: application/json" \
  -d '{ "title": "Updated Pizza Recipe", "servings": 6 }'
```

### Response `200`

Returns the updated recipe object.

### Response `403`

Returned when a non-owner tries to update.

---

## DELETE `/recipe-book/recipes/:id`

Delete a recipe. Only the owner can delete.

### Response `204`

No content returned on success.

### Response `403`

Returned when a non-owner tries to delete.

---

## GET `/recipe-book/recipes/:recipeId/comments`

List all comments for a recipe. No authentication required.

### Response `200`

```json
{
  "data": [
    {
      "id": "comment-uuid",
      "text": "This was delicious!",
      "recipeId": "recipe-uuid",
      "author": {
        "name": "john_doe",
        "email": "john@stud.noroff.no",
        ...
      },
      "created": "2026-03-12T14:00:00.000Z",
      "updated": "2026-03-12T14:00:00.000Z"
    }
  ],
  "meta": {}
}
```

---

## POST `/recipe-book/recipes/:recipeId/comments`

Add a comment to a recipe. Requires authentication.

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `text` | string | Yes | 1-280 characters |

### Example

```bash
curl -X POST /recipe-book/recipes/<recipeId>/comments \
  -H "Authorization: Bearer <token>" \
  -H "X-Noroff-API-Key: <key>" \
  -H "Content-Type: application/json" \
  -d '{ "text": "Made this last night, it was amazing!" }'
```

### Response `201`

Returns the created comment object.
