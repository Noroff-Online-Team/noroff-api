# Smart Recipe Book — Project Plan & Issue Breakdown

## Project Overview

**App:** Smart Recipe Book — Users save, edit, and organize recipes (CRUD), and an LLM can suggest substitutions, scale ingredients, or generate new recipes based on what's in your pantry.

**Tech stack:** React + Vite + TypeScript + Tailwind CSS
**Students:** Beginners (HTML/CSS/basic JS), groups of 3–8
**Timeline:** ~4 weeks full-time / ~8 weeks part-time
**Starter code provided:** Pre-configured Vite + TS + Tailwind + React Router
**Backend:** Provided (REST API for CRUD + auth + LLM wrapper endpoints)
**Completion model:** Not required to finish — work through as many tickets as possible

---

## Proposed API Design

### Authentication

Auth is provided and pre-configured. Students receive an auth context/provider in the starter code, but build the login/register UI themselves.

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Create new account | No |
| POST | `/api/auth/login` | Login, returns token | No |
| POST | `/api/auth/logout` | Invalidate session | Yes |
| GET | `/api/auth/me` | Get current user profile | Yes |

**User object:**
```json
{
  "id": "user_abc123",
  "email": "jane@example.com",
  "displayName": "Jane",
  "avatarUrl": null,
  "createdAt": "2025-06-01T12:00:00Z"
}
```

**Auth mechanism:** Bearer token in `Authorization` header. The starter code will include an `api` utility (e.g., a pre-configured fetch wrapper or axios instance) that automatically attaches the token.

---

### Recipes

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/recipes` | List recipes (paginated) | No |
| GET | `/api/recipes/:id` | Get single recipe | No |
| POST | `/api/recipes` | Create recipe | Yes |
| PUT | `/api/recipes/:id` | Update recipe (owner only) | Yes |
| DELETE | `/api/recipes/:id` | Delete recipe (owner only) | Yes |

**Query params for GET `/api/recipes`:**
- `search` — search by title (string)
- `category` — filter by category (string)
- `difficulty` — filter by difficulty (string)
- `page` — page number (default: 1)
- `limit` — items per page (default: 12)

**Recipe object:**
```json
{
  "id": "recipe_xyz789",
  "title": "Classic Margherita Pizza",
  "description": "A simple and delicious homemade pizza with fresh basil.",
  "imageUrl": "https://example.com/pizza.jpg",
  "prepTime": 20,
  "cookTime": 15,
  "servings": 4,
  "difficulty": "easy",
  "category": "dinner",
  "ingredients": [
    { "name": "pizza dough", "quantity": 1, "unit": "ball" },
    { "name": "tomato sauce", "quantity": 0.5, "unit": "cup" },
    { "name": "fresh mozzarella", "quantity": 200, "unit": "g" },
    { "name": "fresh basil", "quantity": 6, "unit": "leaves" }
  ],
  "instructions": [
    "Preheat oven to 250°C (480°F).",
    "Roll out the pizza dough on a floured surface.",
    "Spread tomato sauce evenly over the dough.",
    "Tear mozzarella into pieces and distribute over sauce.",
    "Bake for 12-15 minutes until crust is golden.",
    "Top with fresh basil leaves and serve immediately."
  ],
  "tags": ["italian", "vegetarian", "quick"],
  "author": {
    "id": "user_abc123",
    "displayName": "Jane"
  },
  "createdAt": "2025-06-15T10:30:00Z",
  "updatedAt": "2025-06-15T10:30:00Z"
}
```

**Allowed `category` values:** `"breakfast"`, `"lunch"`, `"dinner"`, `"dessert"`, `"snack"`, `"drink"`
**Allowed `difficulty` values:** `"easy"`, `"medium"`, `"hard"`

**Create/Update request body** (same shape, minus `id`, `author`, timestamps):
```json
{
  "title": "Classic Margherita Pizza",
  "description": "A simple and delicious homemade pizza.",
  "imageUrl": "https://example.com/pizza.jpg",
  "prepTime": 20,
  "cookTime": 15,
  "servings": 4,
  "difficulty": "easy",
  "category": "dinner",
  "ingredients": [
    { "name": "pizza dough", "quantity": 1, "unit": "ball" }
  ],
  "instructions": [
    "Preheat oven to 250°C."
  ],
  "tags": ["italian", "vegetarian"]
}
```

---

### Pantry

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/pantry` | Get current user's pantry items | Yes |
| POST | `/api/pantry` | Add item to pantry | Yes |
| PUT | `/api/pantry/:id` | Update pantry item | Yes |
| DELETE | `/api/pantry/:id` | Remove item from pantry | Yes |

**Pantry item object:**
```json
{
  "id": "pantry_001",
  "name": "chicken breast",
  "quantity": 2,
  "unit": "pieces",
  "category": "protein",
  "userId": "user_abc123",
  "createdAt": "2025-06-20T08:00:00Z",
  "updatedAt": "2025-06-20T08:00:00Z"
}
```

**Allowed `category` values:** `"produce"`, `"dairy"`, `"protein"`, `"grain"`, `"spice"`, `"condiment"`, `"frozen"`, `"other"`

---

### Favorites

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/favorites` | Get current user's favorited recipes | Yes |
| POST | `/api/favorites` | Add a recipe to favorites | Yes |
| DELETE | `/api/favorites/:recipeId` | Remove a recipe from favorites | Yes |

**POST request body:**
```json
{ "recipeId": "recipe_xyz789" }
```

**GET response:** Returns an array of full recipe objects (not just IDs), so students don't need to do secondary fetches.

---

### Comments

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/recipes/:recipeId/comments` | Get comments for a recipe | No |
| POST | `/api/recipes/:recipeId/comments` | Add comment to recipe | Yes |
| PUT | `/api/comments/:id` | Edit own comment | Yes |
| DELETE | `/api/comments/:id` | Delete own comment | Yes |

**Comment object:**
```json
{
  "id": "comment_001",
  "recipeId": "recipe_xyz789",
  "author": {
    "id": "user_abc123",
    "displayName": "Jane"
  },
  "text": "Made this last night — amazing! I added a pinch of chili flakes.",
  "createdAt": "2025-06-16T18:45:00Z",
  "updatedAt": "2025-06-16T18:45:00Z"
}
```

---

### Meal Plans

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/meal-plans` | Get user's meal plan entries | Yes |
| POST | `/api/meal-plans` | Add recipe to meal plan | Yes |
| DELETE | `/api/meal-plans/:id` | Remove entry from meal plan | Yes |

**Query params for GET:**
- `startDate` — start of range, ISO date string (e.g., `2025-06-16`)
- `endDate` — end of range, ISO date string (e.g., `2025-06-22`)

**Meal plan entry object:**
```json
{
  "id": "mp_001",
  "recipe": {
    "id": "recipe_xyz789",
    "title": "Classic Margherita Pizza",
    "imageUrl": "https://example.com/pizza.jpg"
  },
  "date": "2025-06-18",
  "mealType": "dinner",
  "userId": "user_abc123",
  "createdAt": "2025-06-16T09:00:00Z"
}
```

**Allowed `mealType` values:** `"breakfast"`, `"lunch"`, `"dinner"`, `"snack"`

**POST request body:**
```json
{
  "recipeId": "recipe_xyz789",
  "date": "2025-06-18",
  "mealType": "dinner"
}
```

---

### AI / LLM Endpoints

These are backend-wrapped — students just POST to them and receive structured responses. No API keys needed on the front end.

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/ai/substitutions` | Get ingredient substitution ideas | Yes |
| POST | `/api/ai/scale` | Scale recipe ingredients | Yes |
| POST | `/api/ai/generate` | Generate recipe from pantry/preferences | Yes |

**POST `/api/ai/substitutions`**
```json
// Request
{
  "recipeId": "recipe_xyz789",
  "ingredientName": "fresh mozzarella",
  "dietaryPreference": "vegan"  // optional
}

// Response
{
  "ingredient": "fresh mozzarella",
  "substitutions": [
    {
      "name": "cashew mozzarella",
      "notes": "Blend soaked cashews with nutritional yeast and tapioca starch for a stretchy, melty texture.",
      "ratio": "1:1"
    },
    {
      "name": "silken tofu slices",
      "notes": "Press firmly and slice thin. Won't melt the same but adds creaminess.",
      "ratio": "200g tofu for 200g mozzarella"
    }
  ]
}
```

**POST `/api/ai/scale`**
```json
// Request
{
  "recipeId": "recipe_xyz789",
  "targetServings": 8
}

// Response
{
  "originalServings": 4,
  "targetServings": 8,
  "scaledIngredients": [
    { "name": "pizza dough", "quantity": 2, "unit": "ball" },
    { "name": "tomato sauce", "quantity": 1, "unit": "cup" },
    { "name": "fresh mozzarella", "quantity": 400, "unit": "g" },
    { "name": "fresh basil", "quantity": 12, "unit": "leaves" }
  ],
  "tips": "Consider making two separate pizzas rather than one large one for more even cooking."
}
```

**POST `/api/ai/generate`**
```json
// Request
{
  "pantryItemIds": ["pantry_001", "pantry_002", "pantry_003"],
  "preferences": "Something quick and healthy",  // optional free text
  "category": "dinner"  // optional
}

// Response
{
  "recipe": {
    "title": "Lemon Herb Chicken with Rice",
    "description": "A quick, healthy dinner using what you have on hand.",
    "prepTime": 10,
    "cookTime": 25,
    "servings": 2,
    "difficulty": "easy",
    "category": "dinner",
    "ingredients": [
      { "name": "chicken breast", "quantity": 2, "unit": "pieces", "inPantry": true },
      { "name": "rice", "quantity": 1, "unit": "cup", "inPantry": true },
      { "name": "lemon", "quantity": 1, "unit": "whole", "inPantry": true },
      { "name": "olive oil", "quantity": 2, "unit": "tbsp", "inPantry": false },
      { "name": "garlic", "quantity": 2, "unit": "cloves", "inPantry": false }
    ],
    "instructions": [
      "Season chicken with lemon juice, salt, and pepper.",
      "Cook rice according to package directions.",
      "Heat olive oil in a skillet over medium-high heat.",
      "Cook chicken 6-7 minutes per side until golden and cooked through.",
      "Slice chicken and serve over rice with lemon wedges."
    ],
    "tags": ["quick", "healthy", "high-protein"]
  }
}
```

Note: The `inPantry` boolean in the generated recipe helps the UI highlight which ingredients the user already has vs. what they'd need to buy.

---

### Error Responses

All endpoints return consistent error shapes:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Title is required",
    "details": {
      "field": "title"
    }
  }
}
```

**Common HTTP status codes:**
- `400` — Validation error (missing/invalid fields)
- `401` — Not authenticated
- `403` — Not authorized (e.g., editing someone else's recipe)
- `404` — Resource not found
- `500` — Server error

---

## Issue Breakdown by Tier

Issues are ordered so that earlier tickets teach foundational React concepts and later tickets build on those patterns. Each issue is a vertical slice — when done, something new is visible or usable in the app.

### Tier 1: App Shell & Read-Only Features

These issues build the browseable, read-only version of the app. They teach: component composition, props, `useState`, `useEffect`, data fetching, conditional rendering, and React Router navigation.

| # | Issue Title | Description | Depends On | Key Concepts |
|---|-------------|-------------|------------|--------------|
| 1 | **App layout shell** | Build the persistent layout: header with app name/logo and navigation links (Home, My Recipes, Pantry, Meal Plan, Favorites), a main content area where routed pages render, and a footer. Include a placeholder "Log In" button in the header. | — | Components, props, JSX, Tailwind basics |
| 2 | **Recipe card component** | Create a reusable `RecipeCard` component that displays a recipe's image, title, category badge, difficulty, prep+cook time, and author name. Use hardcoded sample data to develop it initially. | 1 | Props, TypeScript interfaces, component reuse |
| 3 | **Recipe list page** | Build the home/browse page that fetches recipes from `GET /api/recipes` and displays them in a responsive grid of `RecipeCard` components. Show a loading state while fetching and an empty state if no recipes exist. | 2 | useEffect, fetch, loading/error states, mapping arrays |
| 4 | **Recipe detail page** | Build a full-view page for a single recipe. Fetch from `GET /api/recipes/:id` using the route param. Display all recipe data: image, title, description, metadata (times, servings, difficulty), ingredients list, numbered instructions, and tags. | 1 | Route params (useParams), single-resource fetch |
| 5 | **Search bar** | Add a search input to the recipe list page. When the user types, filter the displayed recipes by title. Start with client-side filtering of already-fetched recipes. Debounce the input so it doesn't filter on every keystroke. | 3 | Controlled inputs, useState, filtering arrays, debounce |
| 6 | **Category & difficulty filters** | Add filter controls (buttons, pills, or dropdowns) to the recipe list page that let users filter by category and difficulty. These should work alongside the search bar. Active filters should be visually distinct. | 3 | State management, combining filters, UI feedback |
| 7 | **Login page** | Build a login form with email and password fields. On submit, POST to `/api/auth/login`. On success, store the token (the auth context/provider handles this — students just call the provided `login()` function) and redirect to the home page. Show validation errors from the API. | 1 | Form handling, controlled inputs, async submit, error display |
| 8 | **Register page** | Build a registration form with display name, email, password, and confirm password fields. Validate that passwords match before submitting. POST to `/api/auth/register`. On success, automatically log the user in and redirect. | 7 | Form validation, matching fields, reusing patterns from login |
| 9 | **Auth-aware header** | Update the header to be auth-aware: show the user's display name and a "Log Out" button when logged in, or "Log In" / "Register" links when logged out. Use the provided auth context to access user state. | 7 | Context consumption (useContext), conditional rendering |

---

### Tier 2: Recipe CRUD (Write Operations)

These issues add the ability to create, edit, and delete recipes. They teach: complex form state, multi-field forms, dynamic list inputs, PUT/POST/DELETE requests, and optimistic UI patterns.

| # | Issue Title | Description | Depends On | Key Concepts |
|---|-------------|-------------|------------|--------------|
| 10 | **Create recipe form — basic fields** | Build a form page for creating a new recipe. Include inputs for: title, description, image URL, prep time, cook time, servings, difficulty (dropdown), and category (dropdown). On submit, POST to `/api/recipes`. Redirect to the new recipe's detail page on success. This issue does NOT include ingredients or instructions yet. | 4, 9 | Complex forms, multiple input types, POST requests, redirects |
| 11 | **Create recipe form — ingredients** | Extend the create recipe form with a dynamic ingredients section. Users can add multiple ingredients, each with name, quantity, and unit fields. Include "Add ingredient" and "Remove" buttons. Ingredients should be submitted as part of the recipe payload. | 10 | Dynamic form fields, array state, adding/removing items |
| 12 | **Create recipe form — instructions & tags** | Extend the create recipe form with: an ordered instructions section (users add steps one at a time, can reorder or remove them) and a tags input (free-text, comma-separated or add-on-enter). This completes the create form. | 11 | Ordered lists in state, reordering arrays, tag input patterns |
| 13 | **Edit recipe page** | Build an edit page that pre-populates the create recipe form with existing data fetched from `GET /api/recipes/:id`. On submit, PUT to `/api/recipes/:id`. Only the recipe author should be able to access this page — redirect others away. Add an "Edit" button on the recipe detail page (visible only to the author). | 12 | Pre-populating forms, PUT requests, authorization checks |
| 14 | **Delete recipe** | Add a "Delete" button on the recipe detail page (visible only to the author). When clicked, show a confirmation dialog/modal. On confirm, DELETE to `/api/recipes/:id` and redirect to the recipe list. | 4, 9 | DELETE requests, confirmation UX, modal/dialog patterns |
| 15 | **"My Recipes" page** | Build a page that shows only recipes created by the currently logged-in user. Reuse the `RecipeCard` grid. If the user has no recipes, show a friendly empty state with a link to create one. | 3, 9 | Filtered API calls, empty states, component reuse |

---

### Tier 3: Pantry Management

These issues introduce a second CRUD domain. They reinforce all the patterns from Tier 2 but with simpler data, giving students a chance to practice independently.

| # | Issue Title | Description | Depends On | Key Concepts |
|---|-------------|-------------|------------|--------------|
| 16 | **Pantry list page** | Build a page that fetches and displays the logged-in user's pantry items from `GET /api/pantry`. Group items by category (produce, dairy, protein, etc.). Show a count of total items. Include an empty state for new users. | 9 | Grouping data, organized display, category sections |
| 17 | **Add pantry item** | Add an "Add Item" form/modal on the pantry page. Fields: item name, quantity, unit, and category (dropdown). POST to `/api/pantry`. The new item should appear in the list without a full page refresh. | 16 | Form in modal/inline, optimistic updates, state refresh |
| 18 | **Edit & delete pantry items** | Add edit (inline or modal) and delete functionality for each pantry item. Edit: PUT to `/api/pantry/:id`. Delete: DELETE to `/api/pantry/:id` with confirmation. | 17 | Inline editing patterns, PUT/DELETE, confirmation |

---

### Tier 4: Social Features

These issues add the community layer. They teach: toggle interactions, relational data, and user-specific UI states.

| # | Issue Title | Description | Depends On | Key Concepts |
|---|-------------|-------------|------------|--------------|
| 19 | **Favorite/unfavorite toggle** | Add a heart/bookmark icon button on each `RecipeCard` and on the recipe detail page. Clicking toggles favorite status: POST to add, DELETE to remove. The icon should be filled/active when favorited. Requires checking the user's favorites on load. | 4, 9 | Toggle state, POST/DELETE based on state, icon feedback |
| 20 | **Favorites page** | Build a page that fetches and displays the user's favorited recipes from `GET /api/favorites`. Reuse the `RecipeCard` grid. Show a message when the user hasn't favorited anything yet with a link to browse recipes. | 19 | Reusing components with different data sources |
| 21 | **Comments section — display** | Add a comments section to the recipe detail page. Fetch comments from `GET /api/recipes/:recipeId/comments` and display each with the author name, text, and relative timestamp (e.g., "2 hours ago"). Show the count of comments. | 4 | Nested data fetching, date formatting, comment display |
| 22 | **Comments — add, edit, delete** | Add a comment form below the comments list (logged-in users only). POST to add. Show edit/delete controls on the user's own comments. Edit replaces the comment text inline. Delete removes with confirmation. | 21, 9 | CRUD within a section, ownership-based UI |

---

### Tier 5: Meal Planning

These issues introduce date-based UI and a planning workflow. They're more complex and open-ended.

| # | Issue Title | Description | Depends On | Key Concepts |
|---|-------------|-------------|------------|--------------|
| 23 | **Meal plan weekly view** | Build a meal plan page showing a 7-day grid/calendar. Each day has slots for breakfast, lunch, dinner, and snack. Fetch entries from `GET /api/meal-plans` with the current week's date range. Show recipe titles and images in filled slots, and "+" buttons in empty slots. Include navigation to go to previous/next week. | 9 | Date handling, grid layouts, weekly navigation |
| 24 | **Add recipe to meal plan** | When the user clicks a "+" slot or an "Add to Meal Plan" button on a recipe detail page, show a modal/form to pick the date and meal type. POST to `/api/meal-plans`. The meal plan view should update to show the new entry. | 23, 4 | Modal forms, date selection, cross-page interaction |
| 25 | **Remove from meal plan** | Add the ability to remove a recipe from a meal plan slot. Show a remove/X button on each filled slot. DELETE to `/api/meal-plans/:id`. | 24 | DELETE in context, updating grid state |
| 26 | **Meal plan shopping list** | Add a "Generate Shopping List" button to the meal plan page. When clicked, aggregate all ingredients from recipes in the current week's plan (client-side). Display them grouped by category with combined quantities where possible (e.g., two recipes needing "chicken breast" should show the total). | 23 | Data aggregation, grouping, computed display |

---

### Tier 6: LLM-Powered Features

These issues connect to the AI backend endpoints. They teach: async UX for slow operations, presenting AI-generated content, and building interactive AI features.

| # | Issue Title | Description | Depends On | Key Concepts |
|---|-------------|-------------|------------|--------------|
| 27 | **Ingredient substitution suggestions** | On the recipe detail page, add a small button/icon next to each ingredient. When clicked, POST to `/api/ai/substitutions` with the recipe ID and ingredient name. Display the AI suggestions in a popover, tooltip, or expandable section. Include a loading state since AI responses take a moment. Optionally allow the user to select a dietary preference before requesting. | 4, 9 | Async UX, loading states for slow operations, popover/tooltip |
| 28 | **Recipe scaling** | On the recipe detail page, add a servings adjuster (number input or +/- buttons) near the servings display. When the user changes the target servings, POST to `/api/ai/scale`. Replace the displayed ingredients with the scaled versions. Show a loading indicator during the request. Include the AI's cooking tips if provided. | 4, 9 | Dynamic updates, number input, replacing displayed data |
| 29 | **Generate recipe from pantry** | On the pantry page, add a "Generate Recipe" button/section. The user can select which pantry items to use (checkboxes), optionally type preferences (e.g., "quick and healthy"), and optionally pick a category. POST to `/api/ai/generate`. Display the generated recipe in a preview. Include a "Save to My Recipes" button that POSTs the generated recipe to `/api/recipes`. | 16, 10 | Multi-step flow, checkbox selection, preview before save |
| 30 | **AI recipe generation from browse** | Add a "Surprise Me" or "AI Generate" button accessible from the main recipe list page. Opens a simple form where the user can describe what they want in plain text. POST to `/api/ai/generate` (without pantry items). Display the result and allow saving. | 10 | Simple AI interaction, free-text input, save flow |

---

## Dependency Graph (Visual Summary)

```
Tier 1 (Foundation)
  1 → 2 → 3 → 5, 6
  1 → 4
  1 → 7 → 8
  7 → 9

Tier 2 (Recipe CRUD)
  4 + 9 → 10 → 11 → 12 → 13
  4 + 9 → 14
  3 + 9 → 15

Tier 3 (Pantry)
  9 → 16 → 17 → 18

Tier 4 (Social)
  4 + 9 → 19 → 20
  4 → 21 → (21 + 9) → 22

Tier 5 (Meal Planning)
  9 → 23 → 24 → 25
  23 → 26

Tier 6 (AI Features)
  4 + 9 → 27, 28
  16 + 10 → 29
  10 → 30
```

---

## Suggested Group Workflows

**Group of 3** — Each person owns ~10 issues. Suggested split:
- Person A: Issues 1, 2, 3, 5, 6, 15, 16, 17, 18
- Person B: Issues 7, 8, 9, 10, 11, 12, 13, 14
- Person C: Issues 4, 19, 20, 21, 22, 23, 24, 25

AI features (27-30) are tackled by whoever finishes their track first.

**Group of 6+** — Issues can be split more granularly. Multiple people can work in parallel across tiers once the Tier 1 skeleton is in place (e.g., one person on pantry, one on favorites, one on comments simultaneously).

---

## Notes for Issue Creation

Each GitHub issue should include:
1. **Title** — Clear and action-oriented (e.g., "Build recipe card component")
2. **Description** — What the feature is and why it matters to the user
3. **Acceptance criteria** — 3–6 bullet points describing what "done" looks like
4. **API reference** — Which endpoint(s) to call, with example request/response
5. **Hints** — 2–3 pointers on approach (e.g., "You'll want to use `useEffect` to fetch data when the component mounts") without being step-by-step
6. **Design notes** — Rough layout guidance (e.g., "responsive grid, 1 column on mobile, 3 on desktop") but no pixel-perfect designs
7. **Labels** — Tier label (tier-1, tier-2, etc.), feature area (recipes, pantry, social, meal-plan, ai), and estimated complexity (small, medium, large)
8. **Blocked by** — Reference to dependency issues