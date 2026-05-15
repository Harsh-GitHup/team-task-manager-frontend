import { useState, useEffect, useContext, useCallback } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import API from "../api";
import { AuthContext } from "../context/AuthContext";
import { useNotifications } from "../context/useNotifications";
import PageShell from "../components/PageShell";
import Modal from "../components/Modal";
import EmptyState from "../components/EmptyState";
import Toast from "../components/Toast";
import TaskRow from "../components/TaskRow";
import TaskForm from "../components/TaskForm";

// ─────────────────────────────────────────────────────────
//  Small stat card (local — only used here)
// ─────────────────────────────────────────────────────────
function StatCard({ label, value, sub, variant }) {
  return (
    <div className={`stat-card ${variant}`}>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-sub">{sub}</div>
    </div>
  );
}

StatCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  sub: PropTypes.string,
  variant: PropTypes.string,
};

// ─────────────────────────────────────────────────────────
//  Dashboard
// ─────────────────────────────────────────────────────────
function Dashboard() {
  const { user } = useContext(AuthContext);
  const { socket } = useNotifications();

  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [activities, setActivities] = useState([]);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [toast, setToast] = useState(null);
  const [projectPage, setProjectPage] = useState(1);
  const [activityPage, setActivityPage] = useState(1);
  const projectsPerPage = 4;
  const activitiesPerPage = 5;

  const showToast = (type, title, message) => setToast({ type, title, message });

  const fetchTasks = useCallback(async () => {
    try {
      // For dashboard stats, we might want a higher limit to get accurate totals
      const res = await API.get("/tasks", { params: { limit: 1000 } });
      setTasks(res.data.tasks || res.data || []);
    } catch (err) {
      console.error("Fetch tasks failed", err);
    }
  }, []);

  const fetchProjects = useCallback(async () => {
    try {
      const res = await API.get("/projects", { params: { limit: 1000 } });
      setProjects(res.data.projects || res.data || []);
    } catch (err) {
      console.error("Fetch projects failed", err);
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const [pRes, tRes, uRes, aRes] = await Promise.all([
          API.get("/projects", { params: { limit: 1000 } }),
          API.get("/tasks", { params: { limit: 1000 } }),
          API.get("/auth/users").catch(() => ({ data: [] })),
          API.get("/activities").catch(() => ({ data: [] })),
        ]);
        setProjects(pRes.data.projects || pRes.data || []);
        setTasks(tRes.data.tasks || tRes.data || []);
        setUsers(uRes.data || []);
        setActivities(aRes.data || []);
      } catch (err) {
        console.error("Dashboard load error:", err);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (!socket) {
      return;
    }
    const handleRefreshTask = () => fetchTasks();
    const handleRefreshProjects = () => fetchProjects();

    try {
      socket.on("refresh_tasks", handleRefreshTask);
      socket.on("refresh_projects", handleRefreshProjects);
    } catch (err) {
      console.warn('Failed to attach socket handlers in Dashboard', err);
    }

    return () => {
      try {
        socket.off("refresh_tasks", handleRefreshTask);
        socket.off("refresh_projects", handleRefreshProjects);
      } catch {
        /* ignore cleanup errors */
      }
    };
  }, [fetchTasks, fetchProjects, socket]);

  // Derived stats
  const today = new Date().toISOString().split("T")[0];
  const done = tasks.filter((t) => t.status === "Done").length;
  const inprog = tasks.filter((t) => t.status === "In Progress").length;
  const overdue = tasks.filter((t) => t.due_date && String(t.due_date).slice(0, 10) < today && t.status !== "Done").length;
  const activeTasks = tasks.filter((t) => t.status !== "Done").slice(0, 5);
  const totalProjectPages = Math.max(1, Math.ceil(projects.length / projectsPerPage));
  const currentProjectPage = Math.min(projectPage, totalProjectPages);
  const paginatedProjects = projects.slice((currentProjectPage - 1) * projectsPerPage, currentProjectPage * projectsPerPage);
  const totalActivityPages = Math.max(1, Math.ceil(activities.length / activitiesPerPage));
  const currentActivityPage = Math.min(activityPage, totalActivityPages);
  const paginatedActivities = activities.slice((currentActivityPage - 1) * activitiesPerPage, currentActivityPage * activitiesPerPage);

  // Modal handlers
  const openEdit = (task) => { setEditingTask(task); setTaskModalOpen(true); };
  const closeModal = () => { setTaskModalOpen(false); setEditingTask(null); };

  const saveTask = async (form) => {
    try {
      if (editingTask) {
        const payload = user?.role === "admin"
          ? form
          : { title: form.title, description: form.description, status: form.status, priority: form.priority, due_date: form.due_date };
        await API.put(`/tasks/${editingTask.id}`, payload);
        showToast("success", "Task updated", `${form.title} was saved.`);
      }
      closeModal();
      fetchTasks();
    } catch (err) {
      showToast("error", "Update failed", err.response?.data?.error || "Please try again.");
    }
  };

  return (
    <PageShell
      title="Dashboard"
      actions={
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text2)" }}>👋 Welcome back, {user?.name || "User"}</span>
        </div>
      }
    >
      {/* ── Stat row ── */}
      <div className="stats-grid">
        <StatCard label="TOTAL TASKS" value={tasks.length} sub={`across ${projects.length} projects`} variant="purple" />
        <StatCard label="COMPLETED" value={done} sub={`${tasks.length ? Math.round((done / tasks.length) * 100) : 0}% done rate`} variant="green" />
        <StatCard label="IN PROGRESS" value={inprog} sub={`${users.length} team members`} variant="amber" />
        <StatCard label="OVERDUE" value={overdue} sub={overdue === 0 ? "All on track ✓" : "Need attention"} variant="red" />
      </div>

      {/* ── Two-column layout ── */}
      <div className="dash-grid" style={{ gridTemplateColumns: "2.2fr 1fr" }}>

        {/* Left column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Active tasks */}
          <div className="panel" style={{ padding: 24 }}>
            <div className="section-title" style={{ marginBottom: 24, fontSize: 14, letterSpacing: "0.5px" }}>ACTIVE TASKS</div>
            {activeTasks.length === 0 ? (
              <EmptyState icon="🎉" text="All caught up!" compact />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {activeTasks.map((t) => (
                  <TaskRow key={t.id} task={t} members={users} projects={projects} currentUser={user} onEdit={openEdit} onRefresh={fetchTasks} />
                ))}
              </div>
            )}
          </div>

          {/* Projects overview */}
          <div className="panel" style={{ padding: 24 }}>
            <div className="section-title" style={{ marginBottom: 24, fontSize: 14, letterSpacing: "0.5px" }}>PROJECTS OVERVIEW</div>
            {projects.length === 0 ? (
              <EmptyState icon="📂" text="No projects yet." compact />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

                {/* Pagination */}
                {paginatedProjects.map((p) => {
                  const pTasks = tasks.filter((t) => String(t.project_id) === String(p.id));
                  const pDone = pTasks.filter((t) => t.status === "Done").length;
                  const pct = pTasks.length ? Math.round((pDone / pTasks.length) * 100) : 0;
                  return (
                    <div key={p.id}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <span style={{ fontSize: 18 }}>{p.emoji || "📁"}</span>
                          <span style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{p.title}</span>
                        </div>
                        <span style={{ fontSize: 12, color: "var(--text3)", fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>{pDone}/{pTasks.length}</span>
                      </div>
                      <div className="progress-bar" style={{ height: 6, background: "rgba(255,255,255,0.05)" }}>
                        <div className="progress-fill" style={{ width: `${pct}%`, background: p.color || "var(--accent)", height: "100%", borderRadius: 3 }} />
                      </div>
                    </div>
                  );
                })}
                {totalProjectPages > 1 && (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginTop: 4 }}>
                    <button
                      type="button"
                      onClick={() => setProjectPage((p) => Math.max(1, p - 1))}
                      disabled={currentProjectPage === 1}
                      style={{
                        padding: "8px 12px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.08)",
                        background: currentProjectPage === 1 ? "rgba(255,255,255,0.04)" : "rgba(124,106,255,0.08)",
                        color: currentProjectPage === 1 ? "var(--text3)" : "var(--text)", cursor: currentProjectPage === 1 ? "not-allowed" : "pointer",
                        fontSize: 12, fontWeight: 700
                      }}
                    >
                      Prev
                    </button>
                    <div style={{ fontSize: 12, color: "var(--text3)", fontFamily: "'JetBrains Mono', monospace" }}>
                      {currentProjectPage} / {totalProjectPages}
                    </div>
                    <button
                      type="button"
                      onClick={() => setProjectPage((p) => Math.min(totalProjectPages, p + 1))}
                      disabled={currentProjectPage === totalProjectPages}
                      style={{
                        padding: "8px 12px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.08)",
                        background: currentProjectPage === totalProjectPages ? "rgba(255,255,255,0.04)" : "rgba(124,106,255,0.08)",
                        color: currentProjectPage === totalProjectPages ? "var(--text3)" : "var(--text)", cursor: currentProjectPage === totalProjectPages ? "not-allowed" : "pointer",
                        fontSize: 12, fontWeight: 700
                      }}
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Activity feed */}
          <div className="panel" style={{ padding: 24 }}>
            <div className="section-title" style={{ marginBottom: 24, fontSize: 14, letterSpacing: "0.5px" }}>ACTIVITY FEED</div>
            {activities.length === 0 ? (
              <div style={{ fontSize: 13, color: "var(--text2)", textAlign: "center", padding: 10 }}>No recent activity</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

                {/* Pagination */}
                {paginatedActivities.map((a) => (
                  <div key={a.id} className="activity-item" style={{ gap: 14 }}>
                    <div className="activity-avatar" style={{
                      width: 32, height: 32, fontSize: 11,
                      background: "rgba(124,106,255,0.15)", color: "var(--accent2)"
                    }}>
                      {(a.user_name || "?").slice(0, 2).toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div className="activity-text" style={{ fontSize: 13, lineHeight: 1.5 }} dangerouslySetInnerHTML={{ __html: (a.action || "").replaceAll(/\*\*(.*?)\*\*/g, '<strong style="color:var(--text)">$1</strong>') }} />
                      <div className="activity-time" style={{ marginTop: 4, fontSize: 11, opacity: 0.6 }}>
                        {new Date(a.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>
                  </div>
                ))}
                {totalActivityPages > 1 && (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginTop: 4 }}>
                    <button
                      type="button"
                      onClick={() => setActivityPage((p) => Math.max(1, p - 1))}
                      disabled={currentActivityPage === 1}
                      style={{
                        padding: "8px 12px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.08)",
                        background: currentActivityPage === 1 ? "rgba(255,255,255,0.04)" : "rgba(124,106,255,0.08)",
                        color: currentActivityPage === 1 ? "var(--text3)" : "var(--text)", cursor: currentActivityPage === 1 ? "not-allowed" : "pointer",
                        fontSize: 12, fontWeight: 700
                      }}
                    >
                      Prev
                    </button>
                    <div style={{ fontSize: 12, color: "var(--text3)", fontFamily: "'JetBrains Mono', monospace" }}>
                      {currentActivityPage} / {totalActivityPages}
                    </div>
                    <button
                      type="button"
                      onClick={() => setActivityPage((p) => Math.min(totalActivityPages, p + 1))}
                      disabled={currentActivityPage === totalActivityPages}
                      style={{
                        padding: "8px 12px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.08)",
                        background: currentActivityPage === totalActivityPages ? "rgba(255,255,255,0.04)" : "rgba(124,106,255,0.08)",
                        color: currentActivityPage === totalActivityPages ? "var(--text3)" : "var(--text)", cursor: currentActivityPage === totalActivityPages ? "not-allowed" : "pointer",
                        fontSize: 12, fontWeight: 700
                      }}
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Team overview */}
          <div className="panel" style={{ padding: 24 }}>
            <div className="section-title" style={{ marginBottom: 24, fontSize: 14, letterSpacing: "0.5px" }}>TEAM</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {users.slice(0, 5).map((m) => {
                const mTasks = tasks.filter((t) => String(t.assigned_to) === String(m.id) && t.status !== "Done").length;
                return (
                  <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0" }}>
                    <div className="activity-avatar" style={{ width: 34, height: 34, fontSize: 12, background: "rgba(124,106,255,0.1)", color: "var(--accent)" }}>
                      {m.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{m.name}</div>
                      <div style={{ fontSize: 11, color: "var(--text3)" }}>{mTasks} active task{mTasks === 1 ? "" : "s"}</div>
                    </div>
                    <div style={{
                      fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 4,
                      background: m.role === 'admin' ? "rgba(124,106,255,0.15)" : "rgba(255,255,255,0.05)",
                      color: m.role === 'admin' ? "var(--accent2)" : "var(--text3)",
                      letterSpacing: "0.5px"
                    }}>
                      {(m.role || "user").toUpperCase()}
                    </div>
                  </div>
                );
              })}
            </div>

            {user?.role === "admin" && (
              <Link
                to="/admin"
                style={{
                  display: "block", marginTop: 24, padding: "12px",
                  borderRadius: 12, background: "rgba(124,106,255,0.08)", border: "1px solid rgba(124,106,255,0.2)",
                  color: "var(--accent2)", fontSize: 13, fontWeight: 700,
                  textDecoration: "none", textAlign: "center",
                  transition: "all 0.2s"
                }}
              >
                Open Admin Center
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Task edit modal */}
      <Modal open={taskModalOpen} onClose={closeModal} title={editingTask ? "Edit Task" : "New Task"}>
        <TaskForm
          initialData={editingTask}
          projects={projects}
          users={users.filter((u) => u.role !== "admin")}
          submitLabel={editingTask ? "Update Task" : "Create Task"}
          showProjectSelect={user?.role === "admin"}
          showAssigneeSelect={user?.role === "admin"}
          showStatusSelect
          onSubmit={saveTask}
          onCancel={closeModal}
        />
      </Modal>

      {toast && (
        <div className="toast-stack">
          <Toast type={toast.type} title={toast.title} message={toast.message} onClose={() => setToast(null)} />
        </div>
      )}
    </PageShell>
  );
}

export default Dashboard;
