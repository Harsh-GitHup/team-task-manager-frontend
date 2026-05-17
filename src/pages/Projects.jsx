import { useState, useEffect, useContext, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import API from "../api";
import { AuthContext } from "../context/AuthContext";
import PageShell from "../components/PageShell";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";
import EmptyState from "../components/EmptyState";
import Toast from "../components/Toast";
import LoadingState from "../components/LoadingState";
import ProjectForm from "../components/ProjectForm";

// ─────────────────────────────────────────────────────────
//  Single project card
// ─────────────────────────────────────────────────────────
function ProjectCard({ project, taskCount, done, memberCount, onEdit, onDelete, onClick }) {
  const pct = taskCount ? Math.round((done / taskCount) * 100) : 0;
  const color = project.color || "var(--accent)";

  const handleCardKeyDown = (e) => {
    if (!onClick) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick(e);
    }
  };

  return (
    <button
      className="project-card"
      onClick={onClick}
      onKeyDown={handleCardKeyDown}
      style={{ "--project-color": color }}
      type="button"
      tabIndex={0}
    >
      <div className="project-card-top">
        <span className="project-emoji">{project.emoji}</span>
        <span className="project-name">{project.title}</span>
      </div>

      <p className="project-desc">{project.description || "No description provided for this project."}</p>

      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "var(--text2)", marginBottom: 8, fontWeight: 500 }}>
          <span>Progress</span>
          <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>{pct}%</span>
        </div>
        <div className="progress-bar" style={{ height: 8 }}>
          <div className="progress-fill" style={{ width: `${pct}%`, background: color }} />
        </div>
      </div>

      <div className="project-stats">
        <div className="stat-item"><strong>{taskCount}</strong> tasks</div>
        <div className="stat-item"><strong>{done}</strong> done</div>
        <div className="stat-item"><strong>{memberCount || 0}</strong> members</div>
      </div>

      {(onEdit || onDelete) && (
        <div className="project-card-actions">
          {onEdit && <button className="icon-btn edit" onClick={(e) => { e.stopPropagation(); onEdit(e); }} title="Edit Project">✎</button>}
          {onDelete && <button className="icon-btn del" onClick={(e) => { e.stopPropagation(); onDelete(e); }} title="Delete Project">🗑️</button>}
        </div>
      )}
    </button>
  );
}

ProjectCard.propTypes = {
  project: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    emoji: PropTypes.string,
    color: PropTypes.string,
  }).isRequired,
  taskCount: PropTypes.number.isRequired,
  done: PropTypes.number.isRequired,
  memberCount: PropTypes.number,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  onClick: PropTypes.func,
};

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
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);

  // Pagination & Search States
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");

  const showToast = (type, title, message) => setToast({ type, title, message });

  const fetchProjects = useCallback(async (p = page) => {
    try {
      const res = await API.get("/projects", { params: { page: p, limit: 12, search } });
      setProjects(res.data.projects || []);
      setTotalPages(res.data.pagination.totalPages || 1);
    } catch (err) {
      showToast("error", "Could not load projects", err.response?.data?.error || "Please try again.");
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [tRes, tmRes] = await Promise.all([
          API.get("/tasks", { params: { limit: 1000 } }), // Get all tasks for stats
          API.get("/teams"),
        ]);
        setTasks(tRes.data.tasks || tRes.data || []);
        setTeams(tmRes.data || []);
      } catch (err) {
        console.error("Failed to load metadata", err);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    (async () => {
      await fetchProjects(page);
    })();
  }, [page, search, fetchProjects]);

  const openCreate = () => { setEditingProject(null); setModalOpen(true); };
  const openEdit = (p) => { setEditingProject(p); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditingProject(null); };

  const saveProject = async (form) => {
    try {
      if (editingProject) {
        await API.put(`/projects/${editingProject.id}`, { title: form.title, description: form.description, team_id: form.team_id, color: form.color, emoji: form.emoji });
        showToast("success", "Project updated", `${form.title} was saved.`);
      } else {
        await API.post("/projects", { title: form.title, description: form.description, team_id: form.team_id, color: form.color, emoji: form.emoji });
        showToast("success", "Project created", `${form.title} was created.`);
      }
      closeModal();
      fetchProjects();
    } catch (err) {
      showToast("error", editingProject ? "Update failed" : "Creation failed", err.response?.data?.error || "Please try again.");
    }
  };

  const openDeleteProject = (project) => setDeleteConfirm(project);
  const closeDeleteConfirm = () => setDeleteConfirm(null);

  const confirmDeleteProject = async () => {
    if (!deleteConfirm) return;
    try {
      await API.delete(`/projects/${deleteConfirm.id}`);
      showToast("success", "Project deleted", `${deleteConfirm.title} was removed.`);
      fetchProjects();
      closeDeleteConfirm();
    } catch (err) {
      showToast("error", "Delete failed", err.response?.data?.error || "Please try again.");
    }
  };

  const canModify = (p) => user?.role === "admin" || String(p.created_by) === String(user?.id);
  const isAdmin = user?.role === "admin";

  const topbarActions = (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <input
        className="form-input"
        style={{ width: 180, height: 32, fontSize: 13 }}
        placeholder="Search projects..."
        value={search}
        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
      />
      {isAdmin && <button className="btn-sm btn-accent" onClick={openCreate}>+ New Project</button>}
    </div>
  );

  return (
    <PageShell title="Projects" actions={topbarActions}>
      {loading ? (
        <LoadingState label="Loading projects" />
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
            {projects.length === 0 && (
              <div style={{ gridColumn: "1 / -1" }}>
                <EmptyState icon="📭" text={search ? "No projects match your search." : "No projects yet."} />
              </div>
            )}

            {projects.map((p) => {
              const pTasks = tasks.filter((t) => String(t.project_id) === String(p.id));
              const done = pTasks.filter((t) => t.status === "Done").length;
              const team = teams.find(t => String(t.id) === String(p.team_id));
              return (
                <ProjectCard
                  key={p.id}
                  project={p}
                  taskCount={pTasks.length}
                  done={done}
                  memberCount={team?.member_count || 0}
                  onClick={() => navigate(`/projects/${p.id}`)}
                  onEdit={canModify(p) ? () => openEdit(p) : undefined}
                  onDelete={canModify(p) ? () => openDeleteProject(p) : undefined}
                />
              );
            })}

            {/* "New Project" ghost card */}
            {isAdmin && !search && projects.length < 12 && (
              <button
                type="button"
                className="project-card"
                onClick={openCreate}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    openCreate();
                  }
                }}
                style={{
                  borderStyle: "dashed",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: 250,
                  opacity: 0.5,
                  transition: "all 0.2s",
                  "--project-color": "transparent",
                  cursor: "pointer",
                  padding: 0,
                  width: "100%"
                }}
                onMouseOver={(e) => (e.currentTarget.style.opacity = "1")}
                onMouseOut={(e) => (e.currentTarget.style.opacity = "0.5")}
                onFocus={(e) => (e.currentTarget.style.opacity = "1")}
                onBlur={(e) => (e.currentTarget.style.opacity = "0.5")}
              >
                <div style={{ fontSize: 32, marginBottom: 12, color: "var(--text3)" }}>+</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text2)" }}>New Project</div>
              </button>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16, marginTop: 40, marginBottom: 40 }}>
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

      <ConfirmDialog
        open={deleteConfirm !== null}
        title="Delete Project"
        message={deleteConfirm ? <>Delete <strong>{deleteConfirm.title}</strong>? This removes all tasks in the project.</> : ""}
        confirmLabel="Delete Project"
        onClose={closeDeleteConfirm}
        onConfirm={confirmDeleteProject}
      />

      {toast && (
        <div className="toast-stack">
          <Toast type={toast.type} title={toast.title} message={toast.message} onClose={() => setToast(null)} />
        </div>
      )}
    </PageShell>
  );
}

export default Projects;