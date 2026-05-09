import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api";
import { AuthContext } from "../context/AuthContext";
import PageShell from "../components/PageShell";
import Modal from "../components/Modal";
import EmptyState from "../components/EmptyState";
import Toast from "../components/Toast";
import ProjectForm from "../components/ProjectForm";
import TaskForm from "../components/TaskForm";

// Kanban column definitions
const STATUS_COLS = [
  { key: "Todo",        label: "To Do",       color: "#5a5a7a" },
  { key: "In Progress", label: "In Progress", color: "#7c6aff" },
  { key: "Done",        label: "Done",        color: "#2dd4a0" },
];

// ─────────────────────────────────────────────────────────
//  Local: single task row for the list view
// ─────────────────────────────────────────────────────────
function TaskListItem({ task, canModify, onEdit, onDelete }) {
  const isDone = task.status === "Done";
  return (
    <div
      className="task-item"
      onClick={() => canModify && onEdit(task)}
      style={{ cursor: canModify ? "pointer" : "default" }}
    >
      <div className="task-check" style={{ background: isDone ? "var(--green)" : "transparent", borderColor: isDone ? "var(--green)" : "var(--border2)" }}>
        {isDone && "✓"}
      </div>

      <div style={{ flex: 1 }}>
        <div className="task-title" style={{ textDecoration: isDone ? "line-through" : "none", color: isDone ? "var(--text2)" : "var(--text)" }}>
          {task.title}
        </div>
        <div className="task-meta">
          <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 99, textTransform: "uppercase", background: isDone ? "rgba(45,212,160,0.12)" : task.status === "In Progress" ? "rgba(124,106,255,0.15)" : "rgba(255,255,255,0.05)", color: isDone ? "var(--green)" : task.status === "In Progress" ? "var(--accent2)" : "var(--text3)" }}>
            {task.status}
          </span>
          {task.priority && (
            <span className={`tag tag-${task.priority.toLowerCase()}`}>{task.priority.toUpperCase()}</span>
          )}
        </div>
      </div>

      {canModify && (
        <div style={{ display: "flex", gap: 6 }} onClick={(e) => e.stopPropagation()}>
          <button className="icon-btn edit" onClick={() => onEdit(task)}>✎</button>
          <button className="icon-btn del" onClick={() => onDelete(task)}>Del</button>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────
//  Local: kanban card
// ─────────────────────────────────────────────────────────
function KanbanCard({ task, canModify, onEdit, onDelete }) {
  return (
    <div className="kanban-card" onClick={() => canModify && onEdit(task)} style={{ cursor: canModify ? "pointer" : "default", position: "relative" }}>
      {canModify && (
        <div style={{ position: "absolute", top: 10, right: 10, display: "flex", gap: 6 }} onClick={(e) => e.stopPropagation()}>
          <button className="icon-btn edit" onClick={() => onEdit(task)}>✎</button>
          <button className="icon-btn del" onClick={() => onDelete(task)}>Del</button>
        </div>
      )}
      <div className="kanban-card-title">{task.title}</div>
      <div className="kanban-card-footer">
        <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 99, textTransform: "uppercase", background: "rgba(255,255,255,0.05)", color: "var(--text3)" }}>
          {task.status}
        </span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
//  Main page
// ─────────────────────────────────────────────────────────
function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [project, setProject]   = useState(null);
  const [tasks, setTasks]       = useState([]);
  const [projects, setProjects] = useState([]);
  const [teams, setTeams]       = useState([]);
  const [users, setUsers]       = useState([]);
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [taskModalOpen, setTaskModalOpen]       = useState(false);
  const [editingTask, setEditingTask]           = useState(null);
  const [toast, setToast]   = useState(null);
  const [tab, setTab]       = useState("list");

  const showToast = (type, title, message) => setToast({ type, title, message });

  const refreshData = async () => {
    const [pRes, tRes] = await Promise.all([API.get("/projects"), API.get("/tasks")]);
    const allProjects = pRes.data || [];
    const allTasks    = tRes.data || [];
    setProjects(allProjects);
    setProject(allProjects.find((p) => String(p.id) === String(id)));
    setTasks(allTasks.filter((t) => String(t.project_id) === String(id) || String(t.projectId) === String(id)));
  };

  useEffect(() => {
    const load = async () => {
      try {
        const [pRes, tRes, tmRes, uRes] = await Promise.all([
          API.get("/projects"), API.get("/tasks"),
          API.get("/teams"), API.get("/auth/users"),
        ]);
        const allProjects = pRes.data || [];
        const allTasks    = tRes.data || [];
        setProjects(allProjects);
        setTeams(tmRes.data || []);
        setUsers(uRes.data || []);
        setProject(allProjects.find((p) => String(p.id) === String(id)));
        setTasks(allTasks.filter((t) => String(t.project_id) === String(id) || String(t.projectId) === String(id)));
      } catch (err) {
        console.error("Failed to fetch project data", err);
      }
    };
    load();
  }, [id]);

  // Permission helpers
  const canModifyProject = project && (user?.role === "admin" || String(project.created_by) === String(user?.id));
  const canModifyTask = (t) => user?.role === "admin" || String(t.assigned_to) === String(user?.id) || String(t.created_by) === String(user?.id);

  // Modal helpers
  const openTaskEdit  = (task) => { setEditingTask(task); setTaskModalOpen(true); };
  const closeTaskModal = () => { setTaskModalOpen(false); setEditingTask(null); };
  const closeProjectModal = () => setProjectModalOpen(false);

  const saveProject = async (form) => {
    try {
      await API.put(`/projects/${id}`, { title: form.title, description: form.description, team_id: form.team_id });
      showToast("success", "Project updated", `${form.title} was saved.`);
      closeProjectModal();
      await refreshData();
    } catch (err) {
      showToast("error", "Update failed", err.response?.data?.error || "Please try again.");
    }
  };

  const saveTask = async (form) => {
    try {
      const payload = user?.role === "admin"
        ? { title: form.title, description: form.description, status: form.status, project_id: form.project_id, assigned_to: form.assigned_to || null, team_id: project?.team_id || null }
        : { title: form.title, description: form.description, status: form.status };
      await API.put(`/tasks/${editingTask.id}`, payload);
      showToast("success", "Task updated", `${form.title} was saved.`);
      closeTaskModal();
      await refreshData();
    } catch (err) {
      showToast("error", "Update failed", err.response?.data?.error || "Please try again.");
    }
  };

  const deleteTask = async (task) => {
    if (!window.confirm(`Delete "${task.title}"?`)) return;
    try {
      await API.delete(`/tasks/${task.id}`);
      showToast("success", "Task deleted", `${task.title} was removed.`);
      await refreshData();
    } catch (err) {
      showToast("error", "Delete failed", err.response?.data?.error || "Please try again.");
    }
  };

  const deleteProject = async () => {
    if (!window.confirm("Delete this project and all its tasks?")) return;
    try {
      await API.delete(`/projects/${id}`);
      navigate("/projects");
    } catch (err) {
      showToast("error", "Delete failed", err.response?.data?.error || "Please try again.");
    }
  };

  // ── Not found ──
  if (!project) {
    return (
      <PageShell title="Project Not Found">
        <EmptyState icon="😕" text="Project not found or access denied." />
      </PageShell>
    );
  }

  const done = tasks.filter((t) => t.status === "Done").length;
  const pct  = tasks.length ? Math.round((done / tasks.length) * 100) : 0;

  // Topbar breadcrumb + actions
  const topbarTitle = (
    <>
      <span style={{ opacity: 0.4, fontSize: 14, fontWeight: 400, cursor: "pointer" }} onClick={() => navigate("/projects")}>Projects</span>
      <span style={{ opacity: 0.4, margin: "0 6px" }}>/</span>
      {project.emoji} {project.title}
    </>
  );

  const topbarActions = (
    <>
      {canModifyProject && <button className="btn-sm btn-ghost" onClick={() => setProjectModalOpen(true)}>Edit</button>}
      {canModifyProject && <button className="btn-sm btn-danger" onClick={deleteProject}>Delete</button>}
    </>
  );

  return (
    <PageShell title={topbarTitle} actions={topbarActions}>

      {/* ── Progress bar ── */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--text2)", marginBottom: 5 }}>
          <span>{done} of {tasks.length} tasks completed</span>
          <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>{pct}%</span>
        </div>
        <div className="progress-bar" style={{ height: 8 }}>
          <div className="progress-fill" style={{ width: `${pct}%`, background: "linear-gradient(90deg, var(--accent), #9b59ff)" }} />
        </div>
      </div>

      {/* ── View tabs ── */}
      <div className="tabs" style={{ marginBottom: 20 }}>
        <div className={`tab ${tab === "list"   ? "active" : ""}`} onClick={() => setTab("list")}>List</div>
        <div className={`tab ${tab === "kanban" ? "active" : ""}`} onClick={() => setTab("kanban")}>Board</div>
      </div>

      {/* ── List view ── */}
      {tab === "list" && (
        <div className="panel">
          {tasks.length === 0 ? (
            <EmptyState icon="📋" text="No tasks yet. Create your first task!" />
          ) : (
            tasks.map((t) => (
              <TaskListItem key={t.id} task={t} canModify={canModifyTask(t)} onEdit={openTaskEdit} onDelete={deleteTask} />
            ))
          )}
        </div>
      )}

      {/* ── Kanban view ── */}
      {tab === "kanban" && (
        <div className="kanban-board">
          {STATUS_COLS.map((col) => {
            const colTasks = tasks.filter((t) => t.status === col.key);
            return (
              <div key={col.key} className="kanban-col">
                <div className="kanban-header">
                  <div className="kanban-dot" style={{ background: col.color }} />
                  <div className="kanban-title" style={{ color: col.color }}>{col.label}</div>
                  <div className="kanban-count">{colTasks.length}</div>
                </div>
                {colTasks.map((t) => (
                  <KanbanCard key={t.id} task={t} canModify={canModifyTask(t)} onEdit={openTaskEdit} onDelete={deleteTask} />
                ))}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Edit Project modal ── */}
      <Modal open={projectModalOpen} onClose={closeProjectModal} title="Edit Project">
        <div style={{ padding: "0 24px 24px" }}>
          <ProjectForm
            initialData={project}
            teams={teams}
            showTeamSelect={user?.role === "admin"}
            submitLabel="Update Project"
            onSubmit={saveProject}
            onCancel={closeProjectModal}
          />
        </div>
      </Modal>

      {/* ── Edit Task modal ── */}
      <Modal open={taskModalOpen} onClose={closeTaskModal} title="Edit Task">
        <TaskForm
          initialData={editingTask}
          projects={projects}
          users={users.filter((u) => u.role !== "admin")}
          showProjectSelect={user?.role === "admin"}
          showAssigneeSelect={user?.role === "admin"}
          showStatusSelect
          submitLabel="Update Task"
          onSubmit={saveTask}
          onCancel={closeTaskModal}
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

export default ProjectDetail;
