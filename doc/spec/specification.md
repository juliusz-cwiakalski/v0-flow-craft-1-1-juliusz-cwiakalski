# FlowCraft Functional Specification

## Overview

FlowCraft is a modern task and sprint management application built with Next.js, React, and TypeScript. It provides a
comprehensive solution for managing issues, organizing sprints, and tracking project progress through multiple views.

## Core Features

### 1. Issue Management

**Description**: Complete CRUD operations for managing project issues/tasks with detailed metadata.

**Functionality**:

- Create new issues with title, description, priority, status, assignee, and optional sprint assignment
- Edit existing issues to update any field
- Delete issues from the system
- View all issues in a list format with filtering and sorting
- Assign issues to sprints or keep them in the backlog
- Track issue status through workflow stages (Todo → In Progress → In Review → Done)
- Manage Acceptance Criteria (AC) for each issue with completion tracking
- Use issue templates (Bug, Feature, Request) with pre-filled AC

**Components**:

- `components/issues-list.tsx` - Main list view displaying all issues
- `components/issue-card.tsx` - Individual issue card with actions menu and AC progress badge
- `components/issue-form.tsx` - Dialog form for creating/editing issues with AC management and template selection
- `components/issue-assignment-dialog.tsx` - Dialog for assigning issues to sprints

**Data Types**:

- `types/index.ts` - `Issue` interface (with `acceptanceCriteria` field), `Priority` type, `IssueStatus` type, `AcceptanceCriterion` interface, `IssueTemplate` interface

**Key Functions** (in `app/page.tsx`):

- `handleCreateIssue()` - Creates new issue
- `handleEditIssue()` - Updates existing issue
- `handleDeleteIssue()` - Removes issue
- `handleUpdateIssueStatus()` - Changes issue status
- `handleAssignToSprint()` - Assigns issue to sprint

**Priority Levels**:

- P0 (Critical) - Red
- P1 (High) - Orange
- P2 (Medium) - Yellow
- P3 (Normal) - Blue
- P4 (Low) - Green
- P5 (Lowest) - Gray

**Status Workflow**:

- Todo - Initial state
- In Progress - Work started
- In Review - Awaiting review
- Done - Completed

**Acceptance Criteria**:

- Each issue can have multiple AC items
- AC items have text description and completion status
- Issue cards display AC progress badge (e.g., "AC 2/3")
- Badge is green when all AC completed, hidden when no AC
- AC can be added, edited, removed, and checked off in Issue Form
- No maximum limit on AC items per issue

### 2. Sprint Management

**Description**: Organize work into time-boxed sprints with start/end dates and status tracking.

**Functionality**:

- Create new sprints with name and date range
- Edit sprint details (name, dates)
- Start sprints (change status from Planned to Active)
- End sprints (change status to Completed, move unfinished issues to backlog)
- View all sprints with their status and issue counts
- Track sprint progress and completion metrics

**Components**:

- `components/sprints-view.tsx` - Main view for all sprints
- `components/sprint-card.tsx` - Individual sprint card with actions
- `components/sprint-form.tsx` - Dialog form for creating/editing sprints

**Data Types**:

- `types/index.ts` - `Sprint` interface, `SprintStatus` type

**Key Functions** (in `app/page.tsx`):

- `handleCreateSprint()` - Creates new sprint
- `handleEditSprint()` - Updates sprint details
- `handleStartSprint()` - Activates a planned sprint
- `handleEndSprint()` - Completes sprint and handles unfinished issues

**Sprint Statuses**:

- Planned - Not yet started
- Active - Currently in progress (only one active at a time)
- Completed - Finished

### 3. Current Sprint View

**Description**: Focused view of the currently active sprint with Kanban board visualization.

**Functionality**:

- Display active sprint details (name, dates, progress)
- Show Kanban board with four columns (Todo, In Progress, In Review, Done)
- Drag-free status updates via dropdown selectors
- Real-time issue count per column
- Visual progress tracking
- Empty state when no active sprint
- Edit and delete issues directly from kanban cards
- View AC progress badges on kanban cards

**Components**:

- `components/current-sprint-view.tsx` - Main current sprint view
- `components/kanban-board.tsx` - Kanban board visualization with edit/delete actions

**Data Types**:

- Uses `Issue` and `Sprint` types

**Key Features**:

- Automatic filtering of issues by active sprint
- Status change via dropdown (simplified from drag-and-drop)
- Color-coded columns matching status colors
- Issue cards show priority, assignee, description, and AC progress
- Context menu for editing and deleting issues

### 4. Quick Capture

**Description**: Rapid issue creation with keyboard shortcut, deep-linking, and template support with last-used memory.

**Functionality**:

- Press Q key (when no input focused) to open Quick Capture modal
- Click "Quick Add" button in navigation to open modal
- Deep-link support: Visit `?open=quick-capture` to open modal automatically
- Select from three issue templates (Bug, Feature, Request)
- Templates pre-fill priority, status, and acceptance criteria
- Remembers last-used template across sessions (localStorage)
- Default template (Feature) used on first use
- Create issues in under 10 seconds
- Streamlined form with only essential fields
- Modal stays open after creation for rapid multi-add
- Dirty state confirmation when closing with unsaved changes
- Template conflict resolution - asks to overwrite or keep user values
- Contextual sprint prefill based on current view
- 6-second toast notification with deep-link to open created issue
- Telemetry tracking for usage analytics (console-logged)

**Components**:

- `components/quick-capture.tsx` - Quick Capture modal with template selection and state management

**Data Types**:

- `types/index.ts` - `IssueTemplate` interface (with `isDefault` flag)

**Templates**:

- **Bug Template**: P1 priority, Todo status, includes reproduction steps AC
- **Feature Template** (Default): P3 priority, Todo status, includes acceptance scenarios AC
- **Request Template**: P2 priority, Todo status, includes impact clarification AC

**Key Features**:

- Global keyboard shortcut (Q key) - guarded against input focus and open modals
- Deep-link activation - `?open=quick-capture` query parameter opens modal
- Template-based issue creation with smart defaults
- Last-used template memory - persisted in localStorage as `flowcraft:lastUsedTemplate`
- Default template fallback - Feature template marked with `isDefault: true`
- Pre-filled acceptance criteria from templates (preview-only in modal)
- Automatic assignee resolution: user input → template default → current user → empty
- Contextual sprint prefill: Issues view → none, Current Sprint → active sprint
- Multi-add workflow - modal stays open after creation
- Dirty state protection - confirms before closing with unsaved changes
- Template switching - asks to overwrite or keep when conflicts exist
- Toast notifications - 6-second duration with issue key, truncated title, and deep-link to open issue
- Deep-link to issue - `?open=issue&id={KEY}` opens issue edit modal directly
- Time-to-create tracking - measures from modal open to issue creation
- Telemetry events: `quick_capture_opened`, `template_selected`, `assignee_autofilled`, `issue_created_via_quick_capture`, `issue_opened_via_deeplink`

**Entry Points**:

1. **Keyboard shortcut**: Press Q (when no input focused, no modal open)
2. **Navigation button**: Click "Quick Add ⌨ Q" in top navigation
3. **Deep link**: Visit any URL with `?open=quick-capture` parameter
4. **Changelog CTA**: Click "Try Quick Capture" in What's New modal or Changelog panel

**Toast Notification**:

- Appears for 6 seconds after issue creation
- Format: "Issue {KEY} — {TitlePrefixEllipsized} created — Open"
- "Open" link uses deep-link `?open=issue&id={KEY}` to open issue edit modal
- Clicking link navigates to Issues view and opens edit modal for the created issue

**Data Utilities** (in `lib/data.ts`):

- `getLastUsedTemplate()` - Retrieves last-used template from localStorage
- `setLastUsedTemplate(templateId)` - Saves last-used template to localStorage
- `getDefaultTemplate()` - Returns default template ID (Feature)
- `ISSUE_TEMPLATES` - Template definitions with `isDefault` flag

**Telemetry** (in `lib/telemetry.ts`):

- Console-based tracking adapter for prototype
- Events: modal open (with source), template selection, assignee autofill, issue creation (with metrics)

### 5. Changelog & What's New

**Description**: Version tracking and feature announcement system with deep-linking support and multi-version display.

**Functionality**:

- Auto-opening "What's New" modal on version updates
- Display ALL unseen release notes in a single scrollable modal
- Show multiple versions when user hasn't seen updates (e.g., first-time users see all versions)
- Color-coded item types for each release
- Track last seen version in localStorage
- Badge indicator on navigation for unseen updates
- Dedicated changelog panel accessible from navigation
- Deep-linking to specific views from changelog items
- Deep-link CTAs - "Try Quick Capture" uses `?open=quick-capture` to open modal instantly

**Components**:

- `components/whats-new-modal.tsx` - Auto-opening modal for new releases with deep-link support and multi-version display
- `components/changelog-panel.tsx` - Full changelog history view with deep-link CTAs

**Data Files**:

- `lib/changelog.ts` - Release data, version tracking, localStorage utilities

**Data Types**:

- `types/index.ts` - `ViewType` includes 'changelog'
- `lib/changelog.ts` - `ReleaseItem` interface with `cta.href` for deep links, `Release` interface

**Release Item Types**:

- **New** (Green) - New features
- **Improved** (Blue) - Enhancements
- **Fixed** (Orange) - Bug fixes
- **Notice** (Purple) - Important announcements

**Key Features**:

- Automatic modal display on first load after version update
- **Multi-version display** - Shows ALL unseen versions in a single scrollable modal
- **First-time experience** - Users who have never seen the modal get all versions at once
- Version headers separate each release when showing multiple versions
- "Don't show again" option for current version
- Badge indicator on "What's New" button when updates unseen
- Deep-linking to relevant views from release items
- Deep-link CTAs - clickable links that open features directly (e.g., Quick Capture)
- "How to find" instructions for each feature
- Version history with dates
- Query parameter handling - `?open=quick-capture` opens Quick Capture modal
- Scrollable modal content (max-height: 80vh) to accommodate multiple versions

**Multi-Version Display Logic**:

- `getUnseenReleases()` returns array of all releases newer than last seen version
- If no version has been seen (first-time user), returns ALL releases
- Modal displays each release with version header, date, and items
- User can scroll through all unseen versions in one session
- Dismissing modal marks current version as seen, hiding all previous versions

**Deep-Link Implementation**:

- URL query parameter: `?open=quick-capture`
- Handled in `app/page.tsx` on mount and navigation
- Guards: checks for existing open modals before triggering
- Auto-clears parameter after opening to allow re-use
- Telemetry tracking with `source: "deeplink"`

### 6. Navigation System

**Description**: Top navigation bar for switching between views and displaying counts.

**Functionality**:

- Switch between main views (Issues, Current Sprint, Sprints, Changelog)
- Display real-time counts for issues and sprints
- Highlight active view
- Show active sprint count in Current Sprint tab
- Quick Add button for Quick Capture
- What's New button with badge indicator for unseen updates

**Components**:

- `components/navigation.tsx` - Main navigation component

**Views**:

- Issues - All issues list view
- Current Sprint - Active sprint Kanban board
- Sprints - All sprints management view
- Changelog - Version history and release notes

### 7. Data Management

**Description**: Centralized data layer with initial sample data and utility functions.

**Functionality**:

- Provide initial sample data (16 issues, 3 sprints)
- Generate auto-incrementing task IDs (TSK-001, TSK-002, etc.)
- Define color mappings for priorities and statuses
- Maintain data consistency across views
- Issue template definitions with pre-filled AC

**Files**:

- `lib/data.ts` - Data utilities, initial data, and issue templates
- `types/index.ts` - Type definitions

**Key Functions**:

- `generateTaskId()` - Creates sequential task IDs
- `priorityColors` - Maps priorities to Tailwind classes
- `statusColors` - Maps statuses to Tailwind classes
- `initialIssues` - Sample issue data
- `initialSprints` - Sample sprint data
- `issueTemplates` - Pre-defined issue templates (Bug, Feature, Request)

### 8. UI Component Library

**Description**: Reusable UI components built on shadcn/ui patterns.

**Components Used**:

- `components/ui/button.tsx` - Buttons with variants
- `components/ui/card.tsx` - Card containers
- `components/ui/badge.tsx` - Status and priority badges
- `components/ui/dialog.tsx` - Modal dialogs
- `components/ui/dropdown-menu.tsx` - Action menus
- `components/ui/input.tsx` - Text inputs
- `components/ui/textarea.tsx` - Multi-line text inputs
- `components/ui/select.tsx` - Dropdown selects
- `components/ui/label.tsx` - Form labels
- `components/ui/tabs.tsx` - Tab navigation
- `components/ui/separator.tsx` - Visual separators
- `components/ui/checkbox.tsx` - Checkboxes for AC items

**Styling**:

- Tailwind CSS utility classes
- Consistent spacing scale (4, 6, 8, 12, 16)
- Semantic design tokens (bg-background, text-foreground)
- Responsive design patterns

### 9. Roll-up Dashboard

**Description**: Executive dashboard providing instant visibility into project health with key metrics, scope filtering, and time range controls.

**Functionality**:

- View 4 key metric cards in 2x2 grid layout
- Filter data by Project and Team (cross-view scope filters)
- Adjust time range (Last 7/14/30 days)
- Pure derivation from existing issue/sprint data (no new storage)
- Real-time metric updates based on filtered scope
- Telemetry tracking for dashboard usage

**Components**:

- `components/dashboard/dashboard-view.tsx` - Main dashboard container with filters and grid
- `components/dashboard/status-breakdown-card.tsx` - Issue counts by status (Todo/In Progress/In Review/Done)
- `components/dashboard/active-sprint-progress-card.tsx` - Active sprint completion percentage
- `components/dashboard/throughput-card.tsx` - Issues closed over time range
- `components/dashboard/workload-by-assignee-card.tsx` - Top 5 assignees by issue count
- `components/scope-filters.tsx` - Project/Team multi-select filters with Clear button

**Data Types**:

- `types/index.ts` - `Project`, `Team`, `DashboardTimeRange`, `TimeRangePreset`, `PreferencesState`
- `lib/dashboard-utils.ts` - Metric derivation functions

**Redux Slices**:

- `lib/redux/slices/projectsSlice.ts` - Project entity management (seeded with "Main Project")
- `lib/redux/slices/teamsSlice.ts` - Team entity management (seeded with "Main Team")
- `lib/redux/slices/preferencesSlice.ts` - User preferences (selected filters, time range)
- `lib/redux/slices/issuesSlice.ts` - Enhanced with `projectId`, `teamId`, `statusChangeHistory` fields

**Metric Cards**:

1. **Status Breakdown**
   - Counts issues by status (Todo, In Progress, In Review, Done)
   - Color-coded bars matching status colors
   - Shows total issue count
   - Derived from: `deriveCountsByStatus(scopedIssues)`

2. **Active Sprint Progress**
   - Shows completion % of active sprint
   - Displays sprint name and date range
   - Counts Done vs Total issues
   - Empty state when no active sprint
   - Derived from: `deriveActiveSprintProgress(scopedIssues, sprints)`

3. **Throughput**
   - Issues closed (moved to Done) within time range
   - Respects selected time range preset (7d/14d/30d)
   - Uses `statusChangeHistory` to track status transitions
   - Derived from: `deriveThroughput(scopedIssues, timeRange)`

4. **Workload by Assignee**
   - Top 5 assignees by issue count
   - Shows assignee name and count
   - Sorted descending by count
   - Derived from: `deriveWorkloadByAssignee(scopedIssues, 5)`

**Scope Filtering**:

- **Project Filter**: Multi-select dropdown, filters issues by `projectId`
- **Team Filter**: Multi-select dropdown, filters issues by `teamId`
- **Clear Filters**: Button to reset all filters at once
- **Persistence**: Filter selections persist in Redux state across view navigation
- **Cross-View**: Same filters apply to Issues, Current Sprint, and Dashboard views

**Time Range Controls**:

- **Presets**: Last 7 days, Last 14 days, Last 30 days
- **Badge UI**: Clickable badges, active preset highlighted
- **Persistence**: Selected range persists in Redux preferences
- **Scope**: Only affects Throughput metric (status change history filtering)

**Key Features**:

- Pure derivation - no new data storage, all metrics computed from existing issues/sprints
- Real-time updates - metrics recalculate on data changes
- Scope filtering - Project/Team filters apply across all views
- Time range control - Adjust throughput calculation window
- Telemetry tracking - `dashboard_view_opened`, `dashboard_time_range_changed` events
- Empty states - Graceful handling when no data or no active sprint
- Responsive grid - 2x2 on desktop, stacks on mobile

**Data Utilities** (in `lib/dashboard-utils.ts`):

- `applyScopeFilters(issues, projectIds, teamIds)` - Filters issues by selected scope
- `deriveCountsByStatus(issues)` - Counts issues by status
- `deriveActiveSprintProgress(issues, sprints)` - Calculates active sprint completion %
- `deriveThroughput(issues, timeRange)` - Counts issues closed in time range
- `deriveWorkloadByAssignee(issues, topN)` - Top N assignees by issue count

**Redux State**:

- `projects` - Array of Project entities (seeded with default)
- `teams` - Array of Team entities (seeded with default)
- `preferences.selectedProjectIds` - Currently selected project IDs for filtering
- `preferences.selectedTeamIds` - Currently selected team IDs for filtering
- `preferences.dashboardTimeRange` - Current time range selection

**Entry Points**:

1. **Navigation**: Click "Dashboard" in top navigation
2. **Changelog CTA**: Click "View Dashboard" in What's New modal or Changelog panel

## User Workflows

### Creating an Issue (Standard)

1. Navigate to Issues view
2. Click "Create Issue" button
3. Fill in form (title, description, priority, status, assignee, optional sprint)
4. Optionally select a template to pre-fill fields
5. Add/edit acceptance criteria as needed
6. Click "Create Issue" to submit
7. Issue appears in list with auto-generated ID and AC badge

### Creating an Issue (Quick Capture)

1. Press Q key anywhere (or click "Quick Add" button)
2. Select a template (Bug, Feature, or Request)
3. Enter title and assignee
4. Optionally modify pre-filled AC
5. Click "Create Issue"
6. Issue created in under 10 seconds

### Editing an Issue

1. Locate issue in Issues view or Current Sprint view
2. Click three-dot menu on issue card
3. Select "Edit" option
4. Modify fields in dialog form
5. Add/remove/edit acceptance criteria
6. Check off completed items
7. Click "Update Issue" to save changes

### Managing Acceptance Criteria

1. Open Issue Form (create or edit)
2. Scroll to "Acceptance Criteria" section
3. Add new AC items with "Add Criterion" button
4. Check off completed items
5. Remove items with trash icon
6. View progress badge on issue card after saving

### Managing Sprints

1. Navigate to Sprints view
2. Create new sprint with name and dates
3. Start sprint to make it active
4. Assign issues to sprint from Issues view or Quick Capture
5. End sprint when complete (unfinished issues return to backlog)

### Working in Current Sprint

1. Navigate to Current Sprint view
2. View Kanban board with sprint issues
3. Update issue status using dropdown on each card
4. Edit or delete issues using context menu
5. Track progress across columns and AC completion
6. Monitor sprint completion

### Viewing What's New

1. Modal auto-opens on first load after version update
2. Review new features, improvements, and fixes
3. Click "Try it" CTAs to deep-link to relevant views
4. Click "Don't show again" to dismiss for current version
5. Access full changelog anytime via "What's New" button in navigation

### Viewing Dashboard Metrics

1. Navigate to Dashboard view via top navigation
2. View 4 metric cards: Status Breakdown, Active Sprint Progress, Throughput, Workload
3. Optionally filter by Project/Team using dropdowns
4. Optionally adjust time range (7d/14d/30d) for Throughput metric
5. Click "Clear Filters" to reset all filters
6. Metrics update in real-time based on filters

### Filtering Data Across Views

1. Select Project(s) and/or Team(s) from filter dropdowns
2. Navigate between Issues, Current Sprint, and Dashboard views
3. Filters persist across views
4. Click "Clear Filters" to reset all at once

## Data Flow

### State Management

- Root state in `app/page.tsx` using React `useState`
- **Redux Toolkit** for centralized state management:
  - `issuesSlice` - Issue entities with `projectId`, `teamId`, `statusChangeHistory`
  - `sprintsSlice` - Sprint entities
  - `projectsSlice` - Project entities (seeded with default)
  - `teamsSlice` - Team entities (seeded with default)
  - `preferencesSlice` - User preferences (filters, time range)
  - `uiSlice` - UI state (current view, modals)
- State passed down to child components via props
- Callbacks passed down for state mutations
- Immutable updates with Redux Toolkit (Immer)
- Quick Capture modal state managed in Redux
- What's New modal state managed in Redux with localStorage sync
- Last-used template persisted in localStorage (`flowcraft:lastUsedTemplate`)
- Last seen version persisted in localStorage (`flowcraft:lastSeenVersion`)
- **Scope filters** persisted in Redux preferences, apply across views

### Data Persistence

- Currently in-memory only (resets on page refresh)
- Redux state with localStorage sync for:
  - Last seen version (`flowcraft:lastSeenVersion`)
  - Last-used template (`flowcraft:lastUsedTemplate`)
- Ready for backend integration (all CRUD operations defined)
- Timestamps tracked for all entities (createdAt, updatedAt)
- Status change history tracked for throughput metrics

## Validation Rules

### Issue Validation

- Title: Required, non-empty string
- Assignee: Required, non-empty string
- Description: Optional
- Priority: Must be valid Priority type
- Status: Must be valid IssueStatus type
- Sprint: Optional, must be valid sprint ID or undefined
- Acceptance Criteria: Optional array, each item has text and completed status

### Sprint Validation

- Name: Required, non-empty string
- Start Date: Required, valid date
- End Date: Required, valid date, must be after start date
- Status: Automatically managed by system

## Keyboard Shortcuts

- **Q** - Open Quick Capture modal (when no input is focused and no modal is open)

## Deep Links

- **`?open=quick-capture`** - Opens Quick Capture modal automatically
  - Used in changelog CTAs ("Try Quick Capture")
  - Shareable URL for direct access to feature
  - Guards against multiple modals and input focus
  - Auto-clears parameter after opening

- **`?open=issue&id={KEY}`** - Opens issue edit modal for specific issue
  - Used in toast notifications after issue creation
  - Navigates to Issues view and opens edit modal
  - Guards against multiple modals
  - Auto-clears parameters after opening
  - Tracks `issue_opened_via_deeplink` telemetry event

## Version History

### v0.3.0 (2025-01-18)
- Added Roll-up Dashboard with 4 key metrics
- Added Project and Team entities with default seeding
- Added cross-view scope filtering (Project/Team)
- Added time range controls for dashboard (7d/14d/30d)
- Added status change history tracking for throughput
- Added dashboard metric derivation functions
- Added Redux slices for projects, teams, and preferences
- Enhanced issues with projectId, teamId, statusChangeHistory fields
- Added telemetry for dashboard usage

### v0.2.0 (2025-01-18)
- Added Quick Capture with keyboard shortcut (Q)
- Added deep-link support (`?open=quick-capture` and `?open=issue&id={KEY}`)
- Added Issue Templates (Bug, Feature, Request)
- Added last-used template memory (localStorage)
- Added default template configuration (Feature)
- Added Acceptance Criteria management
- Added AC progress badges on issue cards
- Added edit/delete actions in Current Sprint kanban view
- Added toast notifications with deep-link to open created issues
- Added telemetry tracking (console-based)
- Added contextual sprint prefill
- Added dirty state confirmation
- Added template conflict resolution

### v0.1.0 (2025-01-17)
- Added Changelog & What's New system
- Added version tracking with localStorage
- Added changelog panel view
- Initial release with core features

### v0.0.1 (Initial)
- Issue management (CRUD)
- Sprint management (CRUD)
- Current Sprint Kanban view
- Navigation system
- Priority and status tracking
