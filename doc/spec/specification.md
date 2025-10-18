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
- **NEW**: Manage Acceptance Criteria (AC) for each issue with completion tracking
- **NEW**: Use issue templates (Bug, Feature, Request) with pre-filled AC

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
- AC can be added, edited, removed, and checked off in Issue Form

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
- **NEW**: Edit and delete issues directly from kanban cards
- **NEW**: View AC progress badges on kanban cards

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

**Description**: Rapid issue creation with keyboard shortcut and template support.

**Functionality**:

- Press Q key (when no input focused) to open Quick Capture modal
- Click "Quick Add" button in navigation to open modal
- Select from three issue templates (Bug, Feature, Request)
- Templates pre-fill priority, status, and acceptance criteria
- Create issues in under 10 seconds
- Streamlined form with only essential fields

**Components**:

- `components/quick-capture.tsx` - Quick Capture modal with template selection

**Data Types**:

- `types/index.ts` - `IssueTemplate` interface

**Templates**:

- **Bug Template**: P1 priority, Todo status, includes reproduction steps AC
- **Feature Template**: P2 priority, Todo status, includes acceptance scenarios AC
- **Request Template**: P3 priority, Todo status, includes impact clarification AC

**Key Features**:

- Global keyboard shortcut (Q key)
- Template-based issue creation
- Pre-filled acceptance criteria
- Automatic assignee and sprint selection
- Instant issue creation

### 5. Changelog & What's New

**Description**: Version tracking and feature announcement system.

**Functionality**:

- Auto-opening "What's New" modal on version updates
- Display release notes with color-coded item types
- Track last seen version in localStorage
- Badge indicator on navigation for unseen updates
- Dedicated changelog panel accessible from navigation
- Deep-linking to specific views from changelog items

**Components**:

- `components/whats-new-modal.tsx` - Auto-opening modal for new releases
- `components/changelog-panel.tsx` - Full changelog history view

**Data Files**:

- `lib/changelog.ts` - Release data, version tracking, localStorage utilities

**Data Types**:

- `types/index.ts` - `ViewType` includes 'changelog'

**Release Item Types**:

- **New** (Blue) - New features
- **Improved** (Green) - Enhancements
- **Fixed** (Orange) - Bug fixes
- **Notice** (Purple) - Important announcements

**Key Features**:

- Automatic modal display on first load after version update
- "Don't show again" option for current version
- Badge indicator on "What's New" button when updates unseen
- Deep-linking to relevant views from release items
- "How to find" instructions for each feature
- Version history with dates

### 6. Navigation System

**Description**: Top navigation bar for switching between views and displaying counts.

**Functionality**:

- Switch between main views (Issues, Current Sprint, Sprints, Changelog)
- Display real-time counts for issues and sprints
- Highlight active view
- Show active sprint count in Current Sprint tab
- **NEW**: Quick Add button for Quick Capture
- **NEW**: What's New button with badge indicator for unseen updates

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
- **NEW**: Issue template definitions with pre-filled AC

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
6. Check off completed AC items
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

## Data Flow

### State Management

- Root state in `app/page.tsx` using React `useState`
- Issues and sprints arrays maintained in root component
- State passed down to child components via props
- Callbacks passed down for state mutations
- Immutable updates with new arrays/objects
- Quick Capture modal state managed in root
- What's New modal state managed in root with localStorage sync

### Data Persistence

- Currently in-memory only (resets on page refresh)
- Ready for backend integration (all CRUD operations defined)
- Timestamps tracked for all entities (createdAt, updatedAt)
- Last seen version persisted in localStorage
- Version tracking survives page refreshes

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

- **Q** - Open Quick Capture modal (when no input is focused)

## Version History

### v0.2.0 (2025-01-18)
- Added Quick Capture with keyboard shortcut (Q)
- Added Issue Templates (Bug, Feature, Request)
- Added Acceptance Criteria management
- Added AC progress badges on issue cards
- Added edit/delete actions in Current Sprint kanban view

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

## Future Enhancement Opportunities

### Potential Features

- Backend API integration for data persistence
- User authentication and authorization
- Real-time collaboration with WebSockets
- Advanced filtering and search
- Issue comments and attachments
- Time tracking and estimates
- Burndown charts and analytics
- Email notifications
- Export functionality
- Custom fields and workflows
- Issue dependencies and blockers
- Sprint velocity tracking
- Custom issue templates
- Bulk operations
- Issue history/audit log
- Sprint retrospectives
