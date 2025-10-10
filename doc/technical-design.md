# FlowCraft Technical Design

## Architecture Overview

FlowCraft is built as a modern single-page application using Next.js 14+ with the App Router, React 18+, and TypeScript.
The architecture follows a component-based design with unidirectional data flow and centralized state management.

### Technology Stack

**Core Framework**:

- Next.js 14+ (App Router)
- React 18+ (Client Components)
- TypeScript 5+

**Styling**:

- Tailwind CSS 4
- CSS-in-JS via Tailwind utilities
- Custom design tokens in globals.css

**UI Components**:

- Custom components based on shadcn/ui patterns
- Radix UI primitives (via shadcn/ui)
- Simplified implementations without external dependencies

**Build Tools**:

- Next.js built-in bundler
- TypeScript compiler
- PostCSS for CSS processing

## Application Structure

### Directory Layout

\`\`\`
flowcraft/
├── app/ # Next.js App Router
│ ├── layout.tsx # Root layout with providers
│ ├── page.tsx # Main application page (root component)
│ └── globals.css # Global styles and design tokens
├── components/ # React components
│ ├── ui/ # Reusable UI primitives
│ │ ├── button.tsx
│ │ ├── card.tsx
│ │ ├── dialog.tsx
│ │ ├── badge.tsx
│ │ └── ...
│ ├── navigation.tsx # Top navigation bar
│ ├── issues-list.tsx # Issues list view
│ ├── issue-card.tsx # Individual issue card
│ ├── issue-form.tsx # Issue create/edit form
│ ├── issue-assignment-dialog.tsx # Sprint assignment dialog
│ ├── current-sprint-view.tsx # Current sprint view
│ ├── kanban-board.tsx # Kanban board component
│ ├── sprints-view.tsx # Sprints list view
│ ├── sprint-card.tsx # Individual sprint card
│ └── sprint-form.tsx # Sprint create/edit form
├── types/ # TypeScript type definitions
│ └── index.ts # Core types (Issue, Sprint, etc.)
├── lib/ # Utility functions and data
│ ├── data.ts # Initial data and utilities
│ └── utils.ts # Helper functions (cn, etc.)
├── hooks/ # Custom React hooks
│ └── use-mobile.ts # Mobile detection hook
├── public/ # Static assets
│ └── *.png, *.svg # Images and icons
└── package.json # Dependencies and scripts
\`\`\`

### Component Hierarchy

\`\`\`
App (page.tsx)
├── Navigation
│ └── View tabs with counts
├── IssuesList (when view === "issues")
│ ├── IssueForm (create dialog)
│ └── IssueCard (multiple)
│ ├── IssueForm (edit dialog)
│ ├── IssueAssignmentDialog
│ └── DropdownMenu (actions)
├── CurrentSprintView (when view === "current-sprint")
│ └── KanbanBoard
│ └── IssueCard (multiple, in columns)
└── SprintsView (when view === "sprints")
├── SprintForm (create dialog)
└── SprintCard (multiple)
├── SprintForm (edit dialog)
└── DropdownMenu (actions)
\`\`\`

## Data Architecture

### Type System

**Core Types** (`types/index.ts`):

\`\`\`typescript
// Priority levels for issues
type Priority = "P0" | "P1" | "P2" | "P3" | "P4" | "P5"

// Issue workflow statuses
type IssueStatus = "Todo" | "In Progress" | "In Review" | "Done"

// Sprint lifecycle statuses
type SprintStatus = "Planned" | "Active" | "Completed"

// Main issue entity
interface Issue {
id: string // Auto-generated (TSK-001, TSK-002, etc.)
title: string // Issue title
description: string // Detailed description
priority: Priority // Priority level
status: IssueStatus // Current status
assignee: string // Assigned person name
sprintId?: string // Optional sprint assignment
createdAt: Date // Creation timestamp
updatedAt: Date // Last update timestamp
}

// Main sprint entity
interface Sprint {
id: string // Unique identifier
name: string // Sprint name
status: SprintStatus // Current status
startDate: Date // Sprint start date
endDate: Date // Sprint end date
createdAt: Date // Creation timestamp
updatedAt: Date // Last update timestamp
}

// View navigation type
type ViewType = "issues" | "current-sprint" | "sprints"
\`\`\`

### State Management

**Root State** (in `app/page.tsx`):

\`\`\`typescript
const [currentView, setCurrentView] = useState<ViewType>("issues")
const [issues, setIssues] = useState<Issue[]>(initialIssues)
const [sprints, setSprints] = useState<Sprint[]>(initialSprints)
\`\`\`

**State Flow**:

1. Root component maintains all application state
2. State passed down to child components via props
3. Mutation callbacks passed down for state updates
4. Child components call callbacks to trigger state changes
5. State updates flow back down through props

**State Update Pattern**:
\`\`\`typescript
// Immutable update pattern used throughout
setIssues(issues.map(issue =>
issue.id === targetId
? { ...issue, ...updates, updatedAt: new Date() }
: issue
))
\`\`\`

### Data Layer

**Data Utilities** (`lib/data.ts`):

- `generateTaskId()` - Auto-increment task IDs
- `priorityColors` - Priority to Tailwind class mapping
- `statusColors` - Status to Tailwind class mapping
- `initialIssues` - Sample issue data (16 issues)
- `initialSprints` - Sample sprint data (3 sprints)

**Data Relationships**:

- Issues reference Sprints via `sprintId` (optional foreign key)
- One Sprint can have many Issues
- Issues without `sprintId` are in the backlog
- Only one Sprint can be "Active" at a time

## Component Design Patterns

### Form Components

**Pattern**: Controlled components with local state and validation

\`\`\`typescript
// Example: IssueForm
const [formData, setFormData] = useState({...})
const [errors, setErrors] = useState({})

const validateForm = () => { /* validation logic */ }
const handleSubmit = (e) => {
e.preventDefault()
if (!validateForm()) return
onSubmit(formData)
setOpen(false)
}
\`\`\`

**Features**:

- Local form state management
- Client-side validation before submission
- Error display inline with fields
- Reset on successful submission
- Dual mode (create/edit) based on props

### Dialog Components

**Pattern**: Controlled dialogs with trigger customization

\`\`\`typescript
const [open, setOpen] = useState(false)

<Dialog open={open} onOpenChange={setOpen}>
  <DialogTrigger asChild>
    {trigger || <Button>Default Trigger</Button>}
  </DialogTrigger>
  <DialogContent>
    {/* Form or content */}
  </DialogContent>
</Dialog>
\`\`\`

**Features**:

- Controlled open state
- Custom trigger support
- Automatic close on success
- Form reset on close

### List Components

**Pattern**: Filtered rendering with empty states

\`\`\`typescript
const filteredItems = items.filter(/* filter logic */)

return (
  <div>
    {filteredItems.map(item => <ItemCard key={item.id} {...item} />)}
    {filteredItems.length === 0 && <EmptyState />}
  </div>
)
\`\`\`

**Features**:

- Stable keys for list items
- Empty state handling
- Filtering before render
- Action callbacks passed to children

### Card Components

**Pattern**: Display with action menu

\`\`\`typescript
<Card>
<CardHeader>
<div className="flex justify-between">
<div>{/* Main content */}</div>
<DropdownMenu>
{/* Actions */}
</DropdownMenu>
</div>
</CardHeader>
<CardContent>
{/* Details */}
</CardContent>
</Card>
\`\`\`

**Features**:

- Consistent card structure
- Action menu in header
- Visual hierarchy with typography
- Hover states for interactivity

## Styling Architecture

### Design Token System

**Global Tokens** (`app/globals.css`):

\`\`\`css
@theme inline {
--background: #ffffff;
--foreground: #0a0a0a;
--card: #ffffff;
--card-foreground: #0a0a0a;
--primary: #0a0a0a;
--primary-foreground: #fafafa;
/* ... more tokens */
}
\`\`\`

**Usage**:

- Semantic color names (background, foreground, primary, etc.)
- Consistent spacing scale (4, 6, 8, 12, 16, 24)
- Border radius values (sm, md, lg)
- Typography scale (text-sm, text-base, text-lg, etc.)

### Color System

**Priority Colors**:

- P0: Red (Critical)
- P1: Orange (High)
- P2: Yellow (Medium)
- P3: Blue (Normal)
- P4: Green (Low)
- P5: Gray (Lowest)

**Status Colors**:

- Todo: Gray
- In Progress: Blue
- In Review: Yellow
- Done: Green

**Sprint Status Colors**:

- Planned: Blue
- Active: Green
- Completed: Gray

### Responsive Design

**Breakpoints** (Tailwind defaults):

- sm: 640px
- md: 768px
- lg: 1024px
- xl: 1280px
- 2xl: 1536px

**Patterns**:

- Mobile-first approach
- Responsive grid layouts (grid-cols-1 md:grid-cols-2 lg:grid-cols-4)
- Responsive spacing and typography
- Collapsible navigation on mobile

## Data Flow Patterns

### Issue CRUD Operations

**Create**:
\`\`\`
User clicks "Create Issue"
→ IssueForm opens
→ User fills form
→ Form validates
→ handleCreateIssue() called
→ New issue added to state
→ UI re-renders with new issue
\`\`\`

**Read**:
\`\`\`
Issues state
→ Passed to IssuesList
→ Filtered/sorted
→ Mapped to IssueCard components
→ Rendered in UI
\`\`\`

**Update**:
\`\`\`
User clicks "Edit" on IssueCard
→ IssueForm opens with issue data
→ User modifies form
→ Form validates
→ handleEditIssue() called
→ Issue updated in state
→ UI re-renders with updated issue
\`\`\`

**Delete**:
\`\`\`
User clicks "Delete" on IssueCard
→ handleDeleteIssue() called
→ Issue removed from state
→ UI re-renders without issue
\`\`\`

### Sprint Lifecycle

**Creation**:
\`\`\`
User creates sprint
→ Status: "Planned"
→ Added to sprints state
\`\`\`

**Activation**:
\`\`\`
User clicks "Start Sprint"
→ handleStartSprint() called
→ Status changed to "Active"
→ Only one sprint can be active
\`\`\`

**Completion**:
\`\`\`
User clicks "End Sprint"
→ handleEndSprint() called
→ Unfinished issues moved to backlog
→ Status changed to "Completed"
\`\`\`

## Performance Considerations

### Optimization Strategies

**Component Rendering**:

- Minimal re-renders through proper state structure
- Stable keys for list items
- Avoid inline function definitions in JSX
- Use React.memo for expensive components (future)

**Data Operations**:

- Filter/sort operations before render
- Avoid nested loops in render
- Use efficient array methods (map, filter)

**Bundle Size**:

- Simplified UI components without heavy dependencies
- Tree-shaking enabled by default
- No drag-and-drop library (simplified to dropdowns)

### Future Optimizations

- Implement virtual scrolling for large lists
- Add pagination for issues/sprints
- Use React.memo and useMemo for expensive computations
- Implement code splitting for views
- Add service worker for offline support

## Error Handling

### Validation Errors

**Form Validation**:

- Client-side validation before submission
- Inline error messages below fields
- Red border on invalid fields
- Prevent submission until valid

**Data Validation**:

- Type checking via TypeScript
- Runtime validation in handlers
- Graceful fallbacks for missing data

### Future Error Handling

- API error handling (when backend added)
- Network error recovery
- Optimistic updates with rollback
- Error boundary components
- Toast notifications for errors

## Testing Strategy

### Current State

- No automated tests currently implemented
- Manual testing through UI interaction

### Recommended Testing Approach

**Unit Tests**:

- Test utility functions (generateTaskId, etc.)
- Test data transformations
- Test validation logic

**Component Tests**:

- Test form submissions
- Test CRUD operations
- Test state updates
- Test empty states

**Integration Tests**:

- Test complete user workflows
- Test navigation between views
- Test sprint lifecycle
- Test issue assignment

**E2E Tests**:

- Test critical user paths
- Test data persistence (when added)
- Test responsive behavior

## Deployment Architecture

### Current Setup

- Static export compatible
- No server-side rendering required
- All client-side rendering

### Production Considerations

**Hosting Options**:

- Vercel (recommended for Next.js)
- Netlify
- AWS Amplify
- Any static hosting

**Environment Variables**:

- None currently required
- Will need API URLs when backend added

**Build Process**:
\`\`\`bash
npm run build # Production build
npm run start # Production server
\`\`\`

## Future Architecture Enhancements

### Backend Integration

**API Layer**:

- RESTful API or GraphQL
- Authentication/authorization
- Data persistence (PostgreSQL, MongoDB)
- Real-time updates (WebSockets)

**State Management**:

- Consider React Query for server state
- Keep local UI state in components
- Optimistic updates with cache invalidation

### Advanced Features

**Real-time Collaboration**:

- WebSocket connection
- Operational transformation for conflicts
- Presence indicators
- Live cursors

**Analytics**:

- Sprint velocity tracking
- Burndown charts
- Team performance metrics
- Custom reporting

**Extensibility**:

- Plugin system for custom fields
- Webhook integrations
- API for third-party tools
- Custom workflow definitions
