# Task Manager Frontend

This folder contains the React + Vite UI for the company-scoped Team Task Manager app.
It includes invite-based onboarding, role-aware admin tools, project and task detail views, team chat, live updates, and a dashboard with activity feed data.

## What’s included

- **Authentication**: Login and signup pages with JWT-based token management
- **Password Security**: Show/hide password controls on all auth forms
- **Invite System**: Invite-aware onboarding through `/invite/:token` route with dedicated signup flow
- **Dashboard**: Real-time summary of tasks, projects, team stats, and company activity feed
- **Projects**: Projects list with pagination and detail view with Kanban board (Todo/In Progress/Review/Done)
- **Tasks**: Task creation, filtering (by project, status, priority, assignee), and status controls
- **Attachments**: File upload support on tasks with attachment management
- **Team Management**: Team members view with role management (admin, team-head, member)
- **Team Chat**: Real-time messaging interface with team chat history and live message updates
- **Admin Panel**: Workspace for creating/managing invites, teams, team members, team heads, projects, and tasks
- **Notifications**: Real-time notification system with unread count tracking and notification center
- **Real-Time Updates**: Socket.IO integration for live refreshes of projects, tasks, messages, and notifications
- **Responsive Dark UI**: Mobile-responsive design with animated page transitions and gradient backgrounds
- **Form Validation**: Comprehensive form handling with error states and success feedback

## Tech stack

**React 19** - modern UI framework with hooks
**Vite** - fast build tool and dev server
**Tailwind CSS** - utility-first CSS framework
**React Router DOM 7** - client-side routing with lazy loading
**Axios** - HTTP client with interceptors for JWT injection
**Socket.IO Client** - real-time bidirectional communication
**PropTypes** - runtime type checking for components

## Real-time features

### Socket.IO Integration

The frontend uses Socket.IO for real-time updates:

- **Automatic Socket Connection**: Established when user logs in, managed by NotificationProvider
- **Team Room Joining**: User joins team chat rooms for receiving team-specific messages
- **Company Room Joining**: User joins company room for receiving company-wide notifications
- **Message Updates**: Real-time message delivery with duplicate prevention
- **Notification Broadcasts**: Real-time notifications for tasks, projects, chat, and role changes
- **Project/Task Refresh**: Automatic dashboard refresh when projects or tasks change

### Notification System

The frontend implements a comprehensive notification center:

- **Unread Count**: Badge display on notification bell with real-time updates
- **Notification Types**: Support for task, message, team, project, and role_change notifications
- **Notification Dropdown**: Access notifications from any page via the PageShell notification bell
- **Clear All**: Bulk mark-as-read action for all notifications
- **Persistent Storage**: Notifications cached in localStorage with user-scoped keys
- **Type-based Icons**: Visual icons for different notification types (📝 task, 💬 message, etc.)
- **Unread Tracking**: Automatic tracking of read/unread status with server synchronization

### Chat Notifications

- **Team Chat Badges**: Unread message count per team in the chat interface
- **Smart Clearing**: Unread count automatically clears when viewing team messages
- **Storage Preference**: Sidebar UI preference (compact/expanded) persisted per user
- **Real-time Updates**: New messages appear instantly via Socket.IO

## Key files

### Architecture & Configuration

- `src/App.jsx` - route setup, protected route handling, sidebar layout, real-time gradient background
- `src/main.jsx` - React entry point with context providers (Auth, Notification, UI)
- `src/api.js` - Axios client configured for backend requests with JWT auth interceptor
- `src/config/runtime.js` - dynamic API URL resolution from environment or window config

### State Management & Context

- `src/context/AuthContext.jsx` - auth context definition
- `src/context/AuthProvider.jsx` - auth state, persistence, login/logout, user role
- `src/context/NotificationContext.jsx` - notifications, unread count, chat state, Socket.IO management
- `src/context/useNotifications.js` - custom hook for notification context access
- `src/context/UIContext.jsx` - UI provider for sidebar state
- `src/context/useUI.js` - custom hook for UI context access

### Components (Reusable UI)

- `src/components/Sidebar.jsx` - authenticated navigation with team/project shortcuts
- `src/components/PageShell.jsx` - standard page layout with notification bell and unread count
- `src/components/Modal.jsx` - modal dialog with backdrop and keyboard support
- `src/components/ConfirmDialog.jsx` - confirmation dialog for delete actions
- `src/components/ProtectedRoute.jsx` - route guard for authenticated pages
- `src/components/ProjectForm.jsx` - project creation/edit with color and emoji support
- `src/components/TaskForm.jsx` - task creation/edit with attachment upload
- `src/components/TeamForm.jsx` - team creation/edit form
- `src/components/MemberCard.jsx` - team member display with edit/delete actions
- `src/components/TaskRow.jsx` - task display in list view
- `src/components/PasswordInput.jsx` - password field with show/hide toggle
- `src/components/AlertBanner.jsx` - informational/error alert display
- `src/components/EmptyState.jsx` - empty state placeholder UI
- `src/components/LoadingState.jsx` - loading spinner display
- `src/components/Toast.jsx` - toast notification display

### Pages (Routes)

- `src/pages/Login.jsx` - login form with JWT authentication
- `src/pages/Signup.jsx` - invite-aware signup with form validation
- `src/pages/InviteJoin.jsx` - invite token inspection and team joining
- `src/pages/Dashboard.jsx` - project/task/team/activity summary with stat cards
- `src/pages/Projects.jsx` - project list with pagination and creation UI
- `src/pages/ProjectDetail.jsx` - project detail with Kanban board (Todo/In Progress/Review/Done)
- `src/pages/Tasks.jsx` - task list with filtering, sorting, and status controls
- `src/pages/TeamMembers.jsx` - team member listing with role management UI
- `src/pages/Chat.jsx` - team chat interface with message history and real-time updates
- `src/pages/Admin.jsx` - admin workspace for managing invites, teams, users, projects, and tasks

## Run locally

```bash
cd Frontend
npm install
npm run dev
```

Open the Vite URL in your browser, usually `http://localhost:5173`.

## Environment

Create a `.env` file if you need to point the frontend at a non-local API:

```env
VITE_API_URL=http://localhost:5000
```

## Notes

- The frontend sends the JWT from `localStorage` on every API request.
- Protected pages are only available after login.
- Admin users can create invite links and manage teams from the admin page.
- Projects, tasks, dashboard activity, and chat all refresh from backend Socket.IO events.
- Invite links are handled through the dedicated invite route so logged-in and logged-out users can join cleanly.

## Presentation tips

- Show the login/signup password toggle before demonstrating the app flow
- Highlight the invite link onboarding path for new company users
- Demonstrate the admin team setup flow before creating projects and tasks
- Use the project detail and chat pages to show collaboration and live updates

---

## Core Features & Architecture

### Authentication Flow

- JWT tokens stored in localStorage (token or accessToken key)
- Automatic token injection via Axios request interceptor
- AuthProvider manages global auth state with localStorage persistence
- Protected pages only accessible after login via ProtectedRoute component
- Invite-aware signup flow allows users to join specific teams during registration

### Admin Capabilities

- Admin-only pages and actions protected by role checks
- Invite creation and management from admin panel
- Team creation and membership management
- User role assignment (admin, team-head, member)
- Project and task creation/management across teams
- Bulk team head assignment

### Data Management

- Form data validation with error state handling
- Modal-based edit/create workflows
- Confirmation dialogs for destructive actions
- Toast notifications for user feedback (success/error)
- Optimistic UI updates where applicable
- Empty state placeholders for missing data

### Project & Task Management

- Kanban board view with 4 status columns: Todo, In Progress, Review, Done
- Project metadata: title, description, color, emoji, team affiliation
- Inline task editing from project detail view
- Project-level edit and delete actions
- Task metadata: title, description, priority, due date, status, assignee
- File attachment support with upload and download
- Task filtering by project, status, priority, and assignee
- Inline status updates from various views

### Notification Integration

- Every authenticated page includes PageShell with notification bell
- Notification bell shows unread count and dropdown list
- Support for clearing all notifications from the bell menu
- Notification types color-coded with visual icons
- Notifications marked read on click with server sync

## Enhanced Notes

- JWT tokens sent via Axios request interceptor on every authenticated API request
- Protected pages only accessible after login via React Router route guards
- Admin users access admin panel for team, project, and user management
- Real-time updates (projects, tasks, chat, notifications) via Socket.IO events
- Invite links work for both logged-in and logged-out users (redirect to signup if needed)
- All pages include responsive sidebar with team/project navigation shortcuts
- Mobile-friendly responsive design with collapsible sidebar
- Form errors displayed inline with field validation feedback
- All sensitive data handled securely (tokens never exposed in URLs, except invite tokens)
- Notification state persisted in localStorage for offline access
- Preference persistence: sidebar state, chat sidebar layout stored per user
- Duplicate message/notification prevention via event key tracking
- Graceful error handling with user-friendly error messages
- Loading states displayed during async operations
- Empty states shown when no data is available (projects, tasks, teams, etc.)
- Context providers initialized in main.jsx for auth, notifications, and UI state
- Dynamic API URL resolution from environment, window config, or default localhost
- Axios interceptors automatically attach JWT for all API calls
- Socket.IO managed per user session with automatic reconnection
- Notifications deduplicated by message/notification key to prevent UI noise
  This frontend pairs with the Node.js backend to provide a complete team task management experience.
