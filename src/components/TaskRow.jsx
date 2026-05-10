import API from "../api";

export default function TaskRow({ task, members = [], projects = [], currentUser, onEdit, onRefresh }) {
  const today = new Date().toISOString().split('T')[0];
  const assignee = members.find(m => String(m.id) === String(task.assigned_to));
  
  // Format due date safely
  let dueDateStr = "";
  let isOverdue = false;
  if (task.due_date) {
    dueDateStr = String(task.due_date).slice(0, 10);
    isOverdue = dueDateStr < today && task.status !== 'Done';
  }

  const proj = projects ? projects.find(p => String(p.id) === String(task.project_id)) : null;

  const handleToggle = async (e) => {
    e.stopPropagation();
    const newStatus = task.status === 'Done' ? 'Todo' : 'Done';
    try {
      await API.put(`/tasks/${task.id}`, { ...task, status: newStatus });
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    onEdit(task);
  };

  // Convert status/priority to lowercase no-spaces for CSS class matching
  const statusClass = (task.status || '').replace(/\s+/g, '').toLowerCase();
  const priorityClass = (task.priority || '').toLowerCase();

  return (
    <div className="task-item" onClick={() => onEdit(task)} style={{ padding: "14px 16px", borderRadius: 12, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}>
      <div
        className={`task-check ${task.status === 'Done' ? 'done' : ''}`}
        onClick={handleToggle}
        style={{ width: 20, height: 20, border: "2px solid rgba(255,255,255,0.15)", borderRadius: "50%", background: task.status === 'Done' ? "var(--green)" : "transparent" }}
      >
        {task.status === 'Done' ? '✓' : ''}
      </div>

      <div style={{ flex: 1, minWidth: 0, paddingLeft: 4 }}>
        <div className={`task-title ${task.status === 'Done' ? 'done' : ''}`} style={{ fontSize: 14, fontWeight: 600, color: task.status === 'Done' ? "var(--text3)" : "#fff", marginBottom: 8 }}>
          {task.title}
        </div>
        <div className="task-meta" style={{ gap: 12 }}>
          {task.priority && (
            <span className={`tag tag-${priorityClass}`} style={{ fontSize: 9, fontWeight: 800, padding: "2px 8px" }}>{task.priority.toUpperCase()}</span>
          )}
          {task.status && (
            <span className={`tag tag-${statusClass}`} style={{ fontSize: 9, fontWeight: 800, padding: "2px 8px" }}>{task.status.toUpperCase()}</span>
          )}
          {proj && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--text3)", fontWeight: 500 }}>
              <span>{proj.emoji || '📁'}</span>
              <span>{proj.title}</span>
            </div>
          )}
          {dueDateStr && (
            <div className={`date-badge ${isOverdue ? 'overdue' : ''}`} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, background: "transparent", padding: 0 }}>
              <span>{isOverdue ? '⚠' : '📅'}</span>
              <span style={{ fontWeight: 600, color: isOverdue ? "var(--red)" : "var(--text3)" }}>{dueDateStr}</span>
            </div>
          )}
          {assignee && (
            <div
              className="assignee-bubble"
              style={{ width: 22, height: 22, fontSize: 9, background: `rgba(124, 106, 255, 0.15)`, color: `var(--accent2)`, border: "1px solid rgba(124,106,255,0.2)" }}
              title={assignee.name}
            >
              {assignee.name.slice(0, 2).toUpperCase()}
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', marginLeft: 12 }}>
        <button
          className="btn-sm"
          style={{ 
            padding: '4px 14px', fontSize: 11, fontWeight: 700,
            background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
            color: "var(--text2)", borderRadius: 8
          }}
          onClick={handleEdit}
        >
          Edit
        </button>
      </div>
    </div>
  );
}
