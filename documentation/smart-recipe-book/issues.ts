type Tier = "tier-1" | "tier-2" | "tier-3" | "tier-4" | "tier-5" | "tier-6"
type FeatureArea =
  | "app-shell"
  | "recipes"
  | "auth"
  | "pantry"
  | "social"
  | "meal-plan"
  | "ai"
  | "ux"
type Complexity = "small" | "medium" | "large"

interface Issue {
  /** The issue number from the project plan (1-39). Used for ordering and cross-referencing dependencies, NOT used as the GitHub issue number. */
  id: number
  /** Clear, action-oriented title. e.g. "Build recipe card component" */
  title: string
  /** 2-4 sentence description of what the feature is, why it matters to the user, and what the student will build. Write from the perspective of explaining the task to a beginner developer. */
  description: string
  /** 4-6 bullet points describing what "done" looks like. Each should be a concrete, testable statement. */
  acceptanceCriteria: string[]
  /**
   * Relevant API endpoint details. Include method, path, and a brief note on request/response shape.
   * Reference the exact endpoint paths from PROJECT_DETAILS.md.
   * Set to null for issues that don't involve API calls (e.g., layout shell, image fallback, mobile nav).
   */
  apiReference: string | null
  /** 2-3 short hints on approach. Guide students toward the right tools/patterns without giving step-by-step solutions. Mention specific React hooks, Tailwind utilities, or patterns where relevant. */
  hints: string[]
  /** 1-2 sentences of rough layout/UI guidance. Describe responsive behavior, general placement, and visual style without pixel-perfect specs. */
  designNotes: string
  /** Tier label */
  tier: Tier
  /** Primary feature area */
  featureArea: FeatureArea
  /** Estimated complexity */
  complexity: Complexity
  /** Array of issue IDs (from the `id` field) that must be completed before this issue can be started. Empty array if no dependencies. */
  dependsOn: number[]
  /** Key React/web concepts this issue teaches. 2-5 items. */
  keyConcepts: string[]
}

export const issues = [
  {
    id: 1,
    title: "Build app layout shell",
    description:
      "Every app needs a consistent frame around its pages. You will build the persistent layout that wraps the entire application: a header with the app name/logo and navigation links (Home, My Recipes, Pantry, Meal Plan, Favorites), a main content area where React Router renders each page, and a simple footer. Include a placeholder 'Log In' button in the header that doesn't do anything yet.",
    acceptanceCriteria: [
      "The header displays the app name/logo and navigation links for Home, My Recipes, Pantry, Meal Plan, and Favorites.",
      "A placeholder 'Log In' button is visible in the header.",
      "Clicking a navigation link changes the URL and renders the corresponding page in the main content area.",
      "The footer is visible at the bottom of every page.",
      "The layout persists across route changes without remounting."
    ],
    apiReference: null,
    hints: [
      "Use React Router's `<Outlet />` component inside your layout to render child routes in the main content area.",
      "Tailwind's `flex`, `min-h-screen`, and `flex-col` utilities make it easy to build a sticky-footer layout where the main content stretches to fill available space.",
      "Use `<NavLink>` instead of `<Link>` so you can style the active navigation item differently."
    ],
    designNotes:
      "The header should be a horizontal bar at the top with the app name on the left and navigation links on the right. The footer stays at the bottom of the viewport (or below content if content is taller). Use a max-width container for the main content area to keep it readable on large screens.",
    tier: "tier-1",
    featureArea: "app-shell",
    complexity: "small",
    dependsOn: [],
    keyConcepts: ["Components", "props", "JSX", "Tailwind basics"]
  },
  {
    id: 2,
    title: "Create recipe card component",
    description:
      "Recipe cards are the primary way users browse recipes throughout the app. You will build a reusable `RecipeCard` component that displays a recipe's image, title, category badge, difficulty level, combined prep+cook time, and author name. Start by developing it with hardcoded sample data so you can focus on the layout and styling before connecting it to real data.",
    acceptanceCriteria: [
      "The RecipeCard displays the recipe image, title, category badge, difficulty, total time (prep + cook), and author name.",
      "The card has a consistent, visually appealing design with rounded corners and subtle shadow.",
      "The component accepts a recipe object as a prop and renders its data dynamically.",
      "The card is clickable and navigates to the recipe detail page.",
      "The card renders correctly with varying title lengths and missing optional fields."
    ],
    apiReference: null,
    hints: [
      "Define a TypeScript interface for the recipe prop based on the recipe object shape from the API. This will help you catch errors early.",
      "Use Tailwind's `rounded-lg`, `shadow-md`, and `overflow-hidden` to give the card a polished look.",
      "Use `<Link>` from React Router to make the entire card clickable and navigate to `/recipes/:id`."
    ],
    designNotes:
      "The card should be a vertical stack: image on top, then title, then a row of metadata (category badge, difficulty, time). Keep the card a fixed width that adapts to its grid container. The image should have a consistent aspect ratio (e.g., 16:9).",
    tier: "tier-1",
    featureArea: "recipes",
    complexity: "small",
    dependsOn: [1],
    keyConcepts: ["Props", "TypeScript interfaces", "component reuse"]
  },
  {
    id: 3,
    title: "Build recipe list page",
    description:
      "The recipe list is the home page of the app and the first thing users see. You will build a page that fetches recipes from the API and displays them in a responsive grid of RecipeCard components. This is the first time you'll fetch real data from the backend, so you'll also need to handle loading and empty states gracefully.",
    acceptanceCriteria: [
      "The page fetches recipes from `GET /api/recipes` on mount and displays them in a responsive grid.",
      "A loading indicator (spinner or skeleton) is shown while the data is being fetched.",
      "An empty state message is displayed if no recipes exist.",
      "An error message is shown if the API request fails.",
      "The grid is responsive: 1 column on mobile, 2 on tablet, 3 on desktop."
    ],
    apiReference:
      "GET /api/recipes - Returns a paginated list of recipe objects. Supports query params: search (string), category (string), difficulty (string), page (number, default 1), limit (number, default 12). Response includes an array of recipe objects with id, title, description, imageUrl, prepTime, cookTime, servings, difficulty, category, ingredients, instructions, tags, and author.",
    hints: [
      "Use `useEffect` with an empty dependency array to fetch data when the component first mounts. Store the result in state with `useState`.",
      "Tailwind's responsive grid is straightforward: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`.",
      "Handle three states in your component: loading (show spinner), error (show error message), and success (show grid or empty state)."
    ],
    designNotes:
      "The page should have a heading at the top, then the recipe grid below. On mobile the cards stack in a single column; on tablets they form 2 columns; on desktop 3 columns. Add some horizontal padding and a max-width container so the grid doesn't stretch too wide.",
    tier: "tier-1",
    featureArea: "recipes",
    complexity: "medium",
    dependsOn: [2],
    keyConcepts: [
      "useEffect",
      "fetch",
      "loading/error states",
      "mapping arrays"
    ]
  },
  {
    id: 4,
    title: "Build recipe detail page",
    description:
      "When a user clicks on a recipe card, they need to see all the details about that recipe. You will build a full-view page that fetches a single recipe from the API using the recipe ID from the URL. The page displays everything: the image, title, description, metadata (prep time, cook time, servings, difficulty), a list of ingredients, numbered step-by-step instructions, and tags.",
    acceptanceCriteria: [
      "The page reads the recipe ID from the URL using route params and fetches data from `GET /api/recipes/:id`.",
      "All recipe fields are displayed: image, title, description, prep time, cook time, servings, difficulty, category, ingredients, instructions, and tags.",
      "A loading state is shown while the recipe is being fetched.",
      "A user-friendly error or 404 message is shown if the recipe doesn't exist.",
      "Ingredients are displayed as a list and instructions are displayed as numbered steps."
    ],
    apiReference:
      "GET /api/recipes/:id - Returns a single recipe object with all fields: id, title, description, imageUrl, prepTime, cookTime, servings, difficulty, category, ingredients (array of {name, quantity, unit}), instructions (array of strings), tags (array of strings), author ({id, displayName}), createdAt, updatedAt.",
    hints: [
      "Use `useParams()` from React Router to extract the recipe ID from the URL (e.g., `/recipes/:id`).",
      "Use `useEffect` with the recipe ID as a dependency so the data re-fetches if the user navigates to a different recipe.",
      "Use `ol` with Tailwind's `list-decimal` class for numbered instructions, and `ul` with `list-disc` for ingredients."
    ],
    designNotes:
      "Use a single-column layout for the detail page. The image should be prominent at the top (full-width or large), followed by the title and metadata in a row, then ingredients and instructions side by side on desktop (stacked on mobile). Tags can be displayed as small pill badges below the instructions.",
    tier: "tier-1",
    featureArea: "recipes",
    complexity: "medium",
    dependsOn: [1],
    keyConcepts: ["Route params (useParams)", "single-resource fetch"]
  },
  {
    id: 5,
    title: "Add search bar to recipe list",
    description:
      "Users need a way to quickly find recipes by name. You will add a search input to the recipe list page that filters the displayed recipes by title as the user types. Start with client-side filtering of the already-fetched recipes. You should debounce the input so the filtering doesn't run on every single keystroke, which would feel janky with large lists.",
    acceptanceCriteria: [
      "A search input is visible at the top of the recipe list page.",
      "Typing in the search input filters the displayed recipes by title (case-insensitive).",
      "The filtering is debounced so it doesn't trigger on every keystroke.",
      "Clearing the search input shows all recipes again.",
      "If no recipes match the search, an appropriate 'no results' message is shown."
    ],
    apiReference: null,
    hints: [
      "Use `useState` for both the raw input value and the debounced search term. You can implement debounce with a `useEffect` and `setTimeout`/`clearTimeout`.",
      "JavaScript's `String.prototype.toLowerCase()` and `includes()` are all you need for client-side title matching.",
      "Keep the original unfiltered recipes in one state variable and derive the filtered list from it, rather than mutating the original array."
    ],
    designNotes:
      "Place the search bar above the recipe grid, spanning the full width of the content area. Use a text input with a search icon and placeholder text like 'Search recipes...'. On mobile it should be full-width; on desktop it can be a comfortable width (e.g., 50-60% of the container).",
    tier: "tier-1",
    featureArea: "recipes",
    complexity: "medium",
    dependsOn: [3],
    keyConcepts: [
      "Controlled inputs",
      "useState",
      "filtering arrays",
      "debounce"
    ]
  },
  {
    id: 6,
    title: "Add category and difficulty filters",
    description:
      "Beyond searching by name, users want to browse recipes by category (breakfast, lunch, dinner, etc.) and difficulty level (easy, medium, hard). You will add filter controls to the recipe list page that let users narrow down recipes. These filters should work alongside the search bar so users can combine them (e.g., search for 'chicken' within 'dinner' and 'easy').",
    acceptanceCriteria: [
      "Filter controls for category and difficulty are visible on the recipe list page.",
      "Clicking a category filter shows only recipes of that category.",
      "Clicking a difficulty filter shows only recipes of that difficulty.",
      "Filters work in combination with each other and with the search bar.",
      "Active filters are visually distinct (e.g., highlighted or filled) so the user can see what's selected.",
      "There is a way to clear/reset filters."
    ],
    apiReference: null,
    hints: [
      "Store each active filter in `useState`. When computing which recipes to display, chain the filter conditions together (search AND category AND difficulty).",
      "Use Tailwind's conditional classes to highlight active filter buttons, e.g., toggling between `bg-gray-200` and `bg-blue-500 text-white`.",
      "The allowed category values are: breakfast, lunch, dinner, dessert, snack, drink. The allowed difficulty values are: easy, medium, hard."
    ],
    designNotes:
      "Place the filter controls between the search bar and the recipe grid. Use pill-shaped buttons or a button group for each filter set (one row for categories, one for difficulty). On mobile, the filters may wrap to multiple lines. Include an 'All' option or a clear button for each filter group.",
    tier: "tier-1",
    featureArea: "recipes",
    complexity: "medium",
    dependsOn: [3],
    keyConcepts: ["State management", "combining filters", "UI feedback"]
  },
  {
    id: 7,
    title: "Build login page",
    description:
      "Users need to log in to create recipes, manage their pantry, and use social features. You will build a login form with email and password fields. When submitted, the form sends a POST request to the auth endpoint. On success, the user is logged in (using the provided auth context) and redirected to the home page. You'll also need to handle and display validation errors from the API.",
    acceptanceCriteria: [
      "The login page displays a form with email and password fields and a submit button.",
      "Submitting the form sends a POST request to `/api/auth/login` with the email and password.",
      "On success, the user is logged in and redirected to the home page.",
      "Validation errors from the API are displayed to the user (e.g., 'Invalid credentials').",
      "The submit button shows a loading state while the request is in progress.",
      "There is a link to the register page for users who don't have an account."
    ],
    apiReference:
      "POST /api/auth/login - Request body: { email: string, password: string }. On success, returns a token and user object. The auth context's `login()` function handles storing the token. Error responses use the standard error shape: { error: { code, message } }.",
    hints: [
      "Use `useState` for the form fields (email, password) and for tracking loading/error states. Use the auth context's `login()` function on success.",
      "Prevent the default form submission with `e.preventDefault()` in your `onSubmit` handler, then make the API call.",
      "Use `useNavigate()` from React Router to redirect the user to the home page after a successful login."
    ],
    designNotes:
      "Center the login form on the page with a max-width container (e.g., 400px). Stack the fields vertically with labels above each input. Place the submit button below the fields at full width. The link to register can go below the form.",
    tier: "tier-1",
    featureArea: "auth",
    complexity: "medium",
    dependsOn: [1],
    keyConcepts: [
      "Form handling",
      "controlled inputs",
      "async submit",
      "error display"
    ]
  },
  {
    id: 8,
    title: "Build register page",
    description:
      "New users need a way to create an account. You will build a registration form with fields for display name, email, password, and confirm password. Before submitting, validate that the two password fields match. On success, automatically log the user in and redirect to the home page. This reuses many patterns from the login page, so look at what you built there for reference.",
    acceptanceCriteria: [
      "The register page displays a form with display name, email, password, and confirm password fields.",
      "Client-side validation checks that passwords match before submitting.",
      "Submitting the form sends a POST request to `/api/auth/register`.",
      "On success, the user is automatically logged in and redirected to the home page.",
      "API validation errors are displayed to the user.",
      "There is a link to the login page for users who already have an account."
    ],
    apiReference:
      "POST /api/auth/register - Request body: { displayName: string, email: string, password: string }. On success, returns a token and user object (same shape as login). Error responses follow the standard error shape with field-level details.",
    hints: [
      "Reuse the form layout and error handling patterns you built for the login page. The main additions are the extra fields and the password match validation.",
      "Check that passwords match in your submit handler before making the API call. Set a local error message if they don't.",
      "After a successful register, call the same `login()` function from the auth context to store the token, then navigate home."
    ],
    designNotes:
      "Use the same centered, max-width form layout as the login page for visual consistency. Stack the four fields vertically. Show password match errors inline near the confirm password field.",
    tier: "tier-1",
    featureArea: "auth",
    complexity: "medium",
    dependsOn: [7],
    keyConcepts: [
      "Form validation",
      "matching fields",
      "reusing patterns from login"
    ]
  },
  {
    id: 9,
    title: "Implement auth-aware header",
    description:
      "Now that users can log in and register, the header needs to reflect whether someone is logged in or not. You will update the layout header to show the user's display name and a 'Log Out' button when authenticated, or 'Log In' / 'Register' links when not. You'll use the provided auth context to read the current user state.",
    acceptanceCriteria: [
      "When logged out, the header shows 'Log In' and 'Register' links.",
      "When logged in, the header shows the user's display name and a 'Log Out' button.",
      "Clicking 'Log Out' calls the auth context's logout function, clears the session, and redirects to the home page.",
      "The header updates immediately when the user logs in or out (no page refresh needed)."
    ],
    apiReference:
      "POST /api/auth/logout - Invalidates the current session. The auth context's `logout()` function handles this. GET /api/auth/me - Returns the current user object if authenticated.",
    hints: [
      "Use `useContext` (or the custom hook provided by the auth context) to access the current user and the logout function.",
      "Conditionally render different JSX based on whether the user object is null or defined.",
      "Remember to handle the transition smoothly: the auth context might take a moment to check if there's an existing session on page load."
    ],
    designNotes:
      "The auth controls sit on the right side of the header. When logged in, show the display name as plain text followed by a 'Log Out' button. When logged out, show 'Log In' and 'Register' as links. Keep the navigation links on the left side unchanged.",
    tier: "tier-1",
    featureArea: "auth",
    complexity: "medium",
    dependsOn: [7],
    keyConcepts: ["Context consumption (useContext)", "conditional rendering"]
  },
  {
    id: 10,
    title: "Build create recipe form with basic fields",
    description:
      "Users need to be able to add their own recipes. You will build the first part of the create recipe form page with inputs for the basic fields: title, description, image URL, prep time, cook time, servings, difficulty (dropdown), and category (dropdown). On submit, the form sends a POST request to create the recipe and redirects to the new recipe's detail page. Ingredients and instructions will be added in follow-up issues.",
    acceptanceCriteria: [
      "The create recipe page has a form with inputs for title, description, image URL, prep time, cook time, servings, difficulty, and category.",
      "Difficulty dropdown includes options: easy, medium, hard.",
      "Category dropdown includes options: breakfast, lunch, dinner, dessert, snack, drink.",
      "Submitting the form sends a POST request to `/api/recipes` with the form data.",
      "On success, the user is redirected to the newly created recipe's detail page.",
      "Validation errors from the API are displayed to the user."
    ],
    apiReference:
      "POST /api/recipes - Auth required. Request body: { title, description, imageUrl, prepTime, cookTime, servings, difficulty, category, ingredients: [], instructions: [], tags: [] }. Send empty arrays for ingredients, instructions, and tags for now. Returns the created recipe object with its new id.",
    hints: [
      "Use a single state object or multiple `useState` calls to manage the form fields. A single object like `formData` with spread updates can be cleaner for many fields.",
      "For number fields (prepTime, cookTime, servings), remember to convert the string input values to numbers before sending to the API.",
      "After a successful POST, use the returned recipe's `id` to navigate to `/recipes/${id}` with `useNavigate()`."
    ],
    designNotes:
      "Use a single-column form layout with labels above each field. Group related fields together (e.g., prep time and cook time side by side). Put the difficulty and category dropdowns in a row. Place the submit button at the bottom. Maximum width of about 600px, centered on the page.",
    tier: "tier-2",
    featureArea: "recipes",
    complexity: "medium",
    dependsOn: [4, 9],
    keyConcepts: [
      "Complex forms",
      "multiple input types",
      "POST requests",
      "redirects"
    ]
  },
  {
    id: 11,
    title: "Add ingredients to create recipe form",
    description:
      "Recipes need ingredients. You will extend the create recipe form with a dynamic ingredients section where users can add multiple ingredients, each with a name, quantity, and unit. Users should be able to add new ingredient rows and remove existing ones. The ingredients are submitted as part of the recipe payload when the form is saved.",
    acceptanceCriteria: [
      "The create recipe form includes a dynamic ingredients section.",
      "Each ingredient row has fields for name (text), quantity (number), and unit (text).",
      "An 'Add ingredient' button appends a new empty ingredient row.",
      "Each ingredient row has a 'Remove' button that removes it from the list.",
      "At least one ingredient is required before the form can be submitted.",
      "Ingredients are included in the POST request body as an array of { name, quantity, unit } objects."
    ],
    apiReference:
      "POST /api/recipes - The `ingredients` field in the request body is an array of objects: [{ name: string, quantity: number, unit: string }]. Each ingredient must have a name, quantity, and unit.",
    hints: [
      "Store ingredients as an array in state, e.g., `useState([{ name: '', quantity: 0, unit: '' }])`. Use the array index to update individual fields.",
      "To add an ingredient, spread the existing array and append a new empty object. To remove, use `filter` by index.",
      "Give each ingredient row a unique key. The array index works here since you're not reordering, but you could also use a simple counter ID."
    ],
    designNotes:
      "Display each ingredient as a horizontal row with three inputs (name taking the most space, quantity and unit smaller). The 'Add ingredient' button goes below the last row. Remove buttons can be small icon buttons (e.g., an X) at the end of each row.",
    tier: "tier-2",
    featureArea: "recipes",
    complexity: "medium",
    dependsOn: [10],
    keyConcepts: ["Dynamic form fields", "array state", "adding/removing items"]
  },
  {
    id: 12,
    title: "Add instructions and tags to create recipe form",
    description:
      "The final piece of the create recipe form: instructions and tags. You will add an ordered instructions section where users add steps one at a time and can reorder or remove them, plus a tags input where users can enter free-text tags. This completes the full recipe creation flow so users can create complete recipes with all fields.",
    acceptanceCriteria: [
      "The form has an instructions section where users can add step-by-step instructions.",
      "Each instruction step can be removed and the remaining steps are renumbered automatically.",
      "Instructions can be reordered (e.g., with up/down buttons).",
      "The form has a tags input where users can add tags (comma-separated or add-on-enter).",
      "Tags are displayed as removable pills/chips below the input.",
      "Instructions and tags are included in the POST request body."
    ],
    apiReference:
      "POST /api/recipes - The `instructions` field is an array of strings (ordered steps). The `tags` field is an array of strings (e.g., ['italian', 'vegetarian', 'quick']).",
    hints: [
      "For instructions, store them as a `string[]` in state. To reorder, swap adjacent elements in the array using a helper function.",
      "For tags, listen for the Enter key or comma in the input's `onKeyDown` handler. Add the trimmed text to the tags array and clear the input.",
      "Use Tailwind's `flex`, `items-center`, and `gap-2` for pill-style tag chips. Add a small X button to each pill for removal."
    ],
    designNotes:
      "Instructions should be a numbered list with each step showing its number, the text, and action buttons (up, down, remove) on the right. The tags section should show an input field with existing tags displayed as small rounded pills below or beside it. Place both sections below the ingredients section in the form.",
    tier: "tier-2",
    featureArea: "recipes",
    complexity: "large",
    dependsOn: [11],
    keyConcepts: [
      "Ordered lists in state",
      "reordering arrays",
      "tag input patterns"
    ]
  },
  {
    id: 13,
    title: "Build edit recipe page",
    description:
      "Users need to be able to update their recipes after creating them. You will build an edit page that loads the existing recipe data into the create recipe form and submits changes via a PUT request. Only the recipe's author should be able to access this page. You'll also add an 'Edit' button to the recipe detail page that's only visible to the recipe's author.",
    acceptanceCriteria: [
      "The edit page fetches the existing recipe from `GET /api/recipes/:id` and pre-populates all form fields.",
      "Submitting the form sends a PUT request to `/api/recipes/:id` with the updated data.",
      "On success, the user is redirected back to the recipe detail page.",
      "If the current user is not the recipe author, they are redirected away from the edit page.",
      "An 'Edit' button appears on the recipe detail page only when the logged-in user is the recipe author."
    ],
    apiReference:
      "GET /api/recipes/:id - Fetches the existing recipe data to pre-populate the form. PUT /api/recipes/:id - Auth required, owner only. Request body has the same shape as POST /api/recipes. Returns the updated recipe object.",
    hints: [
      "Reuse your create recipe form component by passing an `initialData` prop. When present, the form pre-fills with that data and submits a PUT instead of POST.",
      "Compare `recipe.author.id` with the current user's ID from the auth context to determine ownership.",
      "Use `useEffect` to redirect non-owners away once the recipe data and user data are both loaded."
    ],
    designNotes:
      "The edit page should look identical to the create recipe page, with the form pre-filled. The page title should say 'Edit Recipe' instead of 'Create Recipe'. The 'Edit' button on the detail page can be a small outlined button near the recipe title.",
    tier: "tier-2",
    featureArea: "recipes",
    complexity: "large",
    dependsOn: [12],
    keyConcepts: [
      "Pre-populating forms",
      "PUT requests",
      "authorization checks"
    ]
  },
  {
    id: 14,
    title: "Add delete recipe functionality",
    description:
      "Recipe authors need a way to remove recipes they no longer want. You will add a 'Delete' button to the recipe detail page that is only visible to the recipe's author. When clicked, it should show a confirmation dialog before actually deleting, since this action can't be undone. After successful deletion, redirect the user back to the recipe list.",
    acceptanceCriteria: [
      "A 'Delete' button is visible on the recipe detail page only when the logged-in user is the recipe author.",
      "Clicking the delete button shows a confirmation dialog/modal asking the user to confirm.",
      "Confirming the deletion sends a DELETE request to `/api/recipes/:id`.",
      "On success, the user is redirected to the recipe list page.",
      "Canceling the confirmation closes the dialog without deleting."
    ],
    apiReference:
      "DELETE /api/recipes/:id - Auth required, owner only. Returns 200 on success. Returns 403 if the user is not the recipe author. Returns 404 if the recipe doesn't exist.",
    hints: [
      "You can use the browser's built-in `window.confirm()` for a quick confirmation, or build a simple modal component with Tailwind for a nicer UX.",
      "Reuse the same ownership check you built for the edit button: compare `recipe.author.id` with the current user's ID.",
      "After a successful DELETE, use `useNavigate()` to redirect to the recipe list (`/recipes` or `/`)."
    ],
    designNotes:
      "Place the 'Delete' button next to the 'Edit' button on the recipe detail page. Use a red/danger color to indicate it's a destructive action. The confirmation dialog should clearly state what will be deleted and have 'Cancel' and 'Delete' buttons.",
    tier: "tier-2",
    featureArea: "recipes",
    complexity: "medium",
    dependsOn: [4, 9],
    keyConcepts: ["DELETE requests", "confirmation UX", "modal/dialog patterns"]
  },
  {
    id: 15,
    title: "Build My Recipes page",
    description:
      "Users want to see all the recipes they've personally created in one place. You will build a 'My Recipes' page that shows only recipes authored by the currently logged-in user. Reuse the RecipeCard grid you already built. If the user hasn't created any recipes yet, show a friendly empty state with a link to the create recipe form.",
    acceptanceCriteria: [
      "The My Recipes page fetches and displays only recipes created by the current user.",
      "Recipes are displayed using the existing RecipeCard grid layout.",
      "A friendly empty state is shown when the user has no recipes, with a link/button to create one.",
      "The page is only accessible to logged-in users.",
      "The page title or heading clearly indicates these are the user's own recipes."
    ],
    apiReference:
      "GET /api/recipes - Use query params or the API's built-in filtering to get only the current user's recipes. The response includes the author object on each recipe, which can be used for client-side filtering if needed.",
    hints: [
      "You may be able to filter server-side or client-side depending on what the API supports. Client-side: fetch all recipes and filter where `recipe.author.id === currentUser.id`.",
      "Reuse your RecipeCard component directly. The grid layout from the recipe list page can be extracted into a shared component or just duplicated.",
      "Use the auth context to get the current user's ID for the filtering comparison."
    ],
    designNotes:
      "Use the same grid layout as the recipe list page for consistency. Add a page heading like 'My Recipes' at the top. The empty state should be centered with an encouraging message and a prominent 'Create your first recipe' button.",
    tier: "tier-2",
    featureArea: "recipes",
    complexity: "medium",
    dependsOn: [3, 9],
    keyConcepts: ["Filtered API calls", "empty states", "component reuse"]
  },
  {
    id: 16,
    title: "Build pantry list page",
    description:
      "The pantry is where users track what ingredients they have at home. You will build a page that fetches and displays the logged-in user's pantry items from the API. Group the items by category (produce, dairy, protein, etc.) so they're easy to scan. Show a total item count and a friendly empty state for users who haven't added anything yet.",
    acceptanceCriteria: [
      "The pantry page fetches items from `GET /api/pantry` and displays them.",
      "Items are grouped by category (produce, dairy, protein, grain, spice, condiment, frozen, other).",
      "Each item shows its name, quantity, and unit.",
      "A total item count is displayed at the top of the page.",
      "An empty state is shown when the user has no pantry items.",
      "The page is only accessible to logged-in users."
    ],
    apiReference:
      "GET /api/pantry - Auth required. Returns an array of pantry item objects: { id, name, quantity, unit, category, userId, createdAt, updatedAt }. Allowed category values: produce, dairy, protein, grain, spice, condiment, frozen, other.",
    hints: [
      "To group items by category, use `Array.reduce()` or a simple loop to build an object where keys are categories and values are arrays of items.",
      "Render each category as a section with a heading, then map over the items within that category.",
      "Use Tailwind's `divide-y` utility to add subtle separator lines between items within a category."
    ],
    designNotes:
      "Use a single-column layout with category sections stacked vertically. Each category has a bold heading and its items listed below. Show the total count in a subtitle below the page heading. On desktop, you could use a 2-column layout for the category sections to use space more efficiently.",
    tier: "tier-3",
    featureArea: "pantry",
    complexity: "medium",
    dependsOn: [9],
    keyConcepts: ["Grouping data", "organized display", "category sections"]
  },
  {
    id: 17,
    title: "Add pantry item form",
    description:
      "Users need to add ingredients to their pantry. You will add an 'Add Item' form (either inline or in a modal) to the pantry page. The form has fields for item name, quantity, unit, and category. After submitting, the new item should appear in the pantry list immediately without requiring a full page refresh.",
    acceptanceCriteria: [
      "An 'Add Item' button is visible on the pantry page.",
      "Clicking it reveals a form (inline or modal) with fields for name, quantity, unit, and category.",
      "The category field is a dropdown with options: produce, dairy, protein, grain, spice, condiment, frozen, other.",
      "Submitting the form sends a POST request to `/api/pantry`.",
      "The new item appears in the correct category group immediately after creation.",
      "The form is cleared and closed after successful submission."
    ],
    apiReference:
      "POST /api/pantry - Auth required. Request body: { name: string, quantity: number, unit: string, category: string }. Returns the created pantry item object with its new id.",
    hints: [
      "After a successful POST, you can either add the returned item to your local state (optimistic-style) or re-fetch the entire pantry list. Adding to local state feels snappier.",
      "If using a modal, toggle its visibility with a boolean `useState`. Reset the form fields when opening the modal.",
      "Use Tailwind's `transition` and `opacity` utilities if you want a smooth appearance animation for the modal."
    ],
    designNotes:
      "Place the 'Add Item' button prominently at the top of the pantry page, near the heading. The form can be a modal overlay or an inline form that slides open below the button. Keep the form compact since there are only four fields.",
    tier: "tier-3",
    featureArea: "pantry",
    complexity: "medium",
    dependsOn: [16],
    keyConcepts: ["Form in modal/inline", "optimistic updates", "state refresh"]
  },
  {
    id: 18,
    title: "Add edit and delete for pantry items",
    description:
      "Users need to update quantities when they use ingredients, and remove items they no longer have. You will add edit and delete functionality to each pantry item. Editing can be done inline (the item row becomes editable) or in a modal. Deleting should show a confirmation before removing the item.",
    acceptanceCriteria: [
      "Each pantry item has an 'Edit' button that enables inline editing or opens an edit modal.",
      "Editing allows changing the name, quantity, unit, and category.",
      "Saving an edit sends a PUT request to `/api/pantry/:id` and updates the displayed item.",
      "Each pantry item has a 'Delete' button that shows a confirmation before deleting.",
      "Confirming delete sends a DELETE request to `/api/pantry/:id` and removes the item from the list."
    ],
    apiReference:
      "PUT /api/pantry/:id - Auth required. Request body: { name, quantity, unit, category }. Returns the updated pantry item. DELETE /api/pantry/:id - Auth required. Returns 200 on success.",
    hints: [
      "For inline editing, track which item ID is currently being edited in state. When an item is in edit mode, render input fields instead of plain text.",
      "Update your local pantry state after a successful PUT/DELETE to keep the UI in sync without re-fetching.",
      "A simple `window.confirm()` works fine for the delete confirmation, or reuse a confirmation modal if you built one for recipe deletion."
    ],
    designNotes:
      "Add small icon buttons (pencil for edit, trash for delete) on the right side of each pantry item row. In edit mode, the row's text fields become input fields with 'Save' and 'Cancel' buttons. Keep the layout compact so the pantry list doesn't feel cluttered.",
    tier: "tier-3",
    featureArea: "pantry",
    complexity: "medium",
    dependsOn: [17],
    keyConcepts: ["Inline editing patterns", "PUT/DELETE", "confirmation"]
  },
  {
    id: 19,
    title: "Add favorite/unfavorite toggle",
    description:
      "Users want to save recipes they love for easy access later. You will add a heart or bookmark icon button to each RecipeCard and to the recipe detail page. Clicking it toggles the favorite status: if the recipe isn't favorited, it sends a POST to add it; if it is, it sends a DELETE to remove it. The icon should visually reflect the current state (filled when favorited, outlined when not).",
    acceptanceCriteria: [
      "A heart/bookmark icon button appears on each RecipeCard and on the recipe detail page.",
      "The icon is filled/active when the recipe is in the user's favorites, and outlined when not.",
      "Clicking the icon on a non-favorited recipe sends a POST to `/api/favorites` and fills the icon.",
      "Clicking the icon on a favorited recipe sends a DELETE to `/api/favorites/:recipeId` and unfills the icon.",
      "The toggle is only functional for logged-in users. Logged-out users see a disabled or hidden icon."
    ],
    apiReference:
      "GET /api/favorites - Auth required. Returns an array of full recipe objects that the user has favorited. POST /api/favorites - Auth required. Request body: { recipeId: string }. DELETE /api/favorites/:recipeId - Auth required. Removes the recipe from favorites.",
    hints: [
      "Fetch the user's favorites on app load or when the recipe list mounts, and store the favorite recipe IDs in a Set for quick lookups.",
      "Toggle the icon state optimistically (update the UI immediately), then make the API call. If the call fails, revert the state.",
      "You can use two different SVG icons or toggle a Tailwind class like `fill-red-500` vs `fill-none` on the same icon."
    ],
    designNotes:
      "Place the heart icon in the top-right corner of the RecipeCard (overlaying the image) and near the title on the recipe detail page. Use a red or pink color for the filled state. Add a subtle hover effect so it feels interactive.",
    tier: "tier-4",
    featureArea: "social",
    complexity: "medium",
    dependsOn: [4, 9],
    keyConcepts: ["Toggle state", "POST/DELETE based on state", "icon feedback"]
  },
  {
    id: 20,
    title: "Build favorites page",
    description:
      "Users need a dedicated page to see all the recipes they've favorited. You will build a Favorites page that fetches the user's favorited recipes from the API and displays them in the same RecipeCard grid used elsewhere. If the user hasn't favorited anything yet, show a friendly message with a link to browse recipes.",
    acceptanceCriteria: [
      "The Favorites page fetches recipes from `GET /api/favorites` and displays them in a RecipeCard grid.",
      "A loading state is shown while data is being fetched.",
      "An empty state is shown when the user has no favorites, with a link to browse recipes.",
      "Unfavoriting a recipe from this page removes it from the displayed list.",
      "The page is only accessible to logged-in users."
    ],
    apiReference:
      "GET /api/favorites - Auth required. Returns an array of full recipe objects (not just IDs) that the user has favorited. No secondary fetches needed.",
    hints: [
      "The API returns full recipe objects, so you can pass them directly to your RecipeCard components without additional fetching.",
      "If the favorite toggle is working on the RecipeCard, unfavoriting from this page should trigger a re-fetch or local state update to remove the card from view.",
      "Reuse the same grid layout and empty state pattern from the My Recipes page."
    ],
    designNotes:
      "Use the same grid layout as the recipe list page. Add a page heading like 'My Favorites'. The empty state should suggest browsing recipes with a link to the home page.",
    tier: "tier-4",
    featureArea: "social",
    complexity: "medium",
    dependsOn: [19],
    keyConcepts: ["Reusing components with different data sources"]
  },
  {
    id: 21,
    title: "Build comments display section",
    description:
      "Recipes are more useful when people can share their experiences. You will add a comments section to the recipe detail page that fetches and displays all comments for that recipe. Each comment should show the author's name, the comment text, and a relative timestamp (e.g., '2 hours ago'). Show a count of total comments as a section heading.",
    acceptanceCriteria: [
      "A comments section is visible on the recipe detail page below the recipe content.",
      "Comments are fetched from `GET /api/recipes/:recipeId/comments` and displayed in a list.",
      "Each comment shows the author's display name, comment text, and a relative timestamp.",
      "The total number of comments is shown as part of the section heading (e.g., 'Comments (5)').",
      "An empty state message is shown when there are no comments yet."
    ],
    apiReference:
      "GET /api/recipes/:recipeId/comments - No auth required. Returns an array of comment objects: { id, recipeId, author: { id, displayName }, text, createdAt, updatedAt }.",
    hints: [
      "You can calculate relative timestamps using `Date.now() - new Date(comment.createdAt).getTime()` and converting milliseconds to a human-readable string, or use a small library like `date-fns`'s `formatDistanceToNow`.",
      "Fetch comments in a separate `useEffect` from the recipe data, using the recipe ID from `useParams()`.",
      "Use Tailwind's `divide-y` on the comment list container to add subtle lines between comments."
    ],
    designNotes:
      "Place the comments section below the recipe instructions and tags. Each comment is a simple block: author name in bold at the top, comment text below, and the relative timestamp in small gray text. Stack comments vertically with dividers between them.",
    tier: "tier-4",
    featureArea: "social",
    complexity: "medium",
    dependsOn: [4],
    keyConcepts: ["Nested data fetching", "date formatting", "comment display"]
  },
  {
    id: 22,
    title: "Add comment creation, editing, and deletion",
    description:
      "Logged-in users need to be able to post, edit, and delete their own comments. You will add a comment form below the comments list for posting new comments, and edit/delete controls on the user's own comments. Editing replaces the comment text inline, and deleting removes it with a confirmation.",
    acceptanceCriteria: [
      "A comment form with a text area and submit button appears below the comments list for logged-in users.",
      "Submitting the form sends a POST to `/api/recipes/:recipeId/comments` and the new comment appears in the list.",
      "Edit and delete buttons appear on comments authored by the current user.",
      "Clicking edit turns the comment text into an editable text area with save/cancel options.",
      "Clicking delete shows a confirmation and sends a DELETE to `/api/comments/:id`.",
      "The comment form is hidden or shows a login prompt for logged-out users."
    ],
    apiReference:
      "POST /api/recipes/:recipeId/comments - Auth required. Request body: { text: string }. Returns the created comment object. PUT /api/comments/:id - Auth required, owner only. Request body: { text: string }. Returns the updated comment. DELETE /api/comments/:id - Auth required, owner only. Returns 200 on success.",
    hints: [
      "Track which comment (if any) is currently being edited in state. When editing, swap the display text for a textarea pre-filled with the comment text.",
      "After a successful POST, prepend or append the new comment to your local comments array so it appears immediately.",
      "Compare `comment.author.id` with the current user's ID to determine which comments show edit/delete controls."
    ],
    designNotes:
      "Place the comment form at the bottom of the comments section. The text area should be full-width with a submit button below. Edit/delete buttons should be small and subtle, appearing on the right side of each comment that belongs to the current user.",
    tier: "tier-4",
    featureArea: "social",
    complexity: "large",
    dependsOn: [21, 9],
    keyConcepts: ["CRUD within a section", "ownership-based UI"]
  },
  {
    id: 23,
    title: "Build meal plan weekly view",
    description:
      "The meal plan page helps users organize their cooking for the week. You will build a 7-day grid/calendar view where each day has slots for breakfast, lunch, dinner, and snack. Fetch the current week's entries from the API. Filled slots show the recipe's title and image; empty slots show a '+' button for adding recipes. Include navigation to move between weeks.",
    acceptanceCriteria: [
      "The meal plan page displays a 7-day view with the current week's dates.",
      "Each day has four meal type slots: breakfast, lunch, dinner, and snack.",
      "Existing meal plan entries are fetched from `GET /api/meal-plans` with the current week's date range.",
      "Filled slots show the recipe title and thumbnail image.",
      "Empty slots show a '+' button for adding recipes.",
      "Previous/next week navigation buttons update the displayed week and re-fetch data."
    ],
    apiReference:
      "GET /api/meal-plans?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD - Auth required. Returns an array of meal plan entries: { id, recipe: { id, title, imageUrl }, date, mealType, userId, createdAt }. Allowed mealType values: breakfast, lunch, dinner, snack.",
    hints: [
      "Calculate the start and end dates of the current week using JavaScript's `Date` object. Monday-to-Sunday or Sunday-to-Saturday, pick one and be consistent.",
      "Organize the fetched entries into a lookup structure like `{ [date]: { [mealType]: entry } }` for easy rendering.",
      "Use Tailwind's `grid grid-cols-7` for the weekly layout on desktop. On mobile, consider a stacked day-by-day view."
    ],
    designNotes:
      "On desktop, show a 7-column grid with day names as headers. Each column has 4 stacked slots (one per meal type). On mobile, switch to a vertically scrolling list of days. Include the week's date range in the header along with prev/next navigation arrows.",
    tier: "tier-5",
    featureArea: "meal-plan",
    complexity: "large",
    dependsOn: [9],
    keyConcepts: ["Date handling", "grid layouts", "weekly navigation"]
  },
  {
    id: 24,
    title: "Add recipe to meal plan",
    description:
      "Users need to be able to add recipes to their meal plan. When a user clicks a '+' slot in the weekly view or an 'Add to Meal Plan' button on a recipe detail page, a modal/form should appear letting them pick the date and meal type. After saving, the meal plan view updates to show the new entry.",
    acceptanceCriteria: [
      "Clicking a '+' slot in the meal plan opens a form to add a recipe, with the date and meal type pre-filled based on the slot.",
      "An 'Add to Meal Plan' button on the recipe detail page opens a form to pick the date and meal type.",
      "The form includes a date picker and a meal type selector (breakfast, lunch, dinner, snack).",
      "Submitting the form sends a POST to `/api/meal-plans` and the new entry appears in the weekly view.",
      "The modal/form closes after successful submission."
    ],
    apiReference:
      "POST /api/meal-plans - Auth required. Request body: { recipeId: string, date: string (YYYY-MM-DD), mealType: string }. Allowed mealType values: breakfast, lunch, dinner, snack. Returns the created meal plan entry.",
    hints: [
      "When clicking from the meal plan '+' slot, you know the date and meal type already, so pre-fill those and let the user search/select a recipe.",
      "When clicking from a recipe detail page, you know the recipe, so let the user pick the date and meal type.",
      "Use an HTML `<input type='date'>` for the date picker — it's simple and works well across browsers."
    ],
    designNotes:
      "Use a modal overlay for the add form. Keep it simple: a date input, a meal type dropdown, and (when accessed from the meal plan) a recipe search/select field. Place the 'Add to Meal Plan' button on the recipe detail page near the other action buttons (edit, delete, favorite).",
    tier: "tier-5",
    featureArea: "meal-plan",
    complexity: "large",
    dependsOn: [23, 4],
    keyConcepts: ["Modal forms", "date selection", "cross-page interaction"]
  },
  {
    id: 25,
    title: "Remove recipe from meal plan",
    description:
      "Users need to be able to remove recipes from their meal plan if their plans change. You will add a remove/close button to each filled meal plan slot. Clicking it sends a DELETE request to remove the entry, and the slot returns to its empty '+' state.",
    acceptanceCriteria: [
      "Each filled meal plan slot has a visible remove/X button.",
      "Clicking the remove button sends a DELETE request to `/api/meal-plans/:id`.",
      "On success, the slot is cleared and shows the '+' button again.",
      "The removal happens without a full page refresh.",
      "A brief confirmation or the ability to undo is provided to prevent accidental removals."
    ],
    apiReference:
      "DELETE /api/meal-plans/:id - Auth required. Returns 200 on success.",
    hints: [
      "Update your local meal plan state after a successful DELETE to remove the entry without re-fetching the whole week.",
      "Position the remove button as a small X icon in the corner of the filled slot. Use Tailwind's `absolute` positioning with a `relative` parent.",
      "Consider showing the remove button only on hover to keep the UI clean, using Tailwind's `group-hover` utility."
    ],
    designNotes:
      "The remove button should be a small X or trash icon in the top-right corner of each filled meal plan slot. It can be visible on hover only to keep the grid clean. The slot should transition smoothly back to the empty '+' state.",
    tier: "tier-5",
    featureArea: "meal-plan",
    complexity: "medium",
    dependsOn: [24],
    keyConcepts: ["DELETE in context", "updating grid state"]
  },
  {
    id: 26,
    title: "Build meal plan shopping list",
    description:
      "Once a user has planned their meals for the week, they need to know what to buy. You will add a 'Generate Shopping List' button to the meal plan page that aggregates all ingredients from the planned recipes for the current week. The list should group ingredients by category and combine quantities where possible (e.g., if two recipes need chicken breast, show the total).",
    acceptanceCriteria: [
      "A 'Generate Shopping List' button is visible on the meal plan page.",
      "Clicking it aggregates ingredients from all recipes in the current week's meal plan.",
      "Ingredients are grouped by a sensible category (e.g., produce, dairy, protein).",
      "Duplicate ingredients across recipes are combined with summed quantities.",
      "The shopping list is displayed in a clear, printable format.",
      "An appropriate message is shown if the meal plan for the current week is empty."
    ],
    apiReference: null,
    hints: [
      "You'll need access to the full ingredient data for each recipe in the meal plan. You may already have recipe data from the meal plan entries, or you may need to fetch individual recipes.",
      "Use a Map or object keyed by ingredient name to accumulate quantities across recipes. Handle matching carefully (e.g., lowercase names).",
      "Tailwind's `print:` variant lets you add print-specific styles if you want a 'Print' button."
    ],
    designNotes:
      "Display the shopping list in a panel or modal that appears below or beside the meal plan. Group items under category headings. Each item shows the ingredient name and total quantity with unit. Consider adding a 'Print' button or allowing the list to be copied to clipboard.",
    tier: "tier-5",
    featureArea: "meal-plan",
    complexity: "large",
    dependsOn: [23],
    keyConcepts: ["Data aggregation", "grouping", "computed display"]
  },
  {
    id: 27,
    title: "Add ingredient substitution suggestions",
    description:
      "Sometimes users don't have a specific ingredient or want to accommodate dietary preferences. You will add a small button/icon next to each ingredient on the recipe detail page that, when clicked, calls the AI substitution endpoint and displays alternatives. Since AI responses take a moment, you'll need a clear loading state. Optionally, let the user select a dietary preference before requesting.",
    acceptanceCriteria: [
      "A small button or icon appears next to each ingredient on the recipe detail page.",
      "Clicking it sends a POST to `/api/ai/substitutions` with the recipe ID and ingredient name.",
      "A loading indicator is shown while waiting for the AI response.",
      "Substitution suggestions are displayed in a popover, tooltip, or expandable section.",
      "Each suggestion shows the substitute name, usage notes, and ratio.",
      "An optional dietary preference selector (e.g., vegan, gluten-free) can be used before requesting."
    ],
    apiReference:
      "POST /api/ai/substitutions - Auth required. Request body: { recipeId: string, ingredientName: string, dietaryPreference?: string }. Response: { ingredient: string, substitutions: [{ name: string, notes: string, ratio: string }] }.",
    hints: [
      "Use a popover or expandable section for showing results. Track which ingredient's popover is open in state (only one at a time).",
      "Show a small spinner or loading dots inside the popover while waiting for the AI response.",
      "Store fetched substitutions in a cache (e.g., a state Map keyed by ingredient name) so re-opening the same ingredient doesn't re-fetch."
    ],
    designNotes:
      "Place a small icon (e.g., a swap/substitute icon) to the right of each ingredient. The popover should appear near the clicked ingredient and show the substitutions in a compact list. Keep the popover small and focused — it shouldn't obscure the whole recipe.",
    tier: "tier-6",
    featureArea: "ai",
    complexity: "medium",
    dependsOn: [4, 9],
    keyConcepts: [
      "Async UX",
      "loading states for slow operations",
      "popover/tooltip"
    ]
  },
  {
    id: 28,
    title: "Implement recipe scaling",
    description:
      "Users often need to adjust a recipe for more or fewer people. You will add a servings adjuster on the recipe detail page (a number input or +/- buttons) near the servings display. When the user changes the target servings, it calls the AI scaling endpoint and replaces the displayed ingredients with the scaled versions. Show a loading indicator during the request and display any cooking tips the AI provides.",
    acceptanceCriteria: [
      "A servings adjuster (number input or +/- buttons) is visible near the servings display on the recipe detail page.",
      "Changing the servings value sends a POST to `/api/ai/scale` with the recipe ID and target servings.",
      "A loading indicator is shown while waiting for the scaled ingredients.",
      "The displayed ingredients are replaced with the scaled versions on success.",
      "The AI's cooking tips are displayed if provided.",
      "The original servings and ingredients can be restored (e.g., by resetting to the original value)."
    ],
    apiReference:
      "POST /api/ai/scale - Auth required. Request body: { recipeId: string, targetServings: number }. Response: { originalServings: number, targetServings: number, scaledIngredients: [{ name, quantity, unit }], tips: string }.",
    hints: [
      "Store the scaled ingredients separately from the original recipe data so you can always revert. Use a state variable like `scaledIngredients` that, when set, overrides the recipe's default ingredients in the display.",
      "Debounce the scaling request if using a number input, so it doesn't fire on every keystroke when the user types a number.",
      "Show the AI tips in a callout or info box below the ingredients section."
    ],
    designNotes:
      "Place the servings adjuster inline with the existing servings display (e.g., 'Servings: [- 4 +]'). The ingredient list should update in-place when scaled. Show the cooking tips in a subtle info card below the ingredients, styled with a background color to distinguish it from the recipe content.",
    tier: "tier-6",
    featureArea: "ai",
    complexity: "medium",
    dependsOn: [4, 9],
    keyConcepts: ["Dynamic updates", "number input", "replacing displayed data"]
  },
  {
    id: 29,
    title: "Build generate recipe from pantry",
    description:
      "This is the app's flagship AI feature: generating a recipe from what the user already has in their pantry. You will add a 'Generate Recipe' section to the pantry page where users can select which pantry items to use (checkboxes), optionally type preferences, and optionally pick a category. The AI generates a recipe which is shown as a preview. A 'Save to My Recipes' button lets them save it for real.",
    acceptanceCriteria: [
      "A 'Generate Recipe' button or section is visible on the pantry page.",
      "Users can select pantry items via checkboxes to include in the generation.",
      "An optional text input allows the user to type preferences (e.g., 'quick and healthy').",
      "An optional category dropdown lets the user specify a meal category.",
      "Submitting sends a POST to `/api/ai/generate` and displays the generated recipe as a preview.",
      "A 'Save to My Recipes' button sends a POST to `/api/recipes` to save the generated recipe."
    ],
    apiReference:
      "POST /api/ai/generate - Auth required. Request body: { pantryItemIds: string[], preferences?: string, category?: string }. Response: { recipe: { title, description, prepTime, cookTime, servings, difficulty, category, ingredients: [{ name, quantity, unit, inPantry: boolean }], instructions: string[], tags: string[] } }. The `inPantry` boolean indicates which ingredients the user already has. POST /api/recipes - Used to save the generated recipe.",
    hints: [
      "Manage checkbox state with an array of selected pantry item IDs. Toggle items in/out of the array on click.",
      "The AI response includes `inPantry` booleans on ingredients — use this to visually distinguish items the user has vs. items they'd need to buy (e.g., green checkmark vs. orange 'need to buy' label).",
      "Build a recipe preview component that displays the generated recipe in a card-like format before saving."
    ],
    designNotes:
      "On the pantry page, add a section with checkboxes next to each pantry item. Below the list, show the preferences text input, category dropdown, and 'Generate' button. The generated recipe preview should appear below or in a modal, formatted like a recipe card but with save/discard buttons.",
    tier: "tier-6",
    featureArea: "ai",
    complexity: "large",
    dependsOn: [16, 10],
    keyConcepts: [
      "Multi-step flow",
      "checkbox selection",
      "preview before save"
    ]
  },
  {
    id: 30,
    title: "Add AI recipe generation from browse",
    description:
      "Sometimes users just want inspiration without checking their pantry. You will add a 'Surprise Me' or 'AI Generate' button on the main recipe list page that opens a simple form where the user describes what they want in plain text. It calls the AI generate endpoint (without pantry items) and displays the result, with an option to save it as a real recipe.",
    acceptanceCriteria: [
      "A 'Surprise Me' or 'AI Generate' button is visible on the recipe list page.",
      "Clicking it opens a form where the user can describe what they want in free text.",
      "An optional category dropdown is available to narrow the generation.",
      "Submitting sends a POST to `/api/ai/generate` (with empty pantryItemIds) and shows the generated recipe.",
      "A 'Save Recipe' button saves the generated recipe via POST to `/api/recipes`.",
      "A loading state is shown during generation since AI responses can be slow."
    ],
    apiReference:
      "POST /api/ai/generate - Auth required. Request body: { pantryItemIds: [], preferences: string, category?: string }. Same response shape as the pantry generation. POST /api/recipes - Used to save the generated recipe.",
    hints: [
      "Reuse the recipe preview component you built for the pantry generation feature (issue #29) to display the AI result.",
      "Keep the form simple: just a textarea for preferences and an optional category dropdown. No pantry selection needed here.",
      "After saving the generated recipe, redirect the user to its detail page using the returned recipe ID."
    ],
    designNotes:
      "Place the 'Surprise Me' button prominently on the recipe list page, perhaps as a call-to-action card at the top of the grid. The generation form can be a modal overlay. The recipe preview should look like a recipe detail view with save/discard options.",
    tier: "tier-6",
    featureArea: "ai",
    complexity: "medium",
    dependsOn: [10],
    keyConcepts: ["Simple AI interaction", "free-text input", "save flow"]
  },
  {
    id: 31,
    title: "Build responsive mobile navigation",
    description:
      "The app layout shell works on desktop, but on smaller screens the navigation links crowd the header. You will add a responsive mobile navigation: on screens below a certain breakpoint, replace the horizontal nav links with a hamburger menu button that toggles a slide-out or dropdown menu. The menu should close when the user navigates to a new page.",
    acceptanceCriteria: [
      "On mobile viewports, the horizontal navigation links are hidden and a hamburger menu button is shown.",
      "Clicking the hamburger button opens a slide-out or dropdown navigation menu.",
      "The menu contains all the same navigation links as the desktop header.",
      "Navigating to a page via the menu automatically closes it.",
      "The menu can also be closed by clicking the hamburger button again or clicking outside.",
      "On desktop viewports, the regular horizontal navigation is shown as before."
    ],
    apiReference: null,
    hints: [
      "Use Tailwind's responsive prefixes like `hidden md:flex` on the desktop nav and `md:hidden` on the hamburger button to toggle visibility by breakpoint.",
      "Track the menu open/close state with a boolean `useState`. Use React Router's `useLocation()` to close the menu when the route changes.",
      "For a slide-out menu, use Tailwind's `translate-x` with `transition` for a smooth animation."
    ],
    designNotes:
      "The hamburger icon should be on the right side of the header on mobile. The mobile menu can be a full-height sidebar that slides in from the right, or a dropdown panel below the header. Include a close button (X) at the top of the slide-out. Use a semi-transparent backdrop overlay.",
    tier: "tier-1",
    featureArea: "app-shell",
    complexity: "medium",
    dependsOn: [1],
    keyConcepts: [
      "Responsive design",
      "media queries via Tailwind",
      "toggle state"
    ]
  },
  {
    id: 32,
    title: "Create 404 not-found page",
    description:
      "When users navigate to a URL that doesn't match any route, they should see a helpful 404 page rather than a blank screen. You will build a simple not-found page that tells users the page doesn't exist and gives them a way to get back to the home page.",
    acceptanceCriteria: [
      "Navigating to any undefined route shows the 404 page.",
      "The page displays a clear 'Page Not Found' message.",
      "A link or button is provided to navigate back to the home page.",
      "The page uses the same layout shell as the rest of the app (header and footer are still visible)."
    ],
    apiReference: null,
    hints: [
      "Add a catch-all route (`path='*'`) at the end of your route definitions in React Router to render the 404 component.",
      "Keep the page simple and friendly. A short message and a prominent 'Go Home' button is all you need."
    ],
    designNotes:
      "Center the content vertically and horizontally on the page. Use a large heading ('404'), a friendly message below it, and a button linking back to the home page. Keep it minimal but visually consistent with the rest of the app.",
    tier: "tier-1",
    featureArea: "app-shell",
    complexity: "small",
    dependsOn: [1],
    keyConcepts: ["React Router catch-all routes", "error pages"]
  },
  {
    id: 33,
    title: "Add recipe image fallback",
    description:
      "Not all recipes have images, and sometimes image URLs are broken. You will add fallback handling to the RecipeCard and recipe detail page so that when an image fails to load or isn't provided, a placeholder image or styled fallback (e.g., the recipe's first letter on a colored background) is shown instead.",
    acceptanceCriteria: [
      "When a recipe has no imageUrl (null or empty), a placeholder is displayed instead.",
      "When a recipe's imageUrl fails to load (broken link), the fallback is shown.",
      "The fallback is visually consistent (e.g., a generic food icon or a colored background with the recipe's initial).",
      "The fallback works on both the RecipeCard component and the recipe detail page."
    ],
    apiReference: null,
    hints: [
      "Use the `<img>` element's `onError` handler to detect when an image fails to load and swap to the fallback.",
      "For a stylish fallback, use a `<div>` with a Tailwind background color and the recipe title's first letter centered in large text.",
      "Create a small reusable component (e.g., `RecipeImage`) that encapsulates the image + fallback logic so you can use it everywhere."
    ],
    designNotes:
      "The fallback should match the same dimensions and aspect ratio as a normal recipe image. Use a muted background color (or generate a color from the recipe title) with a centered icon or letter. It should look intentional, not broken.",
    tier: "tier-1",
    featureArea: "recipes",
    complexity: "small",
    dependsOn: [2],
    keyConcepts: ["Image error handling", "fallback UI patterns"]
  },
  {
    id: 34,
    title: "Add pagination controls",
    description:
      "When there are many recipes, showing them all at once is slow and overwhelming. You will add pagination controls to the recipe list page so users can navigate between pages of results. The API already supports `page` and `limit` query parameters — you just need to send them and render appropriate page navigation controls.",
    acceptanceCriteria: [
      "The recipe list page requests a specific page of results using the `page` and `limit` query params.",
      "Pagination controls (previous/next buttons and/or page numbers) are displayed below the recipe grid.",
      "Clicking a pagination control fetches the corresponding page of recipes.",
      "The current page is visually indicated in the controls.",
      "Previous button is disabled on the first page; next button is disabled on the last page."
    ],
    apiReference:
      "GET /api/recipes?page=1&limit=12 - The `page` param controls which page of results to return (default: 1). The `limit` param controls items per page (default: 12). The response should include enough metadata (e.g., total count or has-more flag) to know if there are more pages.",
    hints: [
      "Store the current page number in `useState` and include it in your fetch URL. When the page changes, re-fetch the data.",
      "If the API returns a total count, calculate the total number of pages with `Math.ceil(totalCount / limit)`.",
      "Use Tailwind's `disabled:opacity-50 disabled:cursor-not-allowed` to style disabled pagination buttons."
    ],
    designNotes:
      "Place pagination controls centered below the recipe grid. Use a row of page number buttons with previous/next arrows on each side. Highlight the current page number. Keep it simple and don't show too many page numbers at once (use ellipsis for large ranges).",
    tier: "tier-1",
    featureArea: "recipes",
    complexity: "medium",
    dependsOn: [3],
    keyConcepts: ["Pagination", "query parameters", "derived state"]
  },
  {
    id: 35,
    title: "Add sort recipes functionality",
    description:
      "Users want to sort the recipe list by different criteria to find what they're looking for. You will add a sort control to the recipe list page that allows sorting by fields like title (A-Z), newest first, cook time, or difficulty. The sorting can be done client-side on the current page of recipes.",
    acceptanceCriteria: [
      "A sort dropdown or toggle is visible on the recipe list page.",
      "Users can sort by at least: title (A-Z), newest first, and cook time.",
      "Changing the sort order immediately updates the displayed recipe order.",
      "The current sort selection is clearly indicated.",
      "Sorting works in combination with search and filters."
    ],
    apiReference: null,
    hints: [
      "Use `Array.prototype.sort()` with a compare function on the recipes array. Remember that `.sort()` mutates the array, so sort a copy: `[...recipes].sort(...)`.",
      "Store the selected sort option in `useState`. Use a `useMemo` or derived computation to produce the sorted list from the filtered recipes.",
      "For alphabetical sorting, use `localeCompare()`. For dates, compare the `createdAt` timestamp values."
    ],
    designNotes:
      "Place the sort control near the search bar and filters, either on the right side of the same row or in a dedicated controls row. A dropdown select works well. Label it clearly (e.g., 'Sort by:').",
    tier: "tier-1",
    featureArea: "recipes",
    complexity: "medium",
    dependsOn: [3],
    keyConcepts: ["Sorting arrays", "compare functions", "derived state"]
  },
  {
    id: 36,
    title: "Add tag-based browsing",
    description:
      "Recipes have tags like 'italian', 'vegetarian', or 'quick'. You will make tags clickable so users can browse all recipes with a particular tag. When a user clicks a tag on a recipe card or detail page, the recipe list should filter to show only recipes with that tag.",
    acceptanceCriteria: [
      "Tags displayed on recipe cards and the recipe detail page are clickable.",
      "Clicking a tag navigates to the recipe list page filtered by that tag.",
      "The recipe list page shows which tag filter is active.",
      "Users can clear the tag filter to return to the full recipe list.",
      "Tag filtering works alongside other filters (category, difficulty, search)."
    ],
    apiReference: null,
    hints: [
      "Use URL search params or React Router's query params to pass the tag filter (e.g., `/recipes?tag=vegetarian`). Read it with `useSearchParams()` on the recipe list page.",
      "Make each tag a `<Link>` that navigates to the recipe list with the tag as a query param.",
      "Filter the recipes client-side by checking if the recipe's `tags` array includes the selected tag."
    ],
    designNotes:
      "Style tags as clickable pills with a hover effect to indicate they're interactive. On the recipe list page, show the active tag filter as a dismissible chip above the grid (e.g., 'Showing: vegetarian [x]'). Tags should be visually consistent across the card and detail views.",
    tier: "tier-1",
    featureArea: "recipes",
    complexity: "medium",
    dependsOn: [3],
    keyConcepts: [
      "URL search params",
      "query-based filtering",
      "cross-page navigation"
    ]
  },
  {
    id: 37,
    title: "Build toast notification system",
    description:
      "The app needs a way to show brief, non-blocking feedback messages to users — for example, 'Recipe saved!' after creating a recipe, or 'Item deleted' after removing a pantry item. You will build a toast notification system that can be triggered from anywhere in the app. Toasts should appear briefly and then auto-dismiss.",
    acceptanceCriteria: [
      "A toast notification component exists that can display success, error, and info messages.",
      "Toasts appear in a fixed position (e.g., top-right or bottom-right) and auto-dismiss after a few seconds.",
      "A context or hook (e.g., `useToast`) is provided so any component in the app can trigger a toast.",
      "Multiple toasts can stack if triggered in quick succession.",
      "Toasts have a close button to dismiss them manually before the auto-timeout."
    ],
    apiReference: null,
    hints: [
      "Use React Context to provide a `showToast(message, type)` function throughout the app. The context wraps a state array of active toasts.",
      "Use `setTimeout` inside a `useEffect` to auto-dismiss each toast after a set duration (e.g., 3-5 seconds). Remember to clear the timeout on unmount.",
      "Use Tailwind's `fixed`, `z-50`, and positioning utilities to place the toast container. Use `transition` and `opacity` for smooth appear/disappear animations."
    ],
    designNotes:
      "Place toasts in the top-right or bottom-right corner, stacked vertically with a small gap between them. Use color-coded backgrounds: green for success, red for error, blue for info. Each toast should have the message text and a small X close button.",
    tier: "tier-2",
    featureArea: "ux",
    complexity: "medium",
    dependsOn: [],
    keyConcepts: [
      "React Context",
      "setTimeout/useEffect",
      "notification patterns"
    ]
  },
  {
    id: 38,
    title: "Implement server-side search and filtering",
    description:
      "The initial search and filters work client-side on already-fetched data, which doesn't scale. You will update the recipe list page to send search, category, and difficulty filters as query parameters to the API, so the server handles the filtering and returns only matching results. This means the search and filter state needs to be synced with the API request.",
    acceptanceCriteria: [
      "The search term is sent as the `search` query parameter to `GET /api/recipes`.",
      "Category and difficulty filters are sent as `category` and `difficulty` query params.",
      "The API is called with the updated params whenever the user changes search or filter values.",
      "Results are debounced so the API isn't called on every keystroke.",
      "Pagination works correctly with the active filters (changing a filter resets to page 1).",
      "The UI still feels responsive with loading indicators during server requests."
    ],
    apiReference:
      "GET /api/recipes?search=chicken&category=dinner&difficulty=easy&page=1&limit=12 - All query params are optional. The server returns only recipes matching the provided filters. Pagination params work alongside filters.",
    hints: [
      "Replace client-side filtering logic with query param construction. Build the URL dynamically from the current search, filter, and pagination state.",
      "Use a `useEffect` that depends on the debounced search term, selected filters, and current page to trigger a new fetch.",
      "When any filter changes, reset the page to 1 to avoid requesting a page that may not exist with the new filter results."
    ],
    designNotes:
      "The UI should look identical to the client-side search and filter implementation. The only visible difference should be a loading state when new results are being fetched from the server. Consider showing a subtle loading overlay on the grid rather than replacing it entirely.",
    tier: "tier-2",
    featureArea: "recipes",
    complexity: "medium",
    dependsOn: [5, 6, 34],
    keyConcepts: [
      "Server-side filtering",
      "query parameter construction",
      "debounced API calls"
    ]
  },
  {
    id: 39,
    title: "Build user profile page",
    description:
      "Users want to see and manage their profile information. You will build a profile page that displays the current user's details (display name, email, avatar, join date) and some basic stats like how many recipes they've created and how many favorites they have. This gives the app a more personal, complete feeling.",
    acceptanceCriteria: [
      "The profile page displays the user's display name, email, avatar (or fallback), and join date.",
      "The page shows the user's recipe count and favorites count.",
      "The profile page is accessible from the header (e.g., clicking the user's name).",
      "The page is only accessible to logged-in users.",
      "The join date is formatted in a human-readable way."
    ],
    apiReference:
      "GET /api/auth/me - Auth required. Returns the user object: { id, email, displayName, avatarUrl, createdAt }. Additional stats can be derived from GET /api/recipes (filter by author) and GET /api/favorites.",
    hints: [
      "Fetch the user data from the auth context (which already has the user object) and make additional API calls for recipe/favorite counts.",
      "Use the same avatar fallback pattern you built for recipe images: show a colored circle with the user's initial if no avatar URL is set.",
      "Format the `createdAt` date using `toLocaleDateString()` or a library like `date-fns` for a nicer display."
    ],
    designNotes:
      "Use a centered, single-column layout. Show the avatar (or fallback) prominently at the top, followed by the display name as a heading, email below, and join date. Display stats (recipe count, favorites) in a row of simple stat cards below the user info.",
    tier: "tier-2",
    featureArea: "auth",
    complexity: "medium",
    dependsOn: [9],
    keyConcepts: [
      "Profile display",
      "aggregating data from multiple endpoints",
      "date formatting"
    ]
  }
] as const satisfies Issue[]
