# Task Manager Frontend

This folder contains the React + Vite UI for the company-scoped Team Task Manager app.
It includes invite-based onboarding, role-aware admin tools, project and task detail views, team chat, live updates, and a dashboard with activity feed data.

## What’s included

- Login and signup pages with JWT-based authentication
- Show/hide password controls on auth forms
- Invite-aware onboarding through `/invite/:token` and invite-backed signup
- Dashboard with task, project, team, and activity summaries
- Projects list and project detail views with edit and delete actions
- Tasks board with filters, edit controls, and status updates
- Team members view for inspecting membership and roles
- Team chat interface with live Socket.IO updates
- Admin workspace for creating invites, teams, members, heads, projects, and tasks
- Responsive dark UI with animated page transitions

## Tech stack

- React 19
- Vite
- Tailwind CSS
- React Router DOM
- Axios for backend communication
- Socket.IO client for live refreshes and chat updates
- React Quill for rich text editing support in the UI

## Key files

- `src/App.jsx` - route setup and protected route handling
- `src/api.js` - Axios client configured for backend requests
- `src/context/AuthContext.jsx` - auth state and `localStorage` persistence
- `src/context/NotificationContext.jsx` - chat notification handling
- `src/context/UIContext.jsx` - sidebar and shell state
- `src/components/Sidebar.jsx` - authenticated navigation
- `src/components/ProtectedRoute.jsx` - route guard
- `src/components/ProjectForm.jsx` - project form helper
- `src/components/TaskForm.jsx` - task form helper
- `src/pages/Login.jsx` - login form and password visibility toggle
- `src/pages/Signup.jsx` - invite-aware signup form and password visibility toggle
- `src/pages/InviteJoin.jsx` - invite details and join flow
- `src/pages/Admin.jsx` - admin panel for invites, teams, members, heads, projects, and tasks
- `src/pages/Dashboard.jsx` - project/task/activity summary cards and recent activity feed
- `src/pages/Projects.jsx` - project list and creation UI
- `src/pages/ProjectDetail.jsx` - project detail, task list, and project/task edits
- `src/pages/Tasks.jsx` - task creation, filtering, and status controls
- `src/pages/TeamMembers.jsx` - team member listing and role management
- `src/pages/Chat.jsx` - team chat feed and message input

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

This frontend pairs with the Node.js backend to provide a complete team task management experience.
