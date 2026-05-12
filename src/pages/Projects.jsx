import { useState, useEffect, useContext, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import { AuthContext } from "../context/AuthContext";
import PageShell from "../components/PageShell";
import Modal from "../components/Modal";
import EmptyState from "../components/EmptyState";
import Toast from "../components/Toast";
import LoadingState from "../components/LoadingState";
import ProjectForm from "../components/ProjectForm";
import ProjectCard from "../components/ProjectCard";
import Pagination from "../components/Pagination";

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

  const deleteProject = async (project, e) => {
    e.stopPropagation();
    if (!globalThis.confirm(`Delete "${project.title}"? This removes all tasks in the project.`)) return;
    try {
      await API.delete(`/projects/${project.id}`);
      showToast("success", "Project deleted", `${project.title} was removed.`);
      fetchProjects();
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
                  onDelete={canModify(p) ? (e) => deleteProject(p, e) : undefined}
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
            <Pagination
              page={page}
              totalPages={totalPages}
              onPrev={() => setPage((p) => Math.max(1, p - 1))}
              onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
            />
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

      {toast && (
        <div className="toast-stack">
          <Toast type={toast.type} title={toast.title} message={toast.message} onClose={() => setToast(null)} />
        </div>
      )}
    </PageShell>
  );
}

export default Projects;