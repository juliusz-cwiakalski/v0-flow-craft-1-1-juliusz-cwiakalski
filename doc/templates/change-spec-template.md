# CHANGE SPECIFICATION

## SUMMARY

Short description of the feature or modification.

## GOAL

What user or business goal does this feature (change) achieve?

## USER INPUT/OUTPUT FLOW

Describe how users or systems interact with this feature.

## AFFECTED COMPONENTS

- [MODIFY] `api/controllers/RecipeSearchController.java`
- [CREATE] `ui/components/QuickAddBar.tsx`
  (Include paths + notes)

## DECISIONS

- **Calorie filter behavior**
  - Options: exact match, min-max range, category buckets
  - ✅ Chosen: min-max range (more flexible for users)
- **Reuse vs. New UI Component**
  - Options: Modify `ProductCard`, Create `ProductCardV2`
  - ✅ Chosen: Create new (`ProductCardV2`) — avoids regressions in other views

## IMPLEMENTATION INSTRUCTIONS

- Add `QuickAddBar.tsx` and place it at the top of `GroceryListView.tsx`
- When user presses Enter, call `addItemToList(text)`
- Update search controller in backend to support filtering by tags and calorie range.
- Include new endpoint:

### Endpoint: `POST /api/recipes/search`

#### Request

\`\`\`json
{
  "tags": ["vegan", "low-carb"],
  "minCalories": 200,
  "maxCalories": 700
}
\`\`\`

#### Response

\`\`\`json
{
  "recipes": [{ "id": "r1", "title": "Vegan Stir Fry", "calories": 450 }]
}
\`\`\`

## AI CODING AGENT PROMPT

Implement the following changes in the backend recipe-search microservice:

- Extend the existing search logic in `RecipeSearchService` to support filtering by:
  - tags (combined with OR logic),
  - calorie range (`minCalories`, `maxCalories`)
- Modify `RecipeSearchController.java` to accept the new filter params
- Add a new endpoint: `POST /api/recipes/search`
- Use the example input/output JSON above to validate your logic
- Do not modify unrelated filters or features

## MERGE REQUEST TEMPLATE

Use the following for your merge request:

### Checkout Command

\`\`\`bash
git checkout -b <conventional commit compatible branch name using kebab case, start it with feat/feature-summary or refactor/ or fix/ etc>
\`\`\`

### Commit Message (used as MR title and description)

\`\`\`text
feat: Short summary of what is this change about

Longer, multiline description of this change that covers most important aspects of the change.
Use markdown formatting to provide more readable description.
\`\`\`
