import { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import API from "../api";
import { AuthContext } from "../context/AuthContext";
import { io } from "socket.io-client";
import PageShell from "../components/PageShell";
import Modal from "../components/Modal";
import EmptyState from "../components/EmptyState";
import MemberCard from "../components/MemberCard";
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

// ─────────────────────────────────────────────────────────
//  Dashboard
// ─────────────────────────────────────────────────────────
function Dashboard() {
  const { user } = useContext(AuthContext);

  const [projects, setProjects] = useState([]);
  const [tasks, setTasks]       = useState([]);
  const [users, setUsers]       = useState([]);
  const [activities, setActivities] = useState([]);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask]     = useState(null);
  const [toast, setToast]                 = useState(null);

  const showToast = (type, title, message) => setToast({ type, title, message });

  const fetchTasks = async () => {
    const res = await API.get("/tasks").catch(() => ({ data: [] }));
    setTasks(res.data || []);
  };

  useEffect(() => {
    const load = async () => {
      try {
        const [pRes, tRes, uRes, aRes] = await Promise.all([
          API.get("/projects"),
          API.get("/tasks"),
          API.get("/auth/users").catch(() => ({ data: [] })),
          API.get("/activities").catch(() => ({ data: [] })),
        ]);
        setProjects(pRes.data || []);
        setTasks(tRes.data || []);
        setUsers(uRes.data || []);
        setActivities(aRes.data || []);
      } catch (err) {
        console.error("Dashboard load error:", err);
      }
    };
    load();

    const socket = io(import.meta.env.VITE_API_URL || "http://localhost:5000");
    socket.on("refresh_tasks", fetchTasks);
    socket.on("refresh_projects", () => API.get("/projects").then((r) => setProjects(r.data || [])));
    return () => socket.disconnect();
  }, []);

  // Derived stats
  const today   = new Date().toISOString().split("T")[0];
  const done    = tasks.filter((t) => t.status === "Done").length;
  const inprog  = tasks.filter((t) => t.status === "In Progress").length;
  const overdue = tasks.filter((t) => t.due_date && String(t.due_date).slice(0, 10) < today && t.status !== "Done").length;
  const activeTasks = tasks.filter((t) => t.status !== "Done").slice(0, 5);

  // Modal handlers
  const openEdit  = (task) => { setEditingTask(task); setTaskModalOpen(true); };
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
      actions={<span style={{ fontSize: 12, color: "var(--text2)" }}>👋 Welcome back, {user?.name?.split(" ")[0]}</span>}
    >
      {/* ── Stat row ── */}
      <div className="stats-grid">
        <StatCard label="Total Tasks"  value={tasks.length} sub={`across ${projects.length} projects`} variant="purple" />
        <StatCard label="Completed"    value={done}         sub={`${tasks.length ? Math.round((done / tasks.length) * 100) : 0}% done rate`} variant="green" />
        <StatCard label="In Progress"  value={inprog}       sub={`${users.length} team members`}         variant="amber" />
        <StatCard label="Overdue"      value={overdue}      sub={overdue === 0 ? "All on track ✓" : "Need attention"} variant="red" />
      </div>

      {/* ── Two-column layout ── */}
      <div className="dash-grid">

        {/* Left column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Active tasks */}
          <div className="panel">
            <div className="section-title">Active Tasks</div>
            {activeTasks.length === 0 ? (
              <EmptyState icon="🎉" text="All caught up!" compact />
            ) : (
              activeTasks.map((t) => (
                <TaskRow key={t.id} task={t} members={users} projects={projects} currentUser={user} onEdit={openEdit} onRefresh={fetchTasks} />
              ))
            )}
          </div>

          {/* Projects overview */}
          <div className="panel">
            <div className="section-title">Projects Overview</div>
            {projects.length === 0 ? (
              <EmptyState icon="📂" text="No projects yet." compact />
            ) : (
              projects.map((p) => {
                const pTasks = tasks.filter((t) => String(t.project_id) === String(p.id));
                const pDone  = pTasks.filter((t) => t.status === "Done").length;
                const pct    = pTasks.length ? Math.round((pDone / pTasks.length) * 100) : 0;
                return (
                  <div key={p.id} style={{ marginBottom: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                      <span style={{ fontSize: 14, fontWeight: 600 }}>{p.emoji || "📁"} {p.title}</span>
                      <span style={{ fontSize: 12, color: "var(--text2)", fontFamily: "'JetBrains Mono', monospace" }}>{pDone}/{pTasks.length}</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${pct}%`, background: p.color || "var(--accent)" }} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Activity feed */}
          <div className="panel">
            <div className="section-title">Activity Feed</div>
            {activities.length === 0 ? (
              <div style={{ fontSize: 13, color: "var(--text2)", textAlign: "center", padding: 10 }}>No recent activity</div>
            ) : (
              activities.slice(0, 5).map((a) => (
                <div key={a.id} className="activity-item">
                  <div className="activity-avatar" style={{ background: "rgba(124,106,255,0.1)", color: "var(--accent)" }}>
                    {(a.user_name || "?").slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="activity-text" dangerouslySetInnerHTML={{ __html: `<strong>${a.user_name}</strong> ${a.action}` }} />
                    <div className="activity-time">
                      {new Date(a.created_at).toLocaleDateString()}{" "}
                      {new Date(a.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Team overview */}
          <div className="panel">
            <div className="section-title">Team</div>
            {users.slice(0, 4).map((m) => {
              const mTasks = tasks.filter((t) => String(t.assigned_to) === String(m.id) && t.status !== "Done").length;
              return (
                <MemberCard
                  key={m.id}
                  member={m}
                  canEdit={false}
                  extra={
                    <div style={{ fontSize: 11, color: "var(--text2)", marginLeft: "auto", marginRight: 10 }}>
                      {mTasks} active task{mTasks !== 1 ? "s" : ""}
                    </div>
                  }
                />
              );
            })}

            {user?.role === "admin" && (
              <Link
                to="/admin"
                style={{
                  display: "block", marginTop: 16, padding: "10px 14px",
                  borderRadius: 8, background: "var(--bg3)", border: "1px solid var(--border)",
                  color: "var(--text)", fontSize: 13, fontWeight: 600,
                  textDecoration: "none", textAlign: "center",
                }}
              >
                Open Admin Center →
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
