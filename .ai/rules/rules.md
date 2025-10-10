# FlowCraft Coding Rules

This document outlines the coding standards and best practices for the FlowCraft project, adhering to v0 guidelines for creating consistent, maintainable code.

## General Principles

### Software Design Principles
- SOLID principles:
  - Single Responsibility: Each module/class/function should have a single, clear reason to change.
  - Open/Closed: Entities should be open for extension but closed for modification.
  - Liskov Substitution: Subtypes must be substitutable for their base types without breaking behavior.
  - Interface Segregation: Prefer small, focused interfaces over large, catch-all ones.
  - Dependency Inversion: Depend on abstractions, not concretions.
- DRY: Eliminate duplication by extracting reusable helpers/components and centralizing shared logic and types.
- KISS: Favor simple, straightforward solutions over clever or overly abstract designs.
- YAGNI: Implement only what is necessary now; avoid speculative generality and premature abstractions.
- Separation of Concerns: Isolate domain logic, presentation, and data access; minimize coupling between layers.
- Immutability & Pure Functions: Prefer pure, side-effect-free functions and immutable data; isolate effects at boundaries.
- Clean Code (Uncle Bob) guidelines:
  - Use meaningful, descriptive names; avoid abbreviations and misleading terms.
  - Keep functions small and at a single level of abstraction.
  - Avoid magic numbers/strings; extract constants or enums.
  - Return early to reduce nesting and improve readability.
  - Remove dead/commented-out code; write comments for "why", not "what".

### Architectural Structure
- Feature-sliced organization:
  - Group files by feature/domain.
  - Keep components, hooks, utilities, and types local to the feature.
  - Expose a minimal public API (e.g., index.ts) for cross-feature consumption.
- Boundaries and dependencies:
  - Avoid cyclic dependencies.
  - Cross-feature imports must go through the feature’s public API, not deep internal paths.
  - Place cross-cutting utilities in dedicated shared modules with clear ownership.
- Composition over inheritance: Build complex behavior by composing small units rather than deep hierarchies.
- Encapsulation: Hide implementation details; export minimal interfaces and types.

### Code Organization
- **Component Structure**: Split code into multiple, focused components rather than large monolithic files
- **File Naming**: Use kebab-case for file names (e.g., `issue-card.tsx`, `sprint-form.tsx`)
- **Directory Structure**: Organize files by feature/domain (components, types, lib, hooks)
- **Single Responsibility**: Each component should have one clear purpose

### TypeScript Standards
- **Type Safety**: Always use explicit types, avoid `any`
- **Type Definitions**: Define all types in `types/index.ts` for reusability
- **Interface Naming**: Use PascalCase for interfaces (e.g., `Issue`, `Sprint`)
- **Type Exports**: Export types alongside their related functions

## React & Next.js Best Practices

### Component Guidelines
- **Client Components**: Use `"use client"` directive for components with interactivity
- **Server Components**: Default to server components when possible (no client-side state)
- **Props Interface**: Define explicit props interfaces for all components
- **Default Props**: Provide sensible defaults for optional props

### State Management
- **Local State**: Use `useState` for component-local state
- **State Lifting**: Lift state to the nearest common ancestor when shared
- **Immutability**: Always create new objects/arrays when updating state
- **State Updates**: Include `updatedAt` timestamp when modifying entities

### Hooks Usage
- **Custom Hooks**: Extract reusable logic into custom hooks (prefix with `use`)
- **Effect Dependencies**: Always specify complete dependency arrays
- **Cleanup**: Return cleanup functions from effects when needed

## Styling Guidelines

### Tailwind CSS
- **Utility-First**: Use Tailwind utility classes for all styling
- **Semantic Classes**: Prefer semantic design tokens (bg-background, text-foreground)
- **Responsive Design**: Use responsive prefixes (md:, lg:) for breakpoints
- **Spacing Scale**: Use Tailwind spacing scale (p-4, gap-6) over arbitrary values
- **Color System**: Use predefined color mappings from `lib/data.ts`

### Layout Patterns
- **Flexbox First**: Use flexbox for most layouts (`flex items-center justify-between`)
- **Grid for 2D**: Use CSS Grid only for complex two-dimensional layouts
- **Gap Classes**: Prefer `gap-*` classes over margin for spacing between items
- **Avoid Mixing**: Never mix margin/padding with gap classes on the same element

### Component Styling
- **Consistent Spacing**: Use consistent spacing scale throughout (4, 6, 8, 12, 16)
- **Border Radius**: Use consistent border radius values
- **Shadows**: Apply shadows sparingly for depth (hover states, cards)
- **Transitions**: Add smooth transitions for interactive elements

## Data Management

### Data Flow
- **Props Down**: Pass data down through props
- **Events Up**: Pass callbacks up for state changes
- **Single Source**: Maintain single source of truth for data
- **Derived State**: Calculate derived values rather than storing them

### Data Validation
- **Form Validation**: Validate all user inputs before submission
- **Error Handling**: Display clear, user-friendly error messages
- **Required Fields**: Mark required fields and validate them
- **Type Checking**: Validate data types at boundaries

### Data Mutations
- **Immutable Updates**: Never mutate state directly
- **Timestamp Updates**: Update `updatedAt` on all modifications
- **ID Generation**: Use consistent ID generation patterns
- **Optimistic Updates**: Update UI immediately, handle errors gracefully

## Component Patterns

### Form Components
- **Controlled Inputs**: Use controlled components for all form inputs
- **Form State**: Manage form state with `useState`
- **Validation State**: Track validation errors separately
- **Submit Handling**: Prevent default, validate, then submit
- **Reset on Success**: Clear form after successful submission

### Dialog/Modal Components
- **Open State**: Control dialog open state with `useState`
- **Trigger Props**: Accept custom trigger elements via props
- **Close on Success**: Close dialog after successful action
- **Form Reset**: Reset form state when dialog closes

### List Components
- **Key Props**: Always use stable, unique keys for list items
- **Empty States**: Show meaningful empty states when no data
- **Loading States**: Display loading indicators during async operations
- **Filtering**: Filter data before rendering, not in render

### Card Components
- **Consistent Structure**: Use consistent card structure across app
- **Action Menus**: Place actions in dropdown menus for cleanliness
- **Visual Hierarchy**: Use typography and spacing for hierarchy
- **Hover States**: Add subtle hover effects for interactivity

## Naming Conventions

### Variables & Functions
- **camelCase**: Use camelCase for variables and functions
- **Descriptive Names**: Use clear, descriptive names (avoid abbreviations)
- **Boolean Prefix**: Prefix boolean variables with `is`, `has`, `should`
- **Handler Prefix**: Prefix event handlers with `handle` (e.g., `handleSubmit`)
- **Callback Prefix**: Prefix callback props with `on` (e.g., `onCreateIssue`)

### Components
- **PascalCase**: Use PascalCase for component names
- **Descriptive Names**: Name components after their purpose
- **Suffix Patterns**: Use consistent suffixes (Form, List, Card, View, Dialog)

### Constants
- **UPPER_SNAKE_CASE**: Use for true constants (rare in React)
- **camelCase Objects**: Use camelCase for configuration objects
- **Exported Constants**: Export reusable constants from `lib/data.ts`

## Code Quality

### Readability
- **Line Length**: Keep lines under 120 characters
- **Function Length**: Keep functions focused and under 50 lines
- **Nesting Depth**: Avoid deep nesting (max 3-4 levels)
- **Comments**: Add comments for complex logic, not obvious code
- **Whitespace**: Use whitespace to separate logical sections

### Performance
- **Avoid Inline Functions**: Extract functions defined in JSX
- **Memoization**: Use `useMemo` and `useCallback` for expensive operations
- **Lazy Loading**: Lazy load components when appropriate
- **Key Stability**: Use stable keys for list items

### Error Handling
- **Graceful Degradation**: Handle errors gracefully, don't crash
- **User Feedback**: Provide clear feedback for errors
- **Console Errors**: Log errors to console for debugging
- **Validation**: Validate data at boundaries

## File Structure Standards

### Component Files
\`\`\`typescript
// 1. Imports (React, external libs, internal components, types)
// 2. Type definitions (Props interface)
// 3. Component definition
// 4. Export
\`\`\`

### Utility Files
\`\`\`typescript
// 1. Imports
// 2. Type definitions
// 3. Constants
// 4. Helper functions
// 5. Exports
\`\`\`

## Testing Considerations

### Component Testing
- **Test Behavior**: Test what users see and do, not implementation
- **Accessibility**: Ensure components are accessible
- **Edge Cases**: Test empty states, error states, loading states
- **User Interactions**: Test form submissions, button clicks, etc.

## Accessibility

### Semantic HTML
- **Proper Elements**: Use semantic HTML elements (button, nav, main)
- **ARIA Labels**: Add ARIA labels where needed
- **Alt Text**: Provide alt text for images
- **Focus Management**: Manage focus for dialogs and modals

### Keyboard Navigation
- **Tab Order**: Ensure logical tab order
- **Keyboard Shortcuts**: Support keyboard shortcuts where appropriate
- **Focus Indicators**: Maintain visible focus indicators

## Documentation

### Code Comments
- **Why, Not What**: Explain why, not what the code does
- **Complex Logic**: Document complex algorithms or business logic
- **TODOs**: Mark incomplete work with TODO comments
- **Type Annotations**: Let TypeScript types serve as documentation

### Component Documentation
- **Props Description**: Document component props and their purpose
- **Usage Examples**: Provide usage examples for complex components
- **Edge Cases**: Document edge cases and limitations

## Version Control

### Commit Messages
- **Clear Messages**: Write clear, descriptive commit messages
- **Present Tense**: Use present tense ("Add feature" not "Added feature")
- **Scope**: Include scope when relevant (e.g., "feat(issues): add filtering")

### Code Review
- **Small Changes**: Keep changes focused and reviewable
- **Self Review**: Review your own code before submitting
- **Test Changes**: Test all changes before committing
