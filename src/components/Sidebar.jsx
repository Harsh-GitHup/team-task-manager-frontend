import { NavLink } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import API from "../api";
import { AuthContext } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext";
import { useUI } from "../context/UIContext";

function Sidebar() {
  const { user, logout } = useContext(AuthContext);
  const { chatNotifications } = useNotifications();
  const { isSidebarOpen } = useUI();

  // Total chat messages across all teams
  const totalChatNotifs = Object.values(chatNotifications).reduce((a, b) => a + b, 0);
  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [showAllProjects, setShowAllProjects] = useState(false);

  const navItems = [
    { to: "/", icon: "🏠", label: "Dashboard" },
    { to: "/projects", icon: "📁", label: "Projects" },
    { to: "/tasks", icon: "✅", label: "Tasks" },
    { to: "/team-members", icon: "👥", label: "Team Members" },
    { to: "/chat", icon: "💬", label: "Chat" },
  ];

  useEffect(() => {
    let cancelled = false;

    const loadProjects = async () => {
      try {
        const res = await API.get("/projects", { params: { limit: 20 } });
        if (!cancelled) {
          setProjects(res.data.projects || res.data || []);
        }
      } catch (e) {
        if (!cancelled) setProjects([]);
        console.error("Failed to load projects:", e);
      } finally {
        if (!cancelled) setLoadingProjects(false);
      }
    };

    loadProjects();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">⚡</div>
          <div>
            <div className="sidebar-logo-text">TaskHub</div>
            <div style={{ fontSize: 11, color: "var(--text3)" }}>Operate your workspace</div>
          </div>
        </div>
      </div>

      {/* Navigation Items */}
      <div className="sidebar-section">
        <div className="sidebar-section-label">Main</div>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
          >
            <span className="nav-item-icon">{item.icon}</span>
            <span>{item.label}</span>
            {item.to === "/chat" && totalChatNotifs > 0 && (
              <span className="sidebar-badge">{totalChatNotifs}</span>
            )}
          </NavLink>
        ))}
        {user?.role === "admin" && (
          <NavLink to="/admin" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
            <span className="nav-item-icon">🛠️</span>
            <span>Admin Center</span>
          </NavLink>
        )}
      </div>

      {/* Projects Section */}
      <div className="sidebar-section sidebar-projects">
        <div className="sidebar-section-label">Projects</div>
        <div style={{ maxHeight: 'calc(100vh - 420px)', overflowY: 'auto' }}>
          {(() => {
            if (loadingProjects) {
              return (
                <div className="loading-shell" style={{ minHeight: 88 }}>
                  <div className="loading-card" style={{ width: "100%", justifyContent: "center" }}>
                    <div className="loader" />
                    <span>Loading...</span>
                  </div>
                </div>
              );
            }

            return !Array.isArray(projects) || projects.length === 0 ? (
              <div style={{ padding: "8px 10px", color: "var(--text3)", fontSize: 13 }}>No projects yet</div>
            ) : (
              <div>
                {projects.slice(0, showAllProjects ? projects.length : 4).map((project) => (
                  <NavLink
                    key={project.id}
                    to={`/projects/${project.id}`}
                    className="project-item"
                  >
                    <span className="project-dot" style={{ background: project.color || "var(--accent)" }} />
                    <span className="truncate">{project.title}</span>
                  </NavLink>
                ))}
                {projects.length > 4 && (
                  <button
                    type="button"
                    className="project-item"
                    onClick={() => setShowAllProjects((prev) => !prev)}
                    style={{ width: "100%", textAlign: "left", background: "transparent", border: "none" }}
                  >
                    <span className="project-dot" style={{ background: "var(--text3)" }} />
                    <span>{showAllProjects ? "See less" : `See more (${projects.length - 4})`}</span>
                  </button>
                )}
              </div>
            );
          })()}
        </div>
      </div>

      <div className="sidebar-footer">
        <div className="user-card">
          <div className="user-avatar" style={{ background: "rgba(124,106,255,0.18)", color: "var(--accent2)" }}>
            {user?.name?.slice(0, 2)?.toUpperCase()}
          </div>
          <div className="user-info">
            <div className="user-name">{user?.name}</div>
            <div className="user-role">
              {(() => {
                if (user?.role === 'admin') return '⚡ Admin';
                if (user?.role === 'head') return '🔰 Head';
                return '👤 Member';
              })()}
            </div>
          </div>
          <button className="logout-btn" onClick={logout} type="button">
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;