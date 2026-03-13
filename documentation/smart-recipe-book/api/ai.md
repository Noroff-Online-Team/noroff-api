# AI Endpoints

Base path: `/recipe-book/ai`

These endpoints provide AI-powered recipe features. All require authentication. The responses are **mock/algorithmic** — no real LLM is used. Students POST to them and receive structured responses.

## Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/recipe-book/ai/substitutions` | Yes | Get ingredient substitution suggestions |
| POST | `/recipe-book/ai/scale` | Yes | Scale recipe ingredients |
| POST | `/recipe-book/ai/generate` | Yes | Generate a recipe from a text prompt |

---

## POST `/recipe-book/ai/substitutions`

Get substitution suggestions for an ingredient. The API has a built-in map of common ingredients (butter, eggs, milk, flour, sugar, cream, garlic, onion, etc.). For unknown ingredients, generic suggestions are returned.

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `ingredient` | string | Yes | The ingredient name (e.g., `"butter"`, `"eggs"`, `"milk"`) |

### Example

```bash
curl -X POST /recipe-book/ai/substitutions \
  -H "Authorization: Bearer <token>" \
  -H "X-Noroff-API-Key: <key>" \
  -H "Content-Type: application/json" \
  -d '{ "ingredient": "butter" }'
```

### Response `200`

```json
{
  "data": {
    "ingredient": "butter",
    "substitutions": [
      {
        "name": "Coconut oil",
        "ratio": "1:1",
        "notes": "Works well in baking"
      },
      {
        "name": "Olive oil",
        "ratio": "3/4 cup per 1 cup butter",
        "notes": "Best for savory dishes"
      },
      {
        "name": "Applesauce",
        "ratio": "1:1",
        "notes": "Reduces fat, adds moisture"
      }
    ]
  },
  "meta": {}
}
```

### Supported Ingredients

The following ingredients have curated substitutions: `butter`, `egg`, `milk`, `flour`, `sugar`, `sour cream`, `cream`, `heavy cream`, `soy sauce`, `bread crumbs`, `garlic`, `onion`, `vegetable oil`, `baking powder`, `cornstarch`.

Any other ingredient returns generic fallback suggestions.

---

## POST `/recipe-book/ai/scale`

Scale recipe ingredients by a target serving size. This uses real math — each ingredient quantity is multiplied by the scale factor.

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `ingredients` | array | Yes | Array of ingredient objects `{ name, quantity, unit }` |
| `originalServings` | integer | Yes | The recipe's original serving count (>= 1) |
| `targetServings` | integer | Yes | The desired serving count (>= 1) |

### Example

```bash
curl -X POST /recipe-book/ai/scale \
  -H "Authorization: Bearer <token>" \
  -H "X-Noroff-API-Key: <key>" \
  -H "Content-Type: application/json" \
  -d '{
    "ingredients": [
      { "name": "Flour", "quantity": 200, "unit": "g" },
      { "name": "Sugar", "quantity": 100, "unit": "g" },
      { "name": "Butter", "quantity": 50, "unit": "g" }
    ],
    "originalServings": 4,
    "targetServings": 8
  }'
```

### Response `200`

```json
{
  "data": {
    "originalServings": 4,
    "targetServings": 8,
    "scaleFactor": 2,
    "scaledIngredients": [
      { "name": "Flour", "originalQuantity": 200, "scaledQuantity": 400, "unit": "g" },
      { "name": "Sugar", "originalQuantity": 100, "scaledQuantity": 200, "unit": "g" },
      { "name": "Butter", "originalQuantity": 50, "scaledQuantity": 100, "unit": "g" }
    ],
    "tips": [
      "When scaling up significantly, cooking times may need to be adjusted.",
      "Consider using a larger pan or cooking in batches.",
      "Seasoning may need fine-tuning — taste and adjust as needed."
    ]
  },
  "meta": {}
}
```

### Tips Logic

- Scaling up (>2x): tips about adjusting cooking times and using larger pans
- Scaling down (<0.5x): tips about faster cooking
- Any scaling: tip about adjusting seasoning

---

## POST `/recipe-book/ai/generate`

Generate a mock recipe from a text prompt. The generated recipe incorporates the user's prompt in the title and description but uses static template data for ingredients and instructions.

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `prompt` | string | Yes | 1-500 characters describing the desired recipe |

### Example

```bash
curl -X POST /recipe-book/ai/generate \
  -H "Authorization: Bearer <token>" \
  -H "X-Noroff-API-Key: <key>" \
  -H "Content-Type: application/json" \
  -d '{ "prompt": "healthy chicken dinner" }'
```

### Response `200`

```json
{
  "data": {
    "title": "AI-Generated: healthy chicken dinner",
    "description": "A delicious recipe inspired by: \"healthy chicken dinner\". This recipe was generated based on your request and features a balanced combination of flavors and textures.",
    "prepTime": 15,
    "cookTime": 30,
    "servings": 4,
    "difficulty": "Medium",
    "category": "AI Generated",
    "ingredients": [
      { "name": "Main protein or base ingredient", "quantity": 500, "unit": "g" },
      { "name": "Olive oil", "quantity": 2, "unit": "tbsp" },
      { "name": "Garlic cloves", "quantity": 3, "unit": "pieces" },
      { "name": "Onion", "quantity": 1, "unit": "medium" },
      { "name": "Salt", "quantity": 1, "unit": "tsp" },
      { "name": "Black pepper", "quantity": 0.5, "unit": "tsp" },
      { "name": "Fresh herbs", "quantity": 2, "unit": "tbsp" },
      { "name": "Lemon juice", "quantity": 1, "unit": "tbsp" }
    ],
    "instructions": [
      "Prepare all ingredients by washing, peeling, and chopping as needed.",
      "Heat olive oil in a large pan over medium heat.",
      "Saute garlic and onion until fragrant, about 2-3 minutes.",
      "Add the main ingredient and cook until properly done.",
      "Season with salt, pepper, and fresh herbs.",
      "Finish with a squeeze of lemon juice.",
      "Let rest for 5 minutes before serving.",
      "Plate and garnish with additional fresh herbs."
    ],
    "tags": ["ai-generated", "quick-meal"]
  },
  "meta": {}
}
```

### Note

The generated recipe is **not saved automatically**. To save it, the frontend should POST the generated data to `POST /recipe-book/recipes`.
