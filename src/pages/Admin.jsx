import PropTypes from "prop-types";
import { useState, useEffect, useMemo, useCallback } from "react";
import API from "../api";
import PageShell from "../components/PageShell";
import Modal from "../components/Modal";
import EmptyState from "../components/EmptyState";
import Toast from "../components/Toast";
import LoadingState from "../components/LoadingState";
import TeamForm from "../components/TeamForm";
import MemberCard from "../components/MemberCard";
import PanelSection from "../components/PanelSection";

// ─────────────────────────────────────────────────────────
//  Local: labelled form field row
// ─────────────────────────────────────────────────────────
function FieldRow({ label, children }) {
  return (
    <div>
      <div style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text2)", marginBottom: 6 }}>{label}</div>
      {children}
    </div>
  );
}

FieldRow.propTypes = {
  label: PropTypes.string.isRequired,
  children: PropTypes.node,
};

// ─────────────────────────────────────────────────────────
//  Admin page
// ─────────────────────────────────────────────────────────
function Admin() {

  const [teams, setTeams] = useState([]);
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [members, setMembers] = useState([]);
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [teamName, setTeamName] = useState("");
  const [teamMemberId, setTeamMemberId] = useState("");
  const [teamHeadId, setTeamHeadId] = useState("");
  const [userSearch, setUserSearch] = useState("");

  const [projectForm, setProjectForm] = useState({ title: "", description: "" });
  const [taskForm, setTaskForm] = useState({ title: "", project_id: "", assigned_to: "" });
  const [teamModalOpen, setTeamModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [roleModalMember, setRoleModalMember] = useState(null);
  const [roleModalValue, setRoleModalValue] = useState("member");
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);

  const showToast = (type, title, message) => setToast({ type, title, message });

  const selectedTeamProjects = useMemo(
    () => projects.filter((p) => String(p.team_id) === String(selectedTeamId)),
    [projects, selectedTeamId]
  );

  // ── API helpers ──
  const refreshTeams = async () => { const r = await API.get("/teams"); setTeams(r.data || []); };
  const refreshMembers = async (id = selectedTeamId) => {
    if (!id) { setMembers([]); return; }
    const r = await API.get(`/teams/${id}/members`);
    setMembers(r.data || []);
  };

  const fetchUsers = useCallback(async (query = "") => {
    try {
      const res = await API.get("/auth/users", { params: { search: query } });
      setUsers(res.data || []);
    } catch (err) {
      console.error("Fetch users failed", err);
    }
  }, []);

  // ── Initial load ──
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [tRes, pRes] = await Promise.all([API.get("/teams"), API.get("/projects")]);
        if (cancelled) return;
        const loadedTeams = tRes.data || [];
        setTeams(loadedTeams);
        setProjects(pRes.data.projects || pRes.data || []);

        await fetchUsers(""); // Initial user load

        const firstId = loadedTeams[0] ? String(loadedTeams[0].id) : "";
        setSelectedTeamId((prev) => prev || firstId);
      } catch (err) {
        if (!cancelled) showToast("error", "Failed to load data", err.response?.data?.error || "Please try again.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [fetchUsers]);

  // Debounced user search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers(userSearch);
    }, 400);
    return () => clearTimeout(timer);
  }, [userSearch, fetchUsers]);

  // ── Load members when team changes ──
  useEffect(() => {
    let cancelled = false;
    if (!selectedTeamId) {
      // Avoid synchronous setState inside effect which can cause cascading renders
      // schedule clearing members asynchronously
      setTimeout(() => setMembers([]), 0);
      return;
    }
    API.get(`/teams/${selectedTeamId}/members`)
      .then((r) => { if (!cancelled) setMembers(r.data || []); })
      .catch(() => { });
    return () => { cancelled = true; };
  }, [selectedTeamId]);

  // ── Action handlers ──
  const createInvite = async () => {
    try {
      const res = await API.post("/invites", { team_id: selectedTeamId });
      // Build link on frontend using current origin to avoid localhost issues in deployment
      const inviteLink = `${globalThis.location.origin}/invite/${res.data.token}`;
      await navigator.clipboard.writeText(inviteLink);
      showToast("success", "Invite created", "Invite link copied to clipboard.");
    } catch (err) { showToast("error", "Could not create invite", err.response?.data?.error || "Please try again."); }
  };

  const createTeam = async () => {
    if (!teamName.trim()) return;
    try {
      await API.post("/teams", { name: teamName.trim() });
      setTeamName("");
      showToast("success", "Team created", "Team created successfully.");
      await refreshTeams();
    } catch (err) { showToast("error", "Team creation failed", err.response?.data?.error || "Please try again."); }
  };

  const addMember = async () => {
    if (!selectedTeamId || !teamMemberId) return;
    try {
      await API.post("/teams/add-member", { team_id: selectedTeamId, user_id: teamMemberId });
      setTeamMemberId("");
      showToast("success", "Member added", "Member added successfully.");
      await refreshMembers();
    } catch (err) { showToast("error", "Could not add member", err.response?.data?.error || "Please try again."); }
  };

  const setHead = async () => {
    if (!selectedTeamId || !teamHeadId) return;
    try {
      await API.post("/teams/set-head", { team_id: selectedTeamId, user_id: teamHeadId });
      setTeamHeadId("");
      showToast("success", "Team head assigned", "Team head assigned successfully.");
      await refreshMembers();
    } catch (err) { showToast("error", "Could not set head", err.response?.data?.error || "Please try again."); }
  };

  const createProject = async () => {
    if (!selectedTeamId || !projectForm.title.trim()) return;
    try {
      await API.post("/projects", { title: projectForm.title.trim(), description: projectForm.description.trim(), team_id: selectedTeamId });
      setProjectForm({ title: "", description: "" });
      showToast("success", "Project created", "Project created successfully.");
      const r = await API.get("/projects"); setProjects(r.data.projects || r.data || []);
    } catch (err) { showToast("error", "Project creation failed", err.response?.data?.error || "Please try again."); }
  };

  const createTask = async () => {
    if (!selectedTeamId || !taskForm.title.trim()) return;
    try {
      await API.post("/tasks", { title: taskForm.title.trim(), team_id: selectedTeamId, project_id: taskForm.project_id || null, assigned_to: taskForm.assigned_to || null });
      setTaskForm({ title: "", project_id: "", assigned_to: "" });
      showToast("success", "Task created", "Task created successfully.");
    } catch (err) { showToast("error", "Task creation failed", err.response?.data?.error || "Please try again."); }
  };

  const saveTeam = async ({ name }) => {
    try {
      if (editingTeam) await API.put(`/teams/${editingTeam.id}`, { name });
      showToast("success", "Team updated", `${name} was saved.`);
      setTeamModalOpen(false); setEditingTeam(null);
      await refreshTeams();
    } catch (err) { showToast("error", "Team update failed", err.response?.data?.error || "Please try again."); }
  };

  const deleteTeam = async (team) => {
    if (!globalThis.confirm(`Delete team "${team.name}"?`)) return;
    try {
      await API.delete(`/teams/${team.id}`);
      showToast("success", "Team deleted", `${team.name} was removed.`);
      await refreshTeams();
    } catch (err) { showToast("error", "Delete failed", err.response?.data?.error || "Please try again."); }
  };

  const openRoleModal = (m) => { setRoleModalMember(m); setRoleModalValue(m.role || "member"); };

  const saveRole = async () => {
    try {
      await API.put(`/teams/${selectedTeamId}/members/${roleModalMember.id}`, { role: roleModalValue });
      showToast("success", "Member updated", `${roleModalMember.name} is now ${roleModalValue}.`);
      setRoleModalMember(null);
      await refreshMembers();
    } catch (err) { showToast("error", "Update failed", err.response?.data?.error || "Please try again."); }
  };

  const deleteMember = async (m) => {
    if (!globalThis.confirm(`Remove ${m.name} from this team?`)) return;
    try {
      await API.delete(`/teams/${selectedTeamId}/members/${m.id}`);
      showToast("success", "Member removed", `${m.name} was removed.`);
      await refreshMembers();
    } catch (err) { showToast("error", "Removal failed", err.response?.data?.error || "Please try again."); }
  };

  const nonAdmins = users.filter((u) => u.role !== "admin");

  if (loading) {
    return (
      <PageShell title="Admin Center">
        <LoadingState label="Loading admin data" />
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Admin Center"
      actions={<span style={{ fontSize: 12, color: "var(--text2)" }}>⚙️ Team & Project Management</span>}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

        {/* ── Header banner ── */}
        <div className="panel" style={{ background: "linear-gradient(135deg,rgba(124,106,255,0.12),rgba(45,212,160,0.06))", borderColor: "rgba(124,106,255,0.2)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.5px" }}>👑 Admin Center</div>
            <div style={{ fontSize: 13, color: "var(--text2)", marginTop: 4 }}>Create teams, assign projects and tasks to team members.</div>
          </div>
          <div style={{ padding: "8px 16px", borderRadius: 99, background: "rgba(45,212,160,0.1)", border: "1px solid rgba(45,212,160,0.25)", fontSize: 12, color: "var(--green)", fontWeight: 600 }}>
            ✓ Team management enabled
          </div>
        </div>

        {/* ── Teams list ── */}
        <PanelSection title="All Teams">
          <div style={{ maxHeight: 300, overflowY: 'auto' }}>
            {teams.length === 0 ? (
              <EmptyState icon="🧩" text="No teams yet. Create one below." compact />
            ) : (
              teams.map((team) => (
                <div key={team.id} className="member-row" style={{ justifyContent: "space-between" }}>
                  <div>
                    <div className="member-name">{team.name}</div>
                    <div className="member-email">{team.admin_name || "Team owner"}</div>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button className="icon-btn edit" onClick={() => { setEditingTeam(team); setTeamModalOpen(true); }}>✎</button>
                    <button className="icon-btn del" onClick={() => deleteTeam(team)}>🗑️</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </PanelSection>

        {/* ── Two-column ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>

          {/* Left: Team management */}
          <PanelSection title="Team Management" style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            <FieldRow label="Create New Team">
              <div style={{ display: "flex", gap: 8 }}>
                <input className="form-input" style={{ flex: 1 }} value={teamName} onChange={(e) => setTeamName(e.target.value)} placeholder="Team name..." onKeyDown={(e) => e.key === "Enter" && createTeam()} />
                <button className="btn-sm btn-accent" onClick={createTeam}>Create</button>
              </div>
            </FieldRow>

            <FieldRow label="Active Team">
              <div style={{ display: "flex", gap: 8 }}>
                <select className="form-input" style={{ flex: 1 }} value={selectedTeamId} onChange={(e) => setSelectedTeamId(e.target.value)}>
                  <option value="">Select a team</option>
                  {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
                <button className="btn-sm btn-ghost" onClick={createInvite}>📧 Invite</button>
              </div>
            </FieldRow>

            <div style={{ borderTop: "1px solid var(--border)", paddingTop: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text3)", textTransform: "uppercase", marginBottom: 12 }}>User Selection (Filters below)</div>
              <input
                className="form-input"
                style={{ width: "100%", marginBottom: 12, height: 32, fontSize: 13 }}
                placeholder="🔍 Search users by name or email..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
              />

              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <FieldRow label="Add Member">
                  <div style={{ display: "flex", gap: 8 }}>
                    <select className="form-input" style={{ flex: 1 }} value={teamMemberId} onChange={(e) => setTeamMemberId(e.target.value)}>
                      <option value="">Select user...</option>
                      {nonAdmins.map((u) => <option key={u.id} value={u.id}>{u.name} ({u.email})</option>)}
                    </select>
                    <button className="btn-sm btn-accent" onClick={addMember}>Add</button>
                  </div>
                </FieldRow>

                <FieldRow label="Set Team Head">
                  <div style={{ display: "flex", gap: 8 }}>
                    <select className="form-input" style={{ flex: 1 }} value={teamHeadId} onChange={(e) => setTeamHeadId(e.target.value)}>
                      <option value="">Select head...</option>
                      {nonAdmins.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
                    </select>
                    <button className="btn-sm btn-ghost" onClick={setHead} style={{ whiteSpace: "nowrap" }}>Set Head</button>
                  </div>
                </FieldRow>
              </div>
            </div>

            {/* Members list */}
            <div style={{ borderTop: "1px solid var(--border)", paddingTop: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <span style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text2)" }}>Current Team Members</span>
                <span style={{ fontSize: 11, color: "var(--text3)", background: "var(--bg3)", padding: "2px 8px", borderRadius: 99 }}>
                  {members.length}
                </span>
              </div>
              <div style={{ maxHeight: 400, overflowY: 'auto' }}>
                {members.length === 0 ? (
                  <EmptyState icon="👥" text="No members in this team yet." compact />
                ) : (
                  members.map((m) => (
                    <MemberCard key={m.id} member={m} canEdit onEdit={openRoleModal} onDelete={deleteMember} />
                  ))
                )}
              </div>
            </div>
          </PanelSection>

          {/* Right: Projects + Tasks */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Assign Projects */}
            <PanelSection title="Assign Projects">
              <p style={{ fontSize: 13, color: "var(--text2)", marginBottom: 14 }}>Link projects to the selected team.</p>
              <div className="form-group">
                <label htmlFor="project-title">Project Title</label>
                <input id="project-title" className="form-input" value={projectForm.title} onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })} placeholder="Project title..." />
              </div>
              <div className="form-group">
                <label htmlFor="project-description">Description</label>
                <textarea id="project-description" className="form-input" value={projectForm.description} onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })} placeholder="Project description..." style={{ minHeight: 64, resize: "vertical" }} />
              </div>
              <button className="btn-sm btn-accent" style={{ width: "100%" }} onClick={createProject}>
                + Create Project
              </button>

              {/* Team projects */}
              {selectedTeamProjects.length > 0 && (
                <div style={{ marginTop: 14, borderTop: "1px solid var(--border)", paddingTop: 12, maxHeight: 200, overflowY: 'auto' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--text3)", marginBottom: 8 }}>
                    Team Projects ({selectedTeamProjects.length})
                  </div>
                  {selectedTeamProjects.map((p) => (
                    <div key={p.id} style={{ padding: "8px 12px", background: "var(--bg3)", borderRadius: 6, border: "1px solid var(--border)", marginBottom: 4 }}>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{p.emoji || "📁"} {p.title}</div>
                    </div>
                  ))}
                </div>
              )}
            </PanelSection>

            {/* Assign Tasks */}
            <PanelSection title="Assign Tasks">
              <p style={{ fontSize: 13, color: "var(--text2)", marginBottom: 14 }}>Quickly create and assign tasks.</p>
              <div className="form-group">
                <label htmlFor="task-title">Task Title</label>
                <input id="task-title" className="form-input" value={taskForm.title} onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })} placeholder="Task title..." />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label htmlFor="task-project">Project</label>
                  <select id="task-project" className="form-input" value={taskForm.project_id} onChange={(e) => setTaskForm({ ...taskForm, project_id: e.target.value })}>
                    <option value="">No project</option>
                    {selectedTeamProjects.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label htmlFor="task-assignee">Assignee</label>
                  <select id="task-assignee" className="form-input" value={taskForm.assigned_to} onChange={(e) => setTaskForm({ ...taskForm, assigned_to: e.target.value })}>
                    <option value="">Unassigned</option>
                    {members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                </div>
              </div>
              <button className="btn-sm btn-accent" style={{ width: "100%" }} onClick={createTask}>
                + Create Task
              </button>
            </PanelSection>
          </div>
        </div>
      </div>

      {/* ── Edit Team modal ── */}
      <Modal open={teamModalOpen} onClose={() => { setTeamModalOpen(false); setEditingTeam(null); }} title={editingTeam ? "Edit Team" : "New Team"}>
        <div style={{ padding: "0 24px 24px" }}>
          <TeamForm initialData={editingTeam} submitLabel={editingTeam ? "Update Team" : "Create Team"} onSubmit={saveTeam} onCancel={() => { setTeamModalOpen(false); setEditingTeam(null); }} />
        </div>
      </Modal>

      {/* ── Edit Role modal ── */}
      <Modal open={!!roleModalMember} onClose={() => setRoleModalMember(null)} title="Edit Member Role">
        <div style={{ padding: "0 24px 24px" }}>
          <div className="form-group">
            <label htmlFor="role-member">Member</label>
            <input id="role-member" className="form-input" value={roleModalMember?.name || ""} disabled />
          </div>
          <div className="form-group">
            <label htmlFor="role-value">Role</label>
            <select id="role-value" className="form-input" value={roleModalValue} onChange={(e) => setRoleModalValue(e.target.value)}>
              <option value="member">Member</option>
              <option value="head">Head</option>
            </select>
          </div>
          <div className="modal-actions">
            <button className="btn-sm btn-ghost" onClick={() => setRoleModalMember(null)}>Cancel</button>
            <button className="btn-sm btn-accent" onClick={saveRole}>Save</button>
          </div>
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

export default Admin;
