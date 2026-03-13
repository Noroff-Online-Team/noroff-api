import type {
  GenerateRequest,
  ScaleRequest,
  SubstitutionsRequest
} from "./ai.schema"

const SUBSTITUTION_MAP: Record<
  string,
  Array<{ name: string; ratio: string; notes: string }>
> = {
  butter: [
    { name: "Coconut oil", ratio: "1:1", notes: "Works well in baking" },
    {
      name: "Olive oil",
      ratio: "3/4 cup per 1 cup butter",
      notes: "Best for savory dishes"
    },
    { name: "Applesauce", ratio: "1:1", notes: "Reduces fat, adds moisture" }
  ],
  egg: [
    {
      name: "Flax egg",
      ratio: "1 tbsp ground flax + 3 tbsp water per egg",
      notes: "Let sit 5 minutes to gel"
    },
    {
      name: "Banana",
      ratio: "1/4 cup mashed per egg",
      notes: "Adds sweetness"
    },
    {
      name: "Silken tofu",
      ratio: "1/4 cup blended per egg",
      notes: "Neutral flavor"
    }
  ],
  milk: [
    { name: "Oat milk", ratio: "1:1", notes: "Creamy texture, mild flavor" },
    { name: "Almond milk", ratio: "1:1", notes: "Lighter, slightly nutty" },
    { name: "Coconut milk", ratio: "1:1", notes: "Richer, adds coconut flavor" }
  ],
  flour: [
    {
      name: "Almond flour",
      ratio: "1:1",
      notes: "Gluten-free, higher protein"
    },
    { name: "Oat flour", ratio: "1:1", notes: "Slightly denser texture" },
    {
      name: "Coconut flour",
      ratio: "1/4 cup per 1 cup flour",
      notes: "Very absorbent, add more liquid"
    }
  ],
  sugar: [
    {
      name: "Honey",
      ratio: "3/4 cup per 1 cup sugar",
      notes: "Reduce other liquids slightly"
    },
    {
      name: "Maple syrup",
      ratio: "3/4 cup per 1 cup sugar",
      notes: "Adds maple flavor"
    },
    {
      name: "Stevia",
      ratio: "1 tsp per 1 cup sugar",
      notes: "Zero calories, much sweeter"
    }
  ],
  "sour cream": [
    { name: "Greek yogurt", ratio: "1:1", notes: "Lower fat, tangy" },
    {
      name: "Cottage cheese (blended)",
      ratio: "1:1",
      notes: "High protein alternative"
    }
  ],
  cream: [
    { name: "Coconut cream", ratio: "1:1", notes: "Dairy-free, rich" },
    {
      name: "Cashew cream",
      ratio: "1:1",
      notes: "Blend soaked cashews with water"
    }
  ],
  "soy sauce": [
    {
      name: "Coconut aminos",
      ratio: "1:1",
      notes: "Soy-free, slightly sweeter"
    },
    { name: "Tamari", ratio: "1:1", notes: "Gluten-free soy sauce" }
  ],
  "bread crumbs": [
    { name: "Crushed crackers", ratio: "1:1", notes: "Similar texture" },
    { name: "Rolled oats", ratio: "1:1", notes: "Healthier option" },
    { name: "Crushed cornflakes", ratio: "1:1", notes: "Adds crunch" }
  ],
  "heavy cream": [
    { name: "Coconut cream", ratio: "1:1", notes: "Good for whipping" },
    { name: "Evaporated milk", ratio: "1:1", notes: "Lower fat option" }
  ],
  garlic: [
    {
      name: "Garlic powder",
      ratio: "1/8 tsp per clove",
      notes: "Less pungent"
    },
    {
      name: "Shallots",
      ratio: "1 shallot per 2 cloves",
      notes: "Milder flavor"
    }
  ],
  onion: [
    {
      name: "Onion powder",
      ratio: "1 tsp per small onion",
      notes: "Convenient substitute"
    },
    { name: "Shallots", ratio: "1:1", notes: "Milder, slightly sweet" },
    { name: "Leeks", ratio: "1:1", notes: "Delicate onion flavor" }
  ],
  "vegetable oil": [
    { name: "Canola oil", ratio: "1:1", notes: "Neutral flavor" },
    {
      name: "Coconut oil (melted)",
      ratio: "1:1",
      notes: "Adds slight coconut flavor"
    },
    { name: "Avocado oil", ratio: "1:1", notes: "High smoke point" }
  ],
  "baking powder": [
    {
      name: "Baking soda + cream of tartar",
      ratio: "1/4 tsp soda + 1/2 tsp cream of tartar per 1 tsp",
      notes: "Mix fresh"
    },
    {
      name: "Self-rising flour",
      ratio: "Replace flour with self-rising",
      notes: "Already contains leavening"
    }
  ],
  cornstarch: [
    {
      name: "Arrowroot powder",
      ratio: "1:1",
      notes: "Clear finish when cooked"
    },
    {
      name: "Tapioca starch",
      ratio: "2 tbsp per 1 tbsp cornstarch",
      notes: "Slightly chewy texture"
    }
  ]
}

const DEFAULT_SUBSTITUTIONS = [
  {
    name: "Check specialty stores",
    ratio: "N/A",
    notes: "This ingredient may be available at specialty grocery stores"
  },
  {
    name: "Consult a cookbook",
    ratio: "N/A",
    notes: "Look for recipes that suggest alternatives for this ingredient"
  }
]

export function getSubstitutions(data: SubstitutionsRequest) {
  const key = data.ingredient.toLowerCase().trim()
  const substitutions = SUBSTITUTION_MAP[key] || DEFAULT_SUBSTITUTIONS

  return {
    data: {
      ingredient: data.ingredient,
      substitutions
    }
  }
}

export function scaleRecipe(data: ScaleRequest) {
  const scaleFactor = data.targetServings / data.originalServings

  const scaledIngredients = data.ingredients.map(ingredient => ({
    name: ingredient.name,
    originalQuantity: ingredient.quantity,
    scaledQuantity: Math.round(ingredient.quantity * scaleFactor * 100) / 100,
    unit: ingredient.unit
  }))

  const tips: string[] = []

  if (scaleFactor > 2) {
    tips.push(
      "When scaling up significantly, cooking times may need to be adjusted."
    )
    tips.push("Consider using a larger pan or cooking in batches.")
  }
  if (scaleFactor < 0.5) {
    tips.push(
      "When scaling down significantly, watch cooking times closely as food may cook faster."
    )
  }
  if (scaleFactor !== 1) {
    tips.push("Seasoning may need fine-tuning — taste and adjust as needed.")
  }

  return {
    data: {
      originalServings: data.originalServings,
      targetServings: data.targetServings,
      scaleFactor: Math.round(scaleFactor * 100) / 100,
      scaledIngredients,
      tips
    }
  }
}

export function generateRecipe(data: GenerateRequest) {
  const prompt = data.prompt

  return {
    data: {
      title: `AI-Generated: ${prompt}`,
      description: `A delicious recipe inspired by: "${prompt}". This recipe was generated based on your request and features a balanced combination of flavors and textures.`,
      prepTime: 15,
      cookTime: 30,
      servings: 4,
      difficulty: "Medium",
      category: "AI Generated",
      ingredients: [
        { name: "Main protein or base ingredient", quantity: 500, unit: "g" },
        { name: "Olive oil", quantity: 2, unit: "tbsp" },
        { name: "Garlic cloves", quantity: 3, unit: "pieces" },
        { name: "Onion", quantity: 1, unit: "medium" },
        { name: "Salt", quantity: 1, unit: "tsp" },
        { name: "Black pepper", quantity: 0.5, unit: "tsp" },
        { name: "Fresh herbs", quantity: 2, unit: "tbsp" },
        { name: "Lemon juice", quantity: 1, unit: "tbsp" }
      ],
      instructions: [
        "Prepare all ingredients by washing, peeling, and chopping as needed.",
        "Heat olive oil in a large pan over medium heat.",
        "Saute garlic and onion until fragrant, about 2-3 minutes.",
        "Add the main ingredient and cook until properly done.",
        "Season with salt, pepper, and fresh herbs.",
        "Finish with a squeeze of lemon juice.",
        "Let rest for 5 minutes before serving.",
        "Plate and garnish with additional fresh herbs."
      ],
      tags: ["ai-generated", "quick-meal"]
    }
  }
}
