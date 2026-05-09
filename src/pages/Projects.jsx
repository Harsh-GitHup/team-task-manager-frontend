import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import { AuthContext } from "../context/AuthContext";
import PageShell from "../components/PageShell";
import Modal from "../components/Modal";
import EmptyState from "../components/EmptyState";
import Toast from "../components/Toast";
import LoadingState from "../components/LoadingState";
import ProjectForm from "../components/ProjectForm";

// ─────────────────────────────────────────────────────────
//  Single project card
// ─────────────────────────────────────────────────────────
function ProjectCard({ project, taskCount, done, onEdit, onDelete, onClick }) {
  const pct = taskCount ? Math.round((done / taskCount) * 100) : 0;
  const color = project.color || "var(--accent)";

  return (
    <div className="project-card" onClick={onClick} style={{ position: "relative" }}>
      {/* Edit / delete actions */}
      {(onEdit || onDelete) && (
        <div
          style={{ position: "absolute", top: 14, right: 14, display: "flex", gap: 6 }}
          onClick={(e) => e.stopPropagation()}
        >
          {onEdit && <button className="icon-btn edit" onClick={onEdit}>✎</button>}
          {onDelete && <button className="icon-btn del" onClick={onDelete}>Del</button>}
        </div>
      )}

      {/* Top colour accent */}
      <div style={{ height: 3, background: `linear-gradient(90deg, ${color}, rgba(255,255,255,0.18))`, borderRadius: 3, marginBottom: 16, opacity: 0.8 }} />

      <div className="project-card-top">
        <span className="project-emoji">{project.emoji || "📁"}</span>
        <span className="project-name">{project.title}</span>
      </div>

      <p className="project-desc">{project.description || "No description"}</p>

      {/* Progress */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--text2)", marginBottom: 5 }}>
          <span>Progress</span>
          <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>{pct}%</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}, rgba(255,255,255,0.2))` }} />
        </div>
      </div>

      <div className="project-stats">
        <span><strong>{taskCount}</strong> tasks</span>
        <span><strong>{done}</strong> done</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
//  Main page
// ─────────────────────────────────────────────────────────
function Projects() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [teams, setTeams] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);

  const showToast = (type, title, message) => setToast({ type, title, message });

  const refreshProjects = async () => {
    const res = await API.get("/projects");
    setProjects(res.data || []);
  };

  useEffect(() => {
    const load = async () => {
      try {
        const [pRes, tRes, tmRes] = await Promise.all([
          API.get("/projects"),
          API.get("/tasks"),
          API.get("/teams"),
        ]);
        setProjects(pRes.data || []);
        setTasks(tRes.data || []);
        setTeams(tmRes.data || []);
      } catch (err) {
        showToast("error", "Could not load projects", err.response?.data?.error || "Please try again.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const openCreate = () => { setEditingProject(null); setModalOpen(true); };
  const openEdit = (p) => { setEditingProject(p); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditingProject(null); };

  const saveProject = async (form) => {
    try {
      if (editingProject) {
        await API.put(`/projects/${editingProject.id}`, { title: form.title, description: form.description, team_id: form.team_id, color: form.color });
        showToast("success", "Project updated", `${form.title} was saved.`);
      } else {
        await API.post("/projects", { title: form.title, description: form.description, team_id: form.team_id, color: form.color });
        showToast("success", "Project created", `${form.title} was created.`);
      }
      closeModal();
      await refreshProjects();
    } catch (err) {
      showToast("error", editingProject ? "Update failed" : "Creation failed", err.response?.data?.error || "Please try again.");
    }
  };

  const deleteProject = async (project, e) => {
    e.stopPropagation();
    if (!window.confirm(`Delete "${project.title}"? This removes all tasks in the project.`)) return;
    try {
      await API.delete(`/projects/${project.id}`);
      showToast("success", "Project deleted", `${project.title} was removed.`);
      await refreshProjects();
      const tRes = await API.get("/tasks");
      setTasks(tRes.data || []);
    } catch (err) {
      showToast("error", "Delete failed", err.response?.data?.error || "Please try again.");
    }
  };

  const canModify = (p) => user?.role === "admin" || String(p.created_by) === String(user?.id);

  const isAdmin = user?.role === "admin";

  return (
    <PageShell
      title="Projects"
      actions={isAdmin && <button className="btn-sm btn-accent" onClick={openCreate}>+ New Project</button>}
    >
      {loading ? (
        <LoadingState label="Loading projects" />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
          {projects.length === 0 && (
            <div style={{ gridColumn: "1 / -1" }}>
              <EmptyState icon="📭" text="No projects yet. Create your first project!" />
            </div>
          )}

          {projects.map((p) => {
            const pTasks = tasks.filter((t) => String(t.project_id) === String(p.id));
            const done = pTasks.filter((t) => t.status === "Done").length;
            return (
              <ProjectCard
                key={p.id}
                project={p}
                taskCount={pTasks.length}
                done={done}
                onClick={() => navigate(`/projects/${p.id}`)}
                onEdit={canModify(p) ? () => openEdit(p) : undefined}
                onDelete={canModify(p) ? (e) => deleteProject(p, e) : undefined}
              />
            );
          })}

          {/* "New Project" ghost card */}
          {isAdmin && (
            <div
              className="project-card"
              onClick={openCreate}
              style={{ borderStyle: "dashed", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 200, opacity: 0.5, transition: "opacity 0.2s" }}
              onMouseOver={(e) => (e.currentTarget.style.opacity = "1")}
              onMouseOut={(e) => (e.currentTarget.style.opacity = "0.5")}
            >
              <div style={{ fontSize: 28, marginBottom: 8 }}>+</div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>New Project</div>
            </div>
          )}
        </div>
      )}

      <Modal open={modalOpen} onClose={closeModal} title={editingProject ? "Edit Project" : "New Project"}>
        <div style={{ padding: "0 24px 24px" }}>
          <ProjectForm
            initialData={editingProject}
            teams={teams}
            submitLabel={editingProject ? "Update Project" : "Create Project"}
            onSubmit={saveProject}
            onCancel={closeModal}
            showTeamSelect={isAdmin}
          />
        </div>
      </Modal>

      {toast && (
        <div className="toast-stack">
          <Toast type={toast.type} title={toast.title} message={toast.message} onClose={() => setToast(null)} />
        </div>
      )}
    </PageShell>
  );
}

export default Projects;