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

**Components**:

- `components/issues-list.tsx` - Main list view displaying all issues
- `components/issue-card.tsx` - Individual issue card with actions menu
- `components/issue-form.tsx` - Dialog form for creating/editing issues
- `components/issue-assignment-dialog.tsx` - Dialog for assigning issues to sprints

**Data Types**:

- `types/index.ts` - `Issue` interface, `Priority` type, `IssueStatus` type

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

**Components**:

- `components/current-sprint-view.tsx` - Main current sprint view
- `components/kanban-board.tsx` - Kanban board visualization

**Data Types**:

- Uses `Issue` and `Sprint` types

**Key Features**:

- Automatic filtering of issues by active sprint
- Status change via dropdown (simplified from drag-and-drop)
- Color-coded columns matching status colors
- Issue cards show priority, assignee, and description

### 4. Navigation System

**Description**: Top navigation bar for switching between views and displaying counts.

**Functionality**:

- Switch between three main views (Issues, Current Sprint, Sprints)
- Display real-time counts for issues and sprints
- Highlight active view
- Show active sprint count in Current Sprint tab

**Components**:

- `components/navigation.tsx` - Main navigation component

**Views**:

- Issues - All issues list view
- Current Sprint - Active sprint Kanban board
- Sprints - All sprints management view

### 5. Data Management

**Description**: Centralized data layer with initial sample data and utility functions.

**Functionality**:

- Provide initial sample data (16 issues, 3 sprints)
- Generate auto-incrementing task IDs (TSK-001, TSK-002, etc.)
- Define color mappings for priorities and statuses
- Maintain data consistency across views

**Files**:

- `lib/data.ts` - Data utilities and initial data
- `types/index.ts` - Type definitions

**Key Functions**:

- `generateTaskId()` - Creates sequential task IDs
- `priorityColors` - Maps priorities to Tailwind classes
- `statusColors` - Maps statuses to Tailwind classes
- `initialIssues` - Sample issue data
- `initialSprints` - Sample sprint data

### 6. UI Component Library

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

**Styling**:

- Tailwind CSS utility classes
- Consistent spacing scale (4, 6, 8, 12, 16)
- Semantic design tokens (bg-background, text-foreground)
- Responsive design patterns

## User Workflows

### Creating an Issue

1. Navigate to Issues view
2. Click "Create Issue" button
3. Fill in form (title, description, priority, status, assignee, optional sprint)
4. Click "Create Issue" to submit
5. Issue appears in list with auto-generated ID

### Editing an Issue

1. Locate issue in Issues view
2. Click three-dot menu on issue card
3. Select "Edit" option
4. Modify fields in dialog form
5. Click "Update Issue" to save changes

### Managing Sprints

1. Navigate to Sprints view
2. Create new sprint with name and dates
3. Start sprint to make it active
4. Assign issues to sprint from Issues view
5. End sprint when complete (unfinished issues return to backlog)

### Working in Current Sprint

1. Navigate to Current Sprint view
2. View Kanban board with sprint issues
3. Update issue status using dropdown on each card
4. Track progress across columns
5. Monitor sprint completion

## Data Flow

### State Management

- Root state in `app/page.tsx` using React `useState`
- Issues and sprints arrays maintained in root component
- State passed down to child components via props
- Callbacks passed down for state mutations
- Immutable updates with new arrays/objects

### Data Persistence

- Currently in-memory only (resets on page refresh)
- Ready for backend integration (all CRUD operations defined)
- Timestamps tracked for all entities (createdAt, updatedAt)

## Validation Rules

### Issue Validation

- Title: Required, non-empty string
- Assignee: Required, non-empty string
- Description: Optional
- Priority: Must be valid Priority type
- Status: Must be valid IssueStatus type
- Sprint: Optional, must be valid sprint ID or undefined

### Sprint Validation

- Name: Required, non-empty string
- Start Date: Required, valid date
- End Date: Required, valid date, must be after start date
- Status: Automatically managed by system

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
