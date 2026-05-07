import { useEffect, useMemo, useState } from "react";
import API from "../api";

function Admin() {
  const [teams, setTeams] = useState([]);
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [members, setMembers] = useState([]);
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [teamName, setTeamName] = useState("");
  const [teamMemberId, setTeamMemberId] = useState("");
  const [teamHeadId, setTeamHeadId] = useState("");
  const [projectForm, setProjectForm] = useState({ title: "", description: "" });
  const [taskForm, setTaskForm] = useState({ title: "", project_id: "", assigned_to: "" });
  const [message, setMessage] = useState("");

  const selectedTeamProjects = useMemo(
    () => projects.filter((project) => String(project.team_id) === String(selectedTeamId)),
    [projects, selectedTeamId]
  );

  const selectedTeamMembers = members;

  const showMessage = (text) => {
    setMessage(text);
    globalThis.setTimeout(() => setMessage(""), 3500);
  };

  // initial load: inline to avoid hook dependency issues
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [tRes, uRes, pRes] = await Promise.all([
          API.get("/teams"),
          API.get("/auth/users"),
          API.get("/projects"),
        ]);

        if (cancelled) return;

        const loadedTeams = tRes.data || [];
        setTeams(loadedTeams);
        setUsers(uRes.data || []);
        setProjects(pRes.data || []);

        setSelectedTeamId((prev) => {
          if (prev) return prev;
          return loadedTeams.length ? String(loadedTeams[0].id) : "";
        });
      } catch (err) {
        console.error("Failed to load admin data", err);
        if (!cancelled) setMessage("Failed to load admin data");
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // fetch members when selectedTeamId changes — inline async to avoid setState-in-effect lint
  useEffect(() => {
    let cancelled = false;
    const loadMembers = async () => {
      if (!selectedTeamId) {
        if (!cancelled) setMembers([]);
        return;
      }
      try {
        const res = await API.get(`/teams/${selectedTeamId}/members`);
        if (!cancelled) setMembers(res.data || []);
      } catch (err) {
        console.error(err);
        if (!cancelled) setMessage("Failed to load team members");
      }
    };

    loadMembers();
    return () => {
      cancelled = true;
    };
  }, [selectedTeamId]);

  const handleCreateInvite = async () => {
    try {
      const res = await API.post("/invites", {});
      showMessage("Invite created — link copied");
      await navigator.clipboard.writeText(res.data.link);
    } catch (err) {
      showMessage(err.response?.data?.error || "Could not create invite");
    }
  };

  const handleCreateTeam = async () => {
    if (!teamName.trim()) return;

    try {
      const res = await API.post("/teams", { name: teamName.trim() });
      setTeamName("");
      showMessage(res.data?.message || "Team created");
      // refresh teams and keep selectedTeamId stable
      const tRes = await API.get("/teams");
      setTeams(tRes.data || []);
    } catch (err) {
      showMessage(err.response?.data?.error || "Team creation failed");
    }
  };

  const handleAddMember = async () => {
    if (!selectedTeamId || !teamMemberId) return;

    try {
      const res = await API.post("/teams/add-member", {
        team_id: selectedTeamId,
        user_id: teamMemberId,
      });
      setTeamMemberId("");
      showMessage(res.data?.message || "Member added");
      // refresh members
      const mRes = await API.get(`/teams/${selectedTeamId}/members`);
      setMembers(mRes.data || []);
    } catch (err) {
      showMessage(err.response?.data?.error || "Could not add member");
    }
  };

  const handleSetHead = async () => {
    if (!selectedTeamId || !teamHeadId) return;

    try {
      const res = await API.post("/teams/set-head", { team_id: selectedTeamId, user_id: teamHeadId });
      setTeamHeadId("");
      showMessage(res.data?.message || "Team head assigned");
      const mRes = await API.get(`/teams/${selectedTeamId}/members`);
      setMembers(mRes.data || []);
    } catch (err) {
      showMessage(err.response?.data?.error || "Could not set team head");
    }
  };

  const handleCreateProject = async () => {
    if (!selectedTeamId || !projectForm.title.trim()) return;

    try {
      const res = await API.post("/projects", {
        title: projectForm.title.trim(),
        description: projectForm.description.trim(),
        team_id: selectedTeamId,
      });
      setProjectForm({ title: "", description: "" });
      showMessage(res.data?.message || "Project assigned to team");
      const pRes = await API.get("/projects");
      setProjects(pRes.data || []);
    } catch (err) {
      showMessage(err.response?.data?.error || "Project creation failed");
    }
  };

  const handleCreateTask = async () => {
    if (!selectedTeamId || !taskForm.title.trim()) return;

    try {
      const res = await API.post("/tasks", {
        title: taskForm.title.trim(),
        team_id: selectedTeamId,
        project_id: taskForm.project_id || null,
        assigned_to: taskForm.assigned_to || null,
      });
      setTaskForm({ title: "", project_id: "", assigned_to: "" });
      showMessage(res.data?.message || "Task assigned to team");
      const pRes = await API.get("/projects");
      setProjects(pRes.data || []);
    } catch (err) {
      showMessage(err.response?.data?.error || "Task creation failed");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="rounded-[2rem] border border-slate-800 bg-slate-900/85 p-8 shadow-2xl shadow-black/20">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-4xl font-semibold text-white">Admin Center</h1>
            <p className="mt-2 text-slate-400">Create teams and assign projects and tasks to team members.</p>
          </div>
          <div className="rounded-2xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-200">
            Team management enabled
          </div>
        </div>
        {message && (
          <div className="mt-6 rounded-2xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-100">
            {message}
          </div>
        )}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-[2rem] border border-slate-800 bg-slate-900/85 p-6 shadow-xl shadow-black/10 space-y-4">
          <div>
            <h2 className="text-2xl font-semibold text-white">Create Team</h2>
            <p className="mt-1 text-sm text-slate-400">Start by creating a team that can receive assignments.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <input
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="Team name"
              className="rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
            />
            <button
              onClick={handleCreateTeam}
              className="rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 px-5 py-3 font-semibold text-white transition hover:shadow-lg hover:shadow-cyan-500/30"
            >
              Create
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <select
              value={selectedTeamId}
              onChange={(e) => setSelectedTeamId(e.target.value)}
              className="rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-white focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
            >
              <option value="">Select a team</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
            <div className="flex gap-2">
              <button
                onClick={handleAddMember}
                className="rounded-2xl bg-slate-800 px-5 py-3 font-semibold text-white transition hover:bg-slate-700"
              >
                Add Member
              </button>
              <button onClick={handleCreateInvite} className="rounded-2xl bg-cyan-600 px-5 py-3 font-semibold text-white">Create Invite</button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <select
              value={teamMemberId}
              onChange={(e) => setTeamMemberId(e.target.value)}
              className="rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-white focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
            >
              <option value="">Select user</option>
              {users
                .filter((user) => user.role !== "admin")
                .map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.email})
                  </option>
                ))}
            </select>
            <div className="rounded-2xl border border-slate-800 bg-slate-950/50 px-4 py-3 text-sm text-slate-400">
              {selectedTeamMembers.length} member{selectedTeamMembers.length === 1 ? "" : "s"}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <select
              value={teamHeadId}
              onChange={(e) => setTeamHeadId(e.target.value)}
              className="rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-white focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
            >
              <option value="">Select team head</option>
              {users
                .filter((user) => user.role !== "admin")
                .map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.email})
                  </option>
                ))}
            </select>
            <button onClick={handleSetHead} className="rounded-2xl bg-amber-600 px-5 py-3 font-semibold text-white transition hover:bg-amber-500">
              Set Team Head
            </button>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
            <p className="text-sm font-semibold uppercase tracking-wider text-slate-400">Team members</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {selectedTeamMembers.length === 0 ? (
                <span className="text-sm text-slate-500">No members loaded</span>
              ) : (
                selectedTeamMembers.map((member) => (
                  <span key={member.id} className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-sm text-cyan-100">
                    {member.name} {member.role === 'head' ? '(Head)' : ''}
                  </span>
                ))
              )}
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] border border-slate-800 bg-slate-900/85 p-6 shadow-xl shadow-black/10 space-y-6">
          <div>
            <h2 className="text-2xl font-semibold text-white">Assign Projects</h2>
            <p className="mt-1 text-sm text-slate-400">Projects are linked to a team, so the whole team can see them.</p>
          </div>

          <div className="grid gap-3">
            <input
              value={projectForm.title}
              onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
              placeholder="Project title"
              className="rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
            />
            <textarea
              value={projectForm.description}
              onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
              placeholder="Project description"
              rows="4"
              className="rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
            />
            <button
              onClick={handleCreateProject}
              className="rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-5 py-3 font-semibold text-white transition hover:shadow-lg hover:shadow-emerald-500/30"
            >
              Create Project for Selected Team
            </button>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
            <p className="text-sm font-semibold uppercase tracking-wider text-slate-400">Current team projects</p>
            <div className="mt-3 space-y-3">
              {selectedTeamProjects.length === 0 ? (
                <span className="text-sm text-slate-500">No projects yet for this team</span>
              ) : (
                selectedTeamProjects.map((project) => (
                  <div key={project.id} className="rounded-xl border border-slate-800 bg-slate-900/80 p-3">
                    <div className="font-medium text-white">{project.title}</div>
                    <div className="text-sm text-slate-400">{project.description || "No description"}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      </div>

      <section className="rounded-[2rem] border border-slate-800 bg-slate-900/85 p-6 shadow-xl shadow-black/10 space-y-4">
        <div>
          <h2 className="text-2xl font-semibold text-white">Assign Tasks</h2>
          <p className="mt-1 text-sm text-slate-400">Choose a team, pick a project, and assign the task to a member of that team.</p>
        </div>

        <div className="grid gap-4 xl:grid-cols-4">
          <input
            value={taskForm.title}
            onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
            placeholder="Task title"
            className="rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
          />
          <select
            value={taskForm.project_id}
            onChange={(e) => setTaskForm({ ...taskForm, project_id: e.target.value })}
            className="rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-white focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
          >
            <option value="">Optional project</option>
            {selectedTeamProjects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.title}
              </option>
            ))}
          </select>
          <select
            value={taskForm.assigned_to}
            onChange={(e) => setTaskForm({ ...taskForm, assigned_to: e.target.value })}
            className="rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-white focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
          >
            <option value="">Optional assignee</option>
            {selectedTeamMembers.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name}
              </option>
            ))}
          </select>
          <button
            onClick={handleCreateTask}
            className="rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 px-5 py-3 font-semibold text-white transition hover:shadow-lg hover:shadow-cyan-500/30"
          >
            Create Task
          </button>
        </div>
      </section>
    </div>
  );
}

export default Admin;
