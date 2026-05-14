import { useState, useEffect, useContext, useCallback } from "react";
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
  { label: "OVERDUE", filter: (t, today) => t.due_date && String(t.due_date).slice(0, 10) < today && t.status !== "Done", color: "var(--red)" },
  { label: "IN PROGRESS", filter: (t) => t.status === "In Progress", color: "var(--accent)" },
  { label: "TO DO", filter: (t) => t.status === "Todo", color: "var(--text2)" },
  { label: "IN REVIEW", filter: (t) => t.status === "Review", color: "var(--blue)" },
  { label: "DONE", filter: (t) => t.status === "Done", color: "var(--green)" },
];

function Tasks() {
  const { user } = useContext(AuthContext);

  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [toast, setToast] = useState(null);

  // Large Scale States
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [filterAssignee, setFilterAssignee] = useState("ALL");
  const [filterPriority, setFilterPriority] = useState("ALL");

  const today = new Date().toISOString().split("T")[0];
  const showToast = (type, title, message) => setToast({ type, title, message });

  const fetchTasks = useCallback(async (p = page) => {
    try {
      const params = {
        page: p,
        limit: 20,
        search: search,
        priority: filterPriority === "ALL" ? undefined : filterPriority,
        assigned_to: filterAssignee === "ALL" ? undefined : filterAssignee
      };

      const res = await API.get("/tasks", { params });
      setTasks(res.data.tasks || []);
      setTotalPages(res.data.pagination.totalPages || 1);
    } catch (err) {
      showToast("error", "Could not load tasks", err.response?.data?.error || "Please try again.");
    } finally {
      setLoading(false);
    }
  }, [page, search, filterPriority, filterAssignee]);

  useEffect(() => {
    const loadMetadata = async () => {
      try {
        const [pRes, uRes] = await Promise.all([
          API.get("/projects", { params: { limit: 1000 } }),
          API.get("/auth/users"),
        ]);
        setProjects(pRes.data.projects || pRes.data || []);
        setUsers(uRes.data || []);
      } catch (err) {
        console.error("Metadata load failed", err);
      }
    };
    loadMetadata();

    const socketUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
    console.debug("[Tasks] resolved socketUrl:", socketUrl);
    const socket = io(socketUrl, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      transports: ['websocket']
    });
    socket.on("refresh_tasks", () => fetchTasks());
    return () => socket.disconnect();
  }, [fetchTasks]);

  useEffect(() => {
    // call fetchTasks asynchronously to avoid synchronous setState within effect
    const doFetch = async () => {
      await fetchTasks(page);
    };
    doFetch();
  }, [page, search, filterAssignee, filterPriority, fetchTasks]);

  // Modal helpers
  const openCreate = () => { setEditingTask(null); setTaskModalOpen(true); };
  const openEdit = (task) => { setEditingTask(task); setTaskModalOpen(true); };
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
      fetchTasks();
    } catch (err) {
      showToast("error", editingTask ? "Update failed" : "Creation failed", err.response?.data?.error || "Please try again.");
    }
  };

  const isAdmin = user?.role === "admin";

  const topbarActions = (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
      <input
        className="form-input"
        style={{ width: 160, height: 32, fontSize: 13 }}
        placeholder="Search tasks..."
        value={search}
        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
      />
      <select className="form-select" style={{ width: 130, height: 34 }} value={filterAssignee} onChange={(e) => { setFilterAssignee(e.target.value); setPage(1); }}>
        <option value="ALL">All Assignees</option>
        <option value="UNASSIGNED">Unassigned</option>
        {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
      </select>
      <select className="form-select" style={{ width: 130, height: 34 }} value={filterPriority} onChange={(e) => { setFilterPriority(e.target.value); setPage(1); }}>
        <option value="ALL">All Priorities</option>
        <option value="high">High</option>
        <option value="medium">Medium</option>
        <option value="low">Low</option>
      </select>
      {isAdmin && <button className="btn-sm btn-accent" onClick={openCreate}>+ New Task</button>}
    </div>
  );

  const emptyStateText = search ? "No matches found." : "No tasks yet.";
  let content;

  if (loading) {
    content = <LoadingState label="Loading tasks" />;
  } else if (tasks.length === 0) {
    content = <EmptyState icon="✨" text={emptyStateText} />;
  } else {
    content = (
      <>
        {GROUPS.map((g) => {
          const gTasks = tasks.filter((t) => g.filter(t, today));
          if (gTasks.length === 0) return null;
          return (
            <div key={g.label} style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: g.color, marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
                {g.label}
                <span style={{ background: "var(--bg3)", color: "var(--text3)", padding: "1px 6px", borderRadius: 4, fontSize: 10 }}>
                  {gTasks.length}
                </span>
              </div>
              <div className="panel" style={{ padding: 4 }}>
                {gTasks.map((t) => (
                  <TaskRow key={t.id} task={t} members={users} projects={projects} currentUser={user} onEdit={openEdit} onRefresh={() => fetchTasks()} />
                ))}
              </div>
            </div>
          );
        })}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16, marginTop: 32, marginBottom: 40 }}>
            <button
              className="btn-sm btn-ghost"
              disabled={page === 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
            >
              Previous
            </button>
            <span style={{ fontSize: 13, color: 'var(--text2)' }}>
              Page <strong>{page}</strong> of {totalPages}
            </span>
            <button
              className="btn-sm btn-ghost"
              disabled={page === totalPages}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            >
              Next
            </button>
          </div>
        )}
      </>
    );
  }

  return (
    <PageShell title="Tasks" actions={topbarActions}>
      {content}

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