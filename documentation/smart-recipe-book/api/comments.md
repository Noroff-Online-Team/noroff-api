# Comments

Base path: `/recipe-book/comments`

This module handles editing and deleting comments. Creating comments and listing comments for a recipe is done through the [Recipes](./recipes.md) endpoints:

- `GET /recipe-book/recipes/:recipeId/comments` — List comments
- `POST /recipe-book/recipes/:recipeId/comments` — Create a comment

## Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| PUT | `/recipe-book/comments/:id` | Yes | Edit own comment |
| DELETE | `/recipe-book/comments/:id` | Yes | Delete own comment |

---

## Comment Object

```json
{
  "id": "comment-uuid",
  "text": "Made this last night, it was amazing!",
  "recipeId": "recipe-uuid",
  "author": {
    "name": "john_doe",
    "email": "john@stud.noroff.no",
    ...
  },
  "created": "2026-03-12T14:00:00.000Z",
  "updated": "2026-03-12T14:00:00.000Z"
}
```

---

## PUT `/recipe-book/comments/:id`

Edit a comment. Only the comment author can edit.

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `text` | string | Yes | 1-280 characters |

### Example

```bash
curl -X PUT /recipe-book/comments/<id> \
  -H "Authorization: Bearer <token>" \
  -H "X-Noroff-API-Key: <key>" \
  -H "Content-Type: application/json" \
  -d '{ "text": "Updated: this was even better the second time!" }'
```

### Response `200`

Returns the updated comment object.

### Response `403`

Returned when a non-author tries to edit.

### Response `404`

Returned when no comment exists with the given ID.

---

## DELETE `/recipe-book/comments/:id`

Delete a comment. Only the comment author can delete.

### Response `204`

No content returned on success.

### Response `403`

Returned when a non-author tries to delete.

### Response `404`

Returned when no comment exists with the given ID.
