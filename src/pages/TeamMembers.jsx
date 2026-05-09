import { useEffect, useMemo, useState, useContext } from "react";
import API from "../api";
import { AuthContext } from "../context/AuthContext";
import LoadingState from "../components/LoadingState";
import Toast from "../components/Toast";
import PageShell from "../components/PageShell";
import Modal from "../components/Modal";
import EmptyState from "../components/EmptyState";
import MemberCard from "../components/MemberCard";

// ─────────────────────────────────────────────────────────
//  Role-edit modal (extracted to keep TeamMembers readable)
// ─────────────────────────────────────────────────────────
function RoleModal({ member, role, onRoleChange, onSave, onClose }) {
  return (
    <Modal open={!!member} onClose={onClose} title="Edit Member Role">
      <div style={{ padding: "0 24px 24px" }}>
        <div className="form-group">
          <label>Member</label>
          <input className="form-input" value={member?.name || ""} disabled />
        </div>
        <div className="form-group">
          <label>Role</label>
          <select className="form-input" value={role} onChange={(e) => onRoleChange(e.target.value)}>
            <option value="member">Member</option>
            <option value="head">Head</option>
          </select>
        </div>
        <div className="modal-actions">
          <button className="btn-sm btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn-sm btn-accent" onClick={onSave}>Save</button>
        </div>
      </div>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────
//  Main page
// ─────────────────────────────────────────────────────────
function TeamMembers() {
  const { user } = useContext(AuthContext);
  const [teams, setTeams] = useState([]);
  const [members, setMembers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [editingMember, setEditingMember] = useState(null);
  const [editingRole, setEditingRole] = useState("member");

  const showToast = (type, title, message) => setToast({ type, title, message });

  const loadMembers = async (teamId) => {
    if (!teamId) { setMembers([]); return; }
    const res = await API.get(`/teams/${teamId}/members`);
    setMembers(res.data || []);
  };

  // Initial data load
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [teamsRes, tasksRes] = await Promise.all([API.get("/teams"), API.get("/tasks")]);
        if (cancelled) return;
        const loadedTeams = teamsRes.data || [];
        setTeams(loadedTeams);
        setTasks(tasksRes.data || []);
        const firstId = loadedTeams[0] ? String(loadedTeams[0].id) : "";
        setSelectedTeamId(firstId);
        if (firstId) await loadMembers(firstId);
      } catch (err) {
        if (!cancelled) showToast("error", "Could not load members", err.response?.data?.error || "Please try again.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  // Reload when team changes
  useEffect(() => {
    if (!selectedTeamId) return;
    let cancelled = false;
    API.get(`/teams/${selectedTeamId}/members`)
      .then((res) => { if (!cancelled) setMembers(res.data || []); })
      .catch((err) => showToast("error", "Could not load members", err.response?.data?.error));
    return () => { cancelled = true; };
  }, [selectedTeamId]);

  // Enrich members with task stats
  const memberStats = useMemo(() =>
    members.map((m) => {
      const mTasks = tasks.filter((t) => String(t.assigned_to) === String(m.id));
      const done = mTasks.filter((t) => t.status?.toLowerCase() === "done").length;
      return { ...m, taskCount: mTasks.length, completed: done, percentage: mTasks.length ? Math.round((done / mTasks.length) * 100) : 0 };
    }),
    [members, tasks]
  );

  const canEdit = user?.role === "admin";

  const openEdit = (member) => { setEditingMember(member); setEditingRole(member.role || "member"); };
  const closeEdit = () => setEditingMember(null);

  const saveRole = async () => {
    try {
      await API.put(`/teams/${selectedTeamId}/members/${editingMember.id}`, { role: editingRole });
      showToast("success", "Member updated", `${editingMember.name} is now ${editingRole}.`);
      closeEdit();
      await loadMembers(selectedTeamId);
    } catch (err) {
      showToast("error", "Update failed", err.response?.data?.error || "Please try again.");
    }
  };

  const deleteMember = async (member) => {
    if (!window.confirm(`Remove ${member.name} from this team?`)) return;
    try {
      await API.delete(`/teams/${selectedTeamId}/members/${member.id}`);
      showToast("success", "Member removed", `${member.name} was removed.`);
      await loadMembers(selectedTeamId);
    } catch (err) {
      showToast("error", "Removal failed", err.response?.data?.error || "Please try again.");
    }
  };

  // Team selector for topbar
  const teamSelect = (
    <select
      className="form-input"
      style={{ maxWidth: 220 }}
      value={selectedTeamId}
      onChange={(e) => setSelectedTeamId(e.target.value)}
    >
      {teams.map((t) => (
        <option key={t.id} value={t.id}>{t.name}</option>
      ))}
    </select>
  );

  return (
    <PageShell title="Team Members" actions={teamSelect}>
      {loading ? (
        <LoadingState label="Loading team members" />
      ) : user?.role !== "admin" ? (
        <EmptyState icon="🔒" text="Admin access required." />
      ) : memberStats.length === 0 ? (
        <EmptyState icon="👥" text="No team members found." />
      ) : (
        <div className="panel">
          {memberStats.map((member) => (
            <MemberCard
              key={member.id}
              member={member}
              canEdit={canEdit}
              onEdit={openEdit}
              onDelete={deleteMember}
              extra={
                /* Per-member task progress */
                <div style={{ textAlign: "right", marginRight: 12, minWidth: 120 }}>
                  <div style={{ fontSize: 12, color: "var(--text2)" }}>
                    {member.taskCount} tasks · {member.completed} done
                  </div>
                  <div className="progress-bar" style={{ marginTop: 4 }}>
                    <div
                      className="progress-fill"
                      style={{
                        width: `${member.percentage}%`,
                        background: "linear-gradient(90deg, var(--accent), #9b59ff)",
                      }}
                    />
                  </div>
                </div>
              }
            />
          ))}
        </div>
      )}

      <RoleModal
        member={editingMember}
        role={editingRole}
        onRoleChange={setEditingRole}
        onSave={saveRole}
        onClose={closeEdit}
      />

      {toast && (
        <div className="toast-stack">
          <Toast type={toast.type} title={toast.title} message={toast.message} onClose={() => setToast(null)} />
        </div>
      )}
    </PageShell>
  );
}

export default TeamMembers;