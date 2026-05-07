# Task Manager Frontend

This folder contains the React + Vite UI for the company-scoped Team Task Manager app.
It includes authentication, role-aware team management, invite-based onboarding support, project/task screens, and team chat.

## What’s included

- Login and signup pages with JWT-based authentication
- Show/hide password controls on auth forms
- Invite-aware signup flow for company onboarding
- Admin workspace for creating invites, teams, projects, and tasks
- Team member and team head management
- Dashboard view with task and project summaries
- Team chat interface for sending and viewing messages
- Responsive dark UI with animated page transitions

## Tech stack

- React 19
- Vite
- Tailwind CSS
- React Router DOM
- Axios for backend communication

## Key files

- `src/App.jsx` - route setup and protected route handling
- `src/api.js` - Axios client configured for backend requests
- `src/context/AuthContext.jsx` - auth state and `localStorage` persistence
- `src/components/Sidebar.jsx` - authenticated navigation
- `src/components/ProtectedRoute.jsx` - route guard
- `src/components/ProjectForm.jsx` - project form helper
- `src/components/TaskForm.jsx` - task form helper
- `src/pages/Login.jsx` - login form and password visibility toggle
- `src/pages/Signup.jsx` - invite-aware signup form and password visibility toggle
- `src/pages/Admin.jsx` - admin panel for invites, teams, members, heads, projects, and tasks
- `src/pages/Dashboard.jsx` - project/task summary cards
- `src/pages/Projects.jsx` - project list and creation UI
- `src/pages/Tasks.jsx` - task creation, listing, and status controls
- `src/pages/Chat.jsx` - team chat feed and message input

## Run locally

```bash
cd Frontend
npm install
npm run dev
```

Open the Vite URL in your browser, usually `http://localhost:5173`.

## Notes

- The frontend calls the backend API through authenticated requests.
- Protected pages are only available after login.
- Admin users can create invite links and manage teams from the admin page.
- Tasks and projects are shown with team-aware filtering to match the backend rules.

## Presentation tips

- Show the login/signup password toggle before demonstrating the app flow
- Highlight the invite link onboarding path for new company users
- Demonstrate the admin team setup flow before creating projects and tasks
- Use the chat page to show collaboration between team members

---

This frontend pairs with the Node.js backend to provide a complete team task management experience.
