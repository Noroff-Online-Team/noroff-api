# Pantry

Base path: `/recipe-book/pantry`

Pantry items are personal — each user manages their own pantry. All endpoints require authentication and are scoped to the current user.

## Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/recipe-book/pantry` | Yes | List current user's pantry items |
| POST | `/recipe-book/pantry` | Yes | Add a pantry item |
| PUT | `/recipe-book/pantry/:id` | Yes | Update a pantry item (owner only) |
| DELETE | `/recipe-book/pantry/:id` | Yes | Delete a pantry item (owner only) |

---

## Pantry Item Object

```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "name": "Chicken breast",
  "quantity": 2,
  "unit": "pieces",
  "category": "Protein",
  "owner": {
    "name": "jane_doe",
    "email": "jane@stud.noroff.no",
    ...
  },
  "created": "2026-03-12T08:00:00.000Z",
  "updated": "2026-03-12T08:00:00.000Z"
}
```

---

## GET `/recipe-book/pantry`

List the current user's pantry items. Supports pagination and sorting.

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
    { "id": "...", "name": "Chicken breast", "quantity": 2, "unit": "pieces", "category": "Protein", ... }
  ],
  "meta": { ... }
}
```

---

## POST `/recipe-book/pantry`

Add a new item to the user's pantry.

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | 1-100 characters |
| `quantity` | number | Yes | >= 0 |
| `unit` | string | Yes | Max 50 characters (e.g., `"kg"`, `"pieces"`, `"liters"`) |
| `category` | string | Yes | Max 50 characters (e.g., `"Produce"`, `"Dairy"`, `"Protein"`) |

### Example

```bash
curl -X POST /recipe-book/pantry \
  -H "Authorization: Bearer <token>" \
  -H "X-Noroff-API-Key: <key>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Chicken breast",
    "quantity": 2,
    "unit": "pieces",
    "category": "Protein"
  }'
```

### Response `201`

Returns the created pantry item object.

---

## PUT `/recipe-book/pantry/:id`

Update a pantry item. Only the owner can update. All fields are optional.

### Request Body

Same fields as POST, but all optional. Must provide at least one field.

### Example

```bash
curl -X PUT /recipe-book/pantry/<id> \
  -H "Authorization: Bearer <token>" \
  -H "X-Noroff-API-Key: <key>" \
  -H "Content-Type: application/json" \
  -d '{ "quantity": 5 }'
```

### Response `200`

Returns the updated pantry item object.

### Response `403`

Returned when a non-owner tries to update.

---

## DELETE `/recipe-book/pantry/:id`

Delete a pantry item. Only the owner can delete.

### Response `204`

No content returned on success.

### Response `403`

Returned when a non-owner tries to delete.

### Response `404`

Returned when no pantry item exists with the given ID.
