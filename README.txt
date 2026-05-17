================================================================================
                     TEAM TASK MANAGER FRONTEND - README
================================================================================

PROJECT OVERVIEW
================================================================================

This is the React + Vite frontend for a full-stack Team Task Manager application.
It provides a modern, responsive web UI for managing teams, projects, tasks, and
real-time collaboration. The frontend is designed for company-scoped operations
with role-based access control, real-time notifications via Socket.IO, team chat,
and a comprehensive admin dashboard.

KEY FEATURES
================================================================================

✓ Authentication & Authorization
  - JWT-based login/signup with secure token management
  - Password visibility toggle for better UX
  - Role-based access control: admin, team-head, member
  - Protected routes enforcing authentication
  - Invite-aware signup flow for team onboarding

✓ Real-Time Collaboration
  - Socket.IO integration for live updates
  - Notification center with unread count tracking
  - Team chat with real-time message delivery
  - Live task/project updates across dashboard
  - Activity feed with recent workspace changes

✓ Team Management
  - Team creation and membership management
  - Role assignment (admin, team-head, member)
  - Team member listing and filtering
  - Team head delegation and management

✓ Project & Task Management
  - Projects list with pagination and search
  - Kanban board view (Todo, In Progress, Review, Done)
  - Task creation, editing, and deletion
  - Task filtering by project, status, priority, assignee
  - File attachment support for tasks
  - Project metadata: title, description, color, emoji

✓ Dashboard & Analytics
  - Quick stats: projects, tasks, team members, activity
  - Recent activity feed with timestamps
  - Project and task summaries
  - Team member overview

✓ Admin Panel
  - Invite link creation and management
  - Team creation and management
  - User role management
  - Project creation across teams
  - Task creation and assignment
  - Bulk team head assignment

✓ Responsive & Accessible UI
  - Mobile-responsive design with Tailwind CSS
  - Dark theme with gradient accents
  - Collapsible sidebar navigation
  - Loading states and empty state placeholders
  - Form validation with error feedback
  - Toast notifications for user actions
  - Confirmation dialogs for destructive actions
  - Keyboard navigation support (Escape to close modals)

✓ Performance & State Management
  - React Context API for global state (Auth, Notifications, UI)
  - Axios HTTP client with automatic JWT injection
  - Socket.IO with duplicate prevention
  - localStorage persistence for auth and notifications
  - Optimistic UI updates where applicable
  - Event deduplication for real-time streams

================================================================================
REPOSITORY STRUCTURE
================================================================================

Frontend/
├── index.html               # Entry HTML with app root
├── package.json             # Dependencies and scripts
├── vite.config.js           # Vite build configuration
├── tailwind.config.js       # Tailwind CSS configuration
├── postcss.config.js        # PostCSS configuration
├── eslint.config.js         # ESLint configuration
├── .env                     # Environment variables (local development)
├── .env.example             # Template for environment variables
├── .npmrc                   # npm configuration
├── .gitignore               # Git ignore rules
│
├── src/
│   ├── main.jsx             # React entry point with providers
│   ├── App.jsx              # Route setup and authenticated layout
│   ├── App.css              # Application styles (Tailwind-based)
│   ├── index.css            # Global CSS
│   ├── api.js               # Axios client with JWT interceptor
│   │
│   ├── config/
│   │   └── runtime.js       # Dynamic API URL resolution
│   │
│   ├── context/
│   │   ├── AuthContext.jsx  # Auth context definition
│   │   ├── AuthProvider.jsx # Auth provider with login/logout logic
│   │   ├── NotificationContext.jsx    # Notification context
│   │   ├── useNotifications.js        # Notification hook
│   │   ├── UIContext.jsx    # UI context for sidebar state
│   │   ├── uiContext.js     # UI context definition
│   │   └── useUI.js         # UI hook
│   │
│   ├── components/
│   │   ├── AlertBanner.jsx  # Error/success alert banners
│   │   ├── ConfirmDialog.jsx # Confirmation dialog for deletions
│   │   ├── EmptyState.jsx   # Empty state placeholder UI
│   │   ├── LoadingState.jsx # Loading spinner display
│   │   ├── MemberCard.jsx   # Team member card component
│   │   ├── Modal.jsx        # Modal dialog wrapper
│   │   ├── PageShell.jsx    # Standard page layout with notification bell
│   │   ├── PasswordInput.jsx # Password field with toggle
│   │   ├── ProjectForm.jsx  # Project creation/edit form
│   │   ├── ProtectedRoute.jsx # Route guard for authenticated pages
│   │   ├── Sidebar.jsx      # Navigation sidebar
│   │   ├── TaskForm.jsx     # Task creation/edit form with attachments
│   │   ├── TaskRow.jsx      # Task item display in lists
│   │   ├── TeamForm.jsx     # Team creation/edit form
│   │   └── Toast.jsx        # Toast notification display
│   │
│   └── pages/
│       ├── Admin.jsx        # Admin dashboard for team/user/project management
│       ├── Chat.jsx         # Team chat interface
│       ├── Dashboard.jsx    # Main dashboard with stats and activity
│       ├── InviteJoin.jsx   # Invite token handling and team joining
│       ├── Login.jsx        # Login page
│       ├── ProjectDetail.jsx # Project detail with Kanban board
│       ├── Projects.jsx     # Projects list
│       ├── Signup.jsx       # Signup page with invite support
│       ├── Tasks.jsx        # Tasks list with filtering
│       └── TeamMembers.jsx  # Team members management
│
├── public/                  # Static assets
└── assets/                  # Image and media assets

================================================================================
QUICK START GUIDE
================================================================================

1. INSTALL DEPENDENCIES

   cd Frontend
   npm install

2. CONFIGURE ENVIRONMENT

   Create a .env file (or copy from .env.example):

   VITE_API_URL=http://localhost:5000

   For production, use:
   VITE_API_URL=https://your-backend-url.com

3. START DEVELOPMENT SERVER

   npm run dev

   The server will start on http://localhost:5173
   Open this URL in your browser

4. BUILD FOR PRODUCTION

   npm run build
   npm run preview

5. RUN LINTER

   npm run lint

================================================================================
ENVIRONMENT VARIABLES
================================================================================

VITE_API_URL (optional)
   Backend API base URL. Defaults to http://localhost:5000
   
   Examples:
   VITE_API_URL=http://localhost:5000
   VITE_API_URL=https://api.yourdomain.com
   
   The frontend also supports runtime configuration via window.__APP_CONFIG__.API_URL
   for containerized deployments (set before React initialization in index.html).

================================================================================
CONTEXT PROVIDERS & STATE MANAGEMENT
================================================================================

The frontend uses React Context API for global state with three main providers
initialized in main.jsx:

AUTHPROVIDER
   Manages:
   - Current user object (id, email, role, company_id)
   - Login and logout actions
   - JWT token storage/retrieval
   - localStorage persistence of auth state
   
   Usage: import { AuthContext } from './context/AuthContext'
          const { user, login, logout } = useContext(AuthContext)

NOTIFICATIONPROVIDER
   Manages:
   - Real-time notification list with unread count
   - Chat notifications per team
   - Socket.IO connection lifecycle
   - Socket.IO event listeners (join_team, join_company)
   - Duplicate prevention via event key tracking
   - localStorage persistence of notifications
   
   Usage: import { useNotifications } from './context/useNotifications'
          const { notifications, unreadCount, socket } = useNotifications()

UIPROVIDER
   Manages:
   - Sidebar open/close state
   - Page transitions
   
   Usage: import { useUI } from './context/useUI'
          const { isSidebarOpen, toggleSidebar, closeSidebar } = useUI()

================================================================================
API INTEGRATION
================================================================================

The Axios client (src/api.js) is configured to:

1. Use the backend URL from VITE_API_URL or default to http://localhost:5000
2. Automatically inject JWT token from localStorage into request headers
3. Maintain withCredentials for cookie-based sessions
4. Handle error responses gracefully

All API calls are made through the shared axios instance imported as:
   import API from '../api'

Example:
   const res = await API.get('/tasks')
   const newTask = await API.post('/tasks', { title, description, ... })
   await API.put(`/tasks/${id}`, { status: 'Done' })
   await API.delete(`/tasks/${id}`)

================================================================================
ROUTING ARCHITECTURE
================================================================================

UNAUTHENTICATED ROUTES (No login required)
   /login              - Login page
   /signup             - Signup page
   /invite/:token      - Invite inspection and join flow

AUTHENTICATED ROUTES (Login required)
   /                   - Dashboard
   /projects           - Projects list
   /projects/:id       - Project detail with Kanban board
   /tasks              - Tasks list with filtering
   /team-members       - Team members management
   /chat               - Team chat interface
   /admin              - Admin panel (admin role only)
   /invite/:token      - Invite joining (also works when logged in)

ROUTING FEATURES
   - Protected routes enforced by ProtectedRoute component
   - Role-based access control (admin-only pages check user.role === 'admin')
   - Automatic redirect to login if not authenticated
   - Automatic redirect to / if unauthorized
   - Mobile-aware: sidebar closes on route change

================================================================================
COMPONENTS GUIDE
================================================================================

PAGE SHELL
   Every authenticated page is wrapped with PageShell which provides:
   - Standard .main layout with top bar
   - Notification bell with unread count badge
   - Notification dropdown menu
   - Page title and action buttons (right side)
   
   Usage: <PageShell title="Projects" actions={[...]}>
            {/* page content */}
          </PageShell>

FORMS & MODALS
   ProjectForm - Create/edit projects with color and emoji selection
   TaskForm    - Create/edit tasks with attachment upload support
   TeamForm    - Create/edit teams with name input
   
   All forms are displayed in Modal dialogs (not full pages).

DIALOGS
   Modal - Generic modal wrapper with onClose and title
   ConfirmDialog - Confirmation dialog for destructive actions
   
   Example:
   <Modal open={isOpen} onClose={close} title="Create Project">
     <ProjectForm onSubmit={handleSubmit} onCancel={close} />
   </Modal>

DATA DISPLAY
   TaskRow - Single task item for list views (with edit/delete buttons)
   MemberCard - Team member display with role and edit/delete actions
   TaskListItem - Task display in project detail view
   StatCard - Data stat card for dashboard
   
FEEDBACK COMPONENTS
   Toast - Success/error notification at bottom of page
   AlertBanner - Error/success message banner at top of section
   EmptyState - Placeholder when no data is available
   LoadingState - Spinner display during data loading

UTILITY COMPONENTS
   PasswordInput - Password field with show/hide toggle
   Sidebar - Navigation with team/project shortcuts
   ProtectedRoute - Route guard enforcing authentication

================================================================================
KEY WORKFLOWS
================================================================================

LOGIN FLOW
   1. User enters email/password on Login page
   2. Frontend calls POST /auth/login
   3. Backend returns JWT token and user object
   4. Frontend stores token in localStorage (key: 'token')
   5. AuthProvider updates user state
   6. Frontend redirects to /
   7. All subsequent API calls include Authorization: Bearer <token> header

SIGNUP WITH INVITE
   1. User visits /invite/:token (or signup with token parameter)
   2. InviteJoin page loads invite details from backend
   3. User fills out signup form with pre-filled data
   4. Frontend calls POST /auth/signup with invite token
   5. Backend associates user with team from invite
   6. User logged in automatically and redirected to /

PROJECT CREATION (ADMIN)
   1. Admin visits /admin panel
   2. Selects team and fills ProjectForm
   3. Form calls POST /projects
   4. New project appears in projects list
   5. Socket.IO event refresh_projects broadcasts to all users
   6. Dashboard updates to show new project

TASK ASSIGNMENT
   1. User opens task detail or creation form
   2. Selects assignee from dropdown (team members)
   3. Fills task details (title, priority, due date, etc.)
   4. Calls POST /tasks or PUT /tasks/:id
   5. Task appears in assigned user's task list
   6. Socket.IO event refresh_tasks notifies team

REAL-TIME UPDATES
   1. NotificationProvider initializes Socket.IO connection on login
   2. Frontend joins team and company rooms: socket.emit('join_team', teamId)
   3. Backend broadcasts refresh_tasks, refresh_projects, new_message
   4. Frontend listens and updates local state
   5. UI re-renders automatically via React state update

FILE ATTACHMENT UPLOAD
   1. User opens task form and clicks "Add File"
   2. File input dialog opens
   3. Frontend creates FormData with file
   4. Calls POST /tasks/:taskId/attachments with FormData
   5. Backend stores file in Backend/uploads directory
   6. Frontend displays attachment link in task view
   7. Users can download via GET /uploads/:filename

================================================================================
DEPLOYMENT
================================================================================

DOCKER DEPLOYMENT

Build Docker image:
   docker build -t team-task-manager-frontend .
   
Run container:
   docker run -p 5173:5173 \
     -e VITE_API_URL=http://backend:5000 \
     team-task-manager-frontend

STATIC HOSTING (GitHub Pages, Netlify, Vercel, etc.)

Build for production:
   npm run build

Deploy dist/ folder to your static host.

For client-side routing, configure your host to serve index.html for
all non-existent routes (Single Page Application behavior).

ENVIRONMENT VARIABLES IN PRODUCTION

Set VITE_API_URL before building:
   VITE_API_URL=https://api.yourdomain.com npm run build

Or set window.__APP_CONFIG__ at runtime in index.html:
   <script>
     window.__APP_CONFIG__ = {
       API_URL: 'https://api.yourdomain.com'
     };
   </script>

CORS CONSIDERATIONS

The frontend sends requests to the backend API. Ensure the backend
has CORS_ORIGIN configured to include your frontend URL.

Backend .env:
   CORS_ORIGIN=https://yourfrontend.com,http://localhost:5173

================================================================================
STYLING & THEMING
================================================================================

CSS FRAMEWORK: Tailwind CSS 3.4

Key theme variables (defined in CSS):
   --bg, --bg2, --bg3         - Background colors
   --text, --text2, --text3   - Text colors
   --border, --border2        - Border colors
   --accent, --accent2        - Accent colors (purple/blue)
   --green, --red, --yellow   - Status colors
   --shadow-sm, --shadow-md   - Shadow depths

Dark theme is the default. All components use Tailwind utility classes
and CSS variables for consistency.

CUSTOMIZATION

To customize colors, edit src/index.css and modify CSS variable values
in the :root selector. Example:

   :root {
     --bg: #1a1a2e;          /* Main background */
     --text: #e4e4e7;        /* Main text color */
     --accent: #7c6aff;      /* Primary accent */
   }

================================================================================
TROUBLESHOOTING
================================================================================

"Cannot connect to backend"
   - Verify backend is running on correct port (default: 5000)
   - Check VITE_API_URL environment variable matches backend URL
   - Check browser console for CORS errors
   - Verify backend CORS_ORIGIN includes frontend URL
   
"Token expired / 401 Unauthorized"
   - Clear localStorage: localStorage.clear()
   - Log out and log back in
   - Verify JWT_SECRET matches between frontend and backend
   
"Real-time updates not working"
   - Verify Socket.IO is not blocked by firewall/proxy
   - Check browser console for Socket.IO connection errors
   - Verify Socket.IO port (usually same as HTTP port) is accessible
   - Check that user has joined team/company room
   
"Page shows 'Loading' indefinitely"
   - Check browser console for API errors
   - Verify backend is responding to requests
   - Check network tab in browser DevTools for failed requests
   
"Notification bell shows no notifications"
   - Verify socket is connected in browser console
   - Check backend is sending notifications
   - Clear localStorage and refresh: localStorage.clear()
   
"File upload not working"
   - Verify backend uploads directory exists: Backend/uploads
   - Check backend file upload route (POST /tasks/:id/attachments)
   - Verify file size isn't exceeding server limits
   - Check browser console for error details

================================================================================
DEVELOPMENT BEST PRACTICES
================================================================================

COMPONENT ORGANIZATION
- Keep components focused on single responsibility
- Use component composition for reusable UI patterns
- Props validate with PropTypes for type safety
- Use hooks (useState, useEffect, useContext, etc.) for state management

STATE MANAGEMENT
- Use Context API for global state (auth, notifications, UI)
- Use useState for component-local state
- Avoid lifting state unnecessarily - keep it close to usage
- Use useMemo and useCallback for performance optimization

API INTEGRATION
- Use async/await for API calls
- Handle errors gracefully with try/catch
- Show loading states during async operations
- Validate data before sending to backend

REAL-TIME UPDATES
- Always check socket exists before emitting
- Listen for all broadcast events your component needs
- Clean up event listeners on component unmount
- Use deduplication to prevent duplicate messages

USER FEEDBACK
- Show loading states during operations
- Display success/error toasts for important actions
- Use confirmation dialogs for destructive actions
- Show empty states when data is unavailable

PERFORMANCE
- Use React.memo for expensive components
- Use useMemo for expensive computations
- Lazy load routes with React.lazy (if needed)
- Minimize re-renders with proper dependency arrays

================================================================================
SUPPORT & DOCUMENTATION
================================================================================

- Backend: ../Backend/README.md and ../Backend/readme.txt
- Root Project: ../README.txt
- API Reference: Backend/README.md (API endpoints documentation)

For issues or questions, review relevant component files or backend docs.

================================================================================
Version: 1.0.0
Last Updated: 2026
License: See LICENSE file in root directory
================================================================================
