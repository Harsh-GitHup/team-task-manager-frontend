import { useState, useEffect, useContext, useMemo } from "react";
import API from "../api";
import { AuthContext } from "../context/AuthContext";
import { io } from "socket.io-client";
import PageShell from "../components/PageShell";
import Modal from "../components/Modal";
import EmptyState from "../components/EmptyState";
import Toast from "../components/Toast";
import LoadingState from "../components/LoadingState";
import TaskForm from "../components/TaskForm";
import TaskRow from "../components/TaskRow";

// Group definitions for the task list
const GROUPS = [
  { label: "OVERDUE",     filter: (t, today) => t.due_date && String(t.due_date).slice(0, 10) < today && t.status !== "Done", color: "var(--red)" },
  { label: "IN PROGRESS", filter: (t)        => t.status === "In Progress",                                                    color: "var(--accent)" },
  { label: "TO DO",       filter: (t)        => t.status === "Todo",                                                           color: "var(--text2)" },
  { label: "IN REVIEW",   filter: (t)        => t.status === "Review",                                                         color: "var(--blue)" },
  { label: "DONE",        filter: (t)        => t.status === "Done",                                                           color: "var(--green)" },
];

function Tasks() {
  const { user } = useContext(AuthContext);

  const [tasks, setTasks]       = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask]     = useState(null);
  const [toast, setToast]                 = useState(null);
  const [filterAssignee, setFilterAssignee] = useState("ALL");
  const [filterPriority, setFilterPriority] = useState("ALL");

  const today    = new Date().toISOString().split("T")[0];
  const showToast = (type, title, message) => setToast({ type, title, message });

  const refreshTasks = async () => {
    const res = await API.get("/tasks").catch(() => ({ data: [] }));
    setTasks(res.data || []);
  };

  useEffect(() => {
    const load = async () => {
      try {
        const [tRes, pRes, uRes] = await Promise.all([
          API.get("/tasks"),
          API.get("/projects"),
          API.get("/auth/users"),
        ]);
        setTasks(tRes.data || []);
        setProjects(pRes.data || []);
        setUsers(uRes.data || []);
      } catch (err) {
        showToast("error", "Could not load tasks", err.response?.data?.error || "Please try again.");
      } finally {
        setLoading(false);
      }
    };
    load();

    const socket = io(import.meta.env.VITE_API_URL || "http://localhost:5000");
    socket.on("refresh_tasks", () => API.get("/tasks").then((r) => setTasks(r.data || [])));
    return () => socket.disconnect();
  }, []);

  // Modal helpers
  const openCreate = () => { setEditingTask(null); setTaskModalOpen(true); };
  const openEdit   = (task) => { setEditingTask(task); setTaskModalOpen(true); };
  const closeModal = () => { setTaskModalOpen(false); setEditingTask(null); };

  const saveTask = async (form) => {
    try {
      const selectedProject = projects.find((p) => String(p.id) === String(form.project_id));
      const basePayload = { title: form.title, description: form.description, status: form.status, priority: form.priority, due_date: form.due_date || null };
      const adminPayload = { ...basePayload, project_id: form.project_id, assigned_to: form.assigned_to || null, team_id: selectedProject?.team_id || null };

      if (editingTask) {
        await API.put(`/tasks/${editingTask.id}`, user?.role === "admin" ? adminPayload : basePayload);
        showToast("success", "Task updated", `${form.title} was saved.`);
      } else {
        await API.post("/tasks", adminPayload);
        showToast("success", "Task created", `${form.title} was created.`);
      }
      closeModal();
      await refreshTasks();
    } catch (err) {
      showToast("error", editingTask ? "Update failed" : "Creation failed", err.response?.data?.error || "Please try again.");
    }
  };

  // Filtered & grouped tasks
  const filteredTasks = useMemo(() => tasks.filter((t) => {
    if (filterAssignee !== "ALL") {
      if (filterAssignee === "UNASSIGNED" && t.assigned_to) return false;
      if (filterAssignee !== "UNASSIGNED" && String(t.assigned_to) !== filterAssignee) return false;
    }
    if (filterPriority !== "ALL" && t.priority !== filterPriority) return false;
    return true;
  }), [tasks, filterAssignee, filterPriority]);

  const isAdmin = user?.role === "admin";

  const topbarActions = (
    <>
      <select className="form-select" style={{ width: 140 }} value={filterAssignee} onChange={(e) => setFilterAssignee(e.target.value)}>
        <option value="ALL">All Assignees</option>
        <option value="UNASSIGNED">Unassigned</option>
        {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
      </select>
      <select className="form-select" style={{ width: 120 }} value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}>
        <option value="ALL">All Priorities</option>
        <option value="high">High</option>
        <option value="medium">Medium</option>
        <option value="low">Low</option>
      </select>
      {isAdmin && <button className="btn-sm btn-accent" onClick={openCreate}>+ New Task</button>}
    </>
  );

  return (
    <PageShell title="My Tasks" actions={topbarActions}>
      {loading ? (
        <LoadingState label="Loading tasks" />
      ) : filteredTasks.length === 0 ? (
        <EmptyState icon="✨" text="No tasks yet. Create one to get started!" />
      ) : (
        GROUPS.map((g) => {
          const gTasks = filteredTasks.filter((t) => g.filter(t, today));
          if (gTasks.length === 0) return null;
          return (
            <div key={g.label} style={{ marginBottom: 24 }}>
              {/* Group header */}
              <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: g.color, marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
                {g.label}
                <span style={{ background: "var(--bg3)", color: "var(--text2)", padding: "1px 8px", borderRadius: 99, fontSize: 11 }}>
                  {gTasks.length}
                </span>
              </div>
              <div className="panel" style={{ padding: 8 }}>
                {gTasks.map((t) => (
                  <TaskRow key={t.id} task={t} members={users} projects={projects} currentUser={user} onEdit={openEdit} onRefresh={refreshTasks} />
                ))}
              </div>
            </div>
          );
        })
      )}

      <Modal open={taskModalOpen} onClose={closeModal} title={editingTask ? "Edit Task" : "New Task"}>
        <TaskForm
          initialData={editingTask}
          projects={projects}
          users={users.filter((u) => u.role !== "admin")}
          submitLabel={editingTask ? "Update Task" : "Create Task"}
          showProjectSelect={isAdmin}
          showAssigneeSelect={isAdmin}
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

export default Tasks;