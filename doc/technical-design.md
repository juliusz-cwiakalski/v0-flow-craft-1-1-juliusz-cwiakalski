# FlowCraft Technical Design

## Architecture Overview

This document describes the technical design of the enhanced FlowCraft prototype. This project builds upon the [FlowCraft v1.0 base application](https://go.kaca.la/v0-flowcraft-1.0) provided by Piotr Kacała for the AI Product Heroes course.

FlowCraft is built as a modern single-page application using Next.js 14+ with the App Router, React 18+, and TypeScript. The architecture follows a component-based design with unidirectional data flow and centralized state management via Redux Toolkit.

### Technology Stack

**Core Framework**:

- Next.js 14+ (App Router)
- React 18+ (Client Components)
- TypeScript 5+

**State Management**:

- Redux Toolkit
- React-Redux

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
├── app/                      # Next.js App Router
│   ├── layout.tsx            # Root layout with Redux Provider
│   ├── page.tsx              # Main application page (root component)
│   └── globals.css           # Global styles and design tokens
├── components/               # React components
│   ├── ui/                   # Reusable UI primitives
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── badge.tsx
│   │   └── ...
│   ├── dashboard/            # Dashboard-specific components
│   │   ├── dashboard-view.tsx
│   │   ├── status-breakdown-card.tsx
│   │   ├── active-sprint-progress-card.tsx
│   │   ├── throughput-card.tsx
│   │   └── workload-by-assignee-card.tsx
│   ├── navigation.tsx        # Top navigation bar
│   ├── scope-filters.tsx     # Project/Team filter controls
│   ├── issues-list.tsx       # Issues list view
│   ├── issue-card.tsx        # Individual issue card
│   ├── issue-form.tsx        # Issue create/edit form
│   ├── issue-assignment-dialog.tsx  # Sprint assignment dialog
│   ├── current-sprint-view.tsx      # Current sprint view
│   ├── kanban-board.tsx      # Kanban board component
│   ├── sprints-view.tsx      # Sprints list view
│   ├── sprint-card.tsx       # Individual sprint card
│   ├── sprint-form.tsx       # Sprint create/edit form
│   ├── quick-capture.tsx     # Quick Capture modal
│   ├── changelog-panel.tsx   # Changelog view
│   └── whats-new-modal.tsx   # What's New modal
├── types/                    # TypeScript type definitions
│   └── index.ts              # Core types (Issue, Sprint, Project, Team, etc.)
├── lib/                      # Utility functions and data
│   ├── redux/                # Redux store and slices
│   │   ├── store.ts
│   │   ├── provider.tsx
│   │   └── slices/
│   │       ├── issuesSlice.ts
│   │       ├── sprintsSlice.ts
│   │       ├── projectsSlice.ts
│   │       ├── teamsSlice.ts
│   │       ├── preferencesSlice.ts
│   │       └── uiSlice.ts
│   ├── data.ts               # Initial data and utilities
│   ├── dashboard-utils.ts    # Dashboard metric derivation functions
│   ├── changelog.ts          # Changelog data and version tracking
│   ├── telemetry.ts          # Telemetry adapter (console-based)
│   ├── user.ts               # User utilities (current user)
│   └── utils.ts              # Helper functions (cn, etc.)
├── hooks/                    # Custom React hooks
│   ├── use-mobile.ts         # Mobile detection hook
│   └── use-toast.ts          # Toast notification hook
├── public/                   # Static assets
│   └── *.png, *.svg          # Images and icons
└── package.json              # Dependencies and scripts
\`\`\`

### Component Hierarchy

\`\`\`
App (page.tsx) - Connects to Redux store
├── Navigation
│   └── View tabs with counts
├── IssuesList (when view === "issues")
│   ├── IssueForm (create dialog)
│   └── IssueCard (multiple)
│       ├── IssueForm (edit dialog)
│       ├── IssueAssignmentDialog
│       └── DropdownMenu (actions)
├── CurrentSprintView (when view === "current-sprint")
│   └── KanbanBoard
│       └── IssueCard (multiple, in columns)
├── SprintsView (when view === "sprints")
│   ├── SprintForm (create dialog)
│   └── SprintCard (multiple)
│       ├── SprintForm (edit dialog)
│       └── DropdownMenu (actions)
├── DashboardView (when view === "dashboard")
│   ├── ScopeFilters
│   ├── StatusBreakdownCard
│   ├── ActiveSprintProgressCard
│   ├── ThroughputCard
│   └── WorkloadByAssigneeCard
├── ChangelogPanel (when view === "changelog")
├── QuickCapture (modal)
└── WhatsNewModal (modal)
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

// Time range presets for dashboard
type TimeRangePreset = "7d" | "14d" | "30d" | "custom"

// Main issue entity
interface Issue {
  id: string                    // Auto-generated (TSK-001, TSK-002, etc.)
  title: string                 // Issue title
  description: string           // Detailed description
  priority: Priority            // Priority level
  status: IssueStatus           // Current status
  assignee: string              // Assigned person name
  sprintId?: string             // Optional sprint assignment
  projectId?: string            // Optional project assignment
  teamId?: string               // Optional team assignment
  templateId?: "bug" | "feature" | "request"  // Template used
  acceptanceCriteria?: AcceptanceCriterion[]  // AC items
  statusChangeHistory?: StatusChangeEntry[]   // Status transitions
  createdAt: Date               // Creation timestamp
  updatedAt: Date               // Last update timestamp
}

// Acceptance Criterion item
interface AcceptanceCriterion {
  id: string                    // Unique AC ID
  text: string                  // AC description
  done: boolean                 // Completion status
}

// Status change tracking for throughput
interface StatusChangeEntry {
  from: IssueStatus | "Created" // Previous status
  to: IssueStatus               // New status
  atISO: string                 // ISO timestamp
}

// Main sprint entity
interface Sprint {
  id: string                    // Unique identifier
  name: string                  // Sprint name
  status: SprintStatus          // Current status
  startDate: Date               // Sprint start date
  endDate: Date                 // Sprint end date
  createdAt: Date               // Creation timestamp
  updatedAt: Date               // Last update timestamp
}

// Project entity
interface Project {
  id: string                    // Unique identifier
  name: string                  // Project name
  createdAt: Date               // Creation timestamp
}

// Team entity
interface Team {
  id: string                    // Unique identifier
  name: string                  // Team name
  createdAt: Date               // Creation timestamp
}

// Dashboard time range
interface DashboardTimeRange {
  preset: TimeRangePreset       // Selected preset
  fromISO?: string              // Custom start date (ISO)
  toISO?: string                // Custom end date (ISO)
}

// User preferences
interface PreferencesState {
  selectedProjectIds: string[]  // Active project filters
  selectedTeamIds: string[]     // Active team filters
  lastUsedProjectId?: string    // Last selected project
  lastUsedTeamId?: string       // Last selected team
  dashboardTimeRange: DashboardTimeRange  // Dashboard time range
}

// View navigation type
type ViewType = "issues" | "current-sprint" | "sprints" | "changelog" | "dashboard"
\`\`\`

### State Management

**Core Principle**: Redux Toolkit as the sole, centralized state management solution (ADR-0008). All application state is managed through Redux slices with immutable updates via Immer.

**Store Structure** (`lib/redux/store.ts`):

\`\`\`typescript
{
  issues: IssuesState,          // Issue entities and operations
  sprints: SprintsState,        // Sprint entities and lifecycle
  projects: ProjectsState,      // Project entities
  teams: TeamsState,            // Team entities
  preferences: PreferencesState, // User preferences and filters
  ui: UIState                   // UI state (view, modals)
}
\`\`\`

**Redux Slices**:

1. **issuesSlice** (`lib/redux/slices/issuesSlice.ts`)
   - Manages `issues` array
   - Actions: `addIssue`, `updateIssue`, `deleteIssue`, `updateIssueStatus`, `assignIssueToSprint`, `moveUnfinishedIssuesToBacklog`
   - Tracks status change history for throughput metrics
   - Seeds with initial sample data (16 issues)

2. **sprintsSlice** (`lib/redux/slices/sprintsSlice.ts`)
   - Manages `sprints` array
   - Actions: `addSprint`, `updateSprint`, `startSprint`, `endSprint`
   - Enforces single active sprint rule
   - Seeds with initial sample data (3 sprints)

3. **projectsSlice** (`lib/redux/slices/projectsSlice.ts`)
   - Manages `projects` array
   - Actions: `addProject`, `updateProject`, `deleteProject`
   - Seeds with default "Main Project"

4. **teamsSlice** (`lib/redux/slices/teamsSlice.ts`)
   - Manages `teams` array
   - Actions: `addTeam`, `updateTeam`, `deleteTeam`
   - Seeds with default "Main Team"

5. **preferencesSlice** (`lib/redux/slices/preferencesSlice.ts`)
   - Manages user preferences
   - Actions: `setSelectedProjects`, `setSelectedTeams`, `clearFilters`, `setDashboardTimeRange`, `setLastUsedProject`, `setLastUsedTeam`
   - Persists filter selections across views
   - Default time range: 7 days

6. **uiSlice** (`lib/redux/slices/uiSlice.ts`)
   - Manages UI state
   - Actions: `setCurrentView`, `setShowWhatsNew`, `setShowQuickCapture`, `setHasUnseenUpdates`
   - Controls modal visibility and view navigation

**Data Flow**:

1. Redux `Provider` wraps the application in `app/layout.tsx`
2. Components use `useSelector` hook to read state
3. Components use `useDispatch` hook to dispatch actions
4. Reducers handle actions and produce new state immutably (via Immer)
5. UI re-renders automatically on state changes

**Example Action Dispatch**:
\`\`\`typescript
// In a component
import { useDispatch } from 'react-redux';
import { deleteIssue } from '@/lib/redux/slices/issuesSlice';

const dispatch = useDispatch();
dispatch(deleteIssue(issueId));
\`\`\`

**State Persistence**:

- **localStorage** for specific data:
  - Last seen version (`flowcraft:lastSeenVersion`)
  - Last-used template (`flowcraft:lastUsedTemplate`)
- **Redux state** persists in memory during session
- Future: Redux middleware for full state persistence to localStorage
- Designed for easy migration to backend API (ADR-0008)

### Data Layer

**Data Utilities** (`lib/data.ts`):

- `generateTaskId()` - Auto-increment task IDs
- `priorityColors` - Priority to Tailwind class mapping
- `statusColors` - Status to Tailwind class mapping
- `initialIssues` - Sample issue data (16 issues)
- `initialSprints` - Sample sprint data (3 sprints)
- `ISSUE_TEMPLATES` - Template definitions (Bug, Feature, Request)
- `getLastUsedTemplate()` - Retrieve last-used template from localStorage
- `setLastUsedTemplate()` - Save last-used template to localStorage
- `getDefaultTemplate()` - Get default template (Feature)

**Dashboard Utilities** (`lib/dashboard-utils.ts`):

- `applyScopeFilters(issues, projectIds, teamIds)` - Filter issues by scope
- `deriveCountsByStatus(issues)` - Count issues by status
- `deriveActiveSprintProgress(issues, sprints)` - Calculate sprint completion %
- `deriveThroughput(issues, timeRange)` - Count issues closed in time range
- `deriveWorkloadByAssignee(issues, topN)` - Top N assignees by issue count

**Changelog Utilities** (`lib/changelog.ts`):

- `APP_VERSION` - Current app version
- `releases` - Release history with items
- `getLastSeenVersion()` - Retrieve last seen version from localStorage
- `setLastSeenVersion()` - Save last seen version to localStorage
- `hasUnseenUpdates()` - Check if current version is unseen
- `getLatestRelease()` - Get most recent release

**Telemetry Utilities** (`lib/telemetry.ts`):

- `telemetry.track(event, properties)` - Console-based event tracking
- `trackEvent(event, properties)` - Convenience wrapper
- Events: `quick_capture_opened`, `template_selected`, `issue_created_via_quick_capture`, `dashboard_view_opened`, `dashboard_time_range_changed`, etc.

**Data Relationships**:

- Issues reference Sprints via `sprintId` (optional foreign key)
- Issues reference Projects via `projectId` (optional foreign key)
- Issues reference Teams via `teamId` (optional foreign key)
- One Sprint can have many Issues
- One Project can have many Issues
- One Team can have many Issues
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
- Red border on invalid fields
- Prevent submission until valid

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

### Dashboard Metric Cards

**Pattern**: Pure derivation from Redux state

\`\`\`typescript
// In DashboardView
const scopedIssues = applyScopeFilters(issues, selectedProjectIds, selectedTeamIds)
const statusBreakdown = deriveCountsByStatus(scopedIssues)

<StatusBreakdownCard data={statusBreakdown} />
\`\`\`

**Features**:

- Pure functions for metric calculation
- No new state storage
- Real-time updates on data changes
- Scope filtering applied before derivation
- Empty states for missing data

## Dashboard Architecture

### Metric Derivation

**Principle**: All dashboard metrics are derived from existing Redux state (issues, sprints) using pure functions. No new data storage is required.

**Derivation Functions** (`lib/dashboard-utils.ts`):

1. **applyScopeFilters(issues, projectIds, teamIds)**
   - Filters issues by selected projects and teams
   - Returns filtered issue array
   - Used as input for all other metrics

2. **deriveCountsByStatus(issues)**
   - Counts issues by status (Todo, In Progress, In Review, Done)
   - Returns: `{ todo: number, inProgress: number, inReview: number, done: number, total: number }`

3. **deriveActiveSprintProgress(issues, sprints)**
   - Finds active sprint
   - Counts Done vs Total issues in sprint
   - Returns: `{ sprintName: string, completionPercent: number, doneCount: number, totalCount: number, startDate: Date, endDate: Date } | null`

4. **deriveThroughput(issues, timeRange)**
   - Filters issues with status change history
   - Counts issues that transitioned to "Done" within time range
   - Uses `statusChangeHistory` field
   - Returns: `{ count: number, timeRangeLabel: string }`

5. **deriveWorkloadByAssignee(issues, topN)**
   - Groups issues by assignee
   - Counts issues per assignee
   - Sorts descending and takes top N
   - Returns: `Array<{ assignee: string, count: number }>`

### Scope Filtering

**Cross-View Filtering**:

- Project and Team filters apply to Issues, Current Sprint, and Dashboard views
- Filter selections persist in Redux `preferences` slice
- `applyScopeFilters()` function used consistently across views
- "Clear Filters" button resets all filters at once

**Filter Persistence**:

- Selections stored in Redux `preferences.selectedProjectIds` and `preferences.selectedTeamIds`
- Survives view navigation within session
- Lost on page refresh (future: persist to localStorage)

### Time Range Controls

**Presets**:

- Last 7 days (default)
- Last 14 days
- Last 30 days
- Custom (future enhancement)

**Scope**:

- Only affects Throughput metric
- Uses `statusChangeHistory` to filter status transitions within range
- Other metrics use all-time data

**Persistence**:

- Selected range stored in Redux `preferences.dashboardTimeRange`
- Survives view navigation within session

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
- Responsive grid layouts (grid-cols-1 md:grid-cols-2)
- Responsive spacing and typography
- Collapsible navigation on mobile

## Data Flow Patterns

### Issue CRUD Operations

**Create**:
\`\`\`
User clicks "Create Issue" or presses Q
→ IssueForm or QuickCapture opens
→ User fills form (optionally selects template)
→ Form validates
→ Dispatches `addIssue` action with form data
→ Redux `issuesSlice` reducer adds issue with auto-generated ID
→ UI re-renders with new issue
→ Toast notification appears with deep-link
\`\`\`

**Read**:
\`\`\`
Component connects to Redux store
→ Reads `issues` state using `useSelector`
→ Optionally filters by scope (project/team)
→ Filtered/sorted in the component
→ Mapped to IssueCard components
→ Rendered in UI
\`\`\`

**Update**:
\`\`\`
User clicks "Edit" on IssueCard
→ IssueForm opens with issue data
→ User modifies form
→ Form validates
→ Dispatches `updateIssue` action with updated data
→ Redux `issuesSlice` reducer updates issue
→ UI re-renders with updated issue
\`\`\`

**Delete**:
\`\`\`
User clicks "Delete" on IssueCard
→ Dispatches `deleteIssue` action with issue ID
→ Redux `issuesSlice` reducer removes issue
→ UI re-renders without issue
\`\`\`

### Sprint Lifecycle

**Creation**:
\`\`\`
User creates sprint
→ Dispatches `addSprint` action with sprint data
→ Reducer sets status to "Planned"
→ Redux store updates
\`\`\`

**Activation**:
\`\`\`
User clicks "Start Sprint"
→ Dispatches `startSprint` action with sprint ID
→ Reducer changes status to "Active"
→ Only one sprint can be active (enforced in reducer logic)
\`\`\`

**Completion**:
\`\`\`
User clicks "End Sprint"
→ Dispatches `moveUnfinishedIssuesToBacklog` action
→ `issuesSlice` reducer clears `sprintId` for unfinished issues
→ Dispatches `endSprint` action
→ `sprintsSlice` reducer changes status to "Completed"
\`\`\`

### Dashboard Metric Updates

**Flow**:
\`\`\`
User changes filter or time range
→ Dispatches `setSelectedProjects`, `setSelectedTeams`, or `setDashboardTimeRange`
→ Redux `preferences` slice updates
→ DashboardView re-renders
→ Calls derivation functions with new filters
→ Metric cards re-render with updated data
\`\`\`

**Real-time Updates**:
\`\`\`
User creates/updates/deletes issue
→ Redux `issues` slice updates
→ All connected components re-render
→ Dashboard metrics recalculate automatically
→ No manual refresh needed
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
- Use efficient array methods (map, filter, reduce)
- Pure derivation functions for dashboard metrics

**Bundle Size**:

- Simplified UI components without heavy dependencies
- Tree-shaking enabled by default
- No drag-and-drop library (simplified to dropdowns)
- Minimal external dependencies

### Future Optimizations

- Implement virtual scrolling for large lists
- Add pagination for issues/sprints
- Use React.memo and useMemo for expensive computations
- Implement code splitting for views
- Add service worker for offline support
- Memoize dashboard derivation functions

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

- Test utility functions (generateTaskId, derivation functions, etc.)
- Test data transformations
- Test validation logic
- Test Redux reducers

**Component Tests**:

- Test form submissions
- Test CRUD operations
- Test state updates
- Test empty states
- Test dashboard metric cards

**Integration Tests**:

- Test complete user workflows
- Test navigation between views
- Test sprint lifecycle
- Test issue assignment
- Test scope filtering across views

**E2E Tests**:

- Test critical user paths
- Test data persistence (when added)
- Test responsive behavior
- Test deep-linking

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
npm run build  # Production build
npm run start  # Production server
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
- Redux for client-side preferences

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
- Export to CSV/PDF

**Extensibility**:

- Plugin system for custom fields
- Webhook integrations
- API for third-party tools
- Custom workflow definitions
