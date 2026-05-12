import { Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";
import { useUI } from "./context/UIContext";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import Tasks from "./pages/Tasks";
import Chat from "./pages/Chat";
import TeamMembers from "./pages/TeamMembers";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Admin from "./pages/Admin";
import InviteJoin from "./pages/InviteJoin";

function App() {
  const { user } = useContext(AuthContext);
  const { isSidebarOpen, closeSidebar } = useUI();
  const isAuthenticated = Boolean(user);

  return (
    <>
      {isAuthenticated ? (
        <div className={`app-shell ${isSidebarOpen ? 'sidebar-open' : ''}`}>
          <Sidebar />

          {isSidebarOpen && (
            <button
              type="button"
              className="sidebar-backdrop"
              onClick={closeSidebar}
              aria-label="Close sidebar"
            />
          )}

          <div
            style={{
              pointerEvents: "none",
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(ellipse 800px 600px at 50% 30%, rgba(124,106,255,0.12) 0%, transparent 70%)",
              opacity: 0.3,
            }}
          />
          <div className="app-shell-inner">
            <div className="app-shell-main">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/projects/:id" element={<ProjectDetail />} />
                <Route path="/tasks" element={<Tasks />} />
                <Route path="/team-members" element={<TeamMembers />} />
                <Route path="/chat" element={<Chat />} />
                <Route path="/invite/:token" element={<InviteJoin />} />
                <Route
                  path="/admin"
                  element={
                    user?.role === "admin" ? <Admin /> : <Navigate to="/" />
                  }
                />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </div>
          </div>
        </div>
      ) : (
        /* Public Routes: Only show if not logged in */
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/invite/:token" element={<InviteJoin />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      )}
    </>
  );
}

export default App;