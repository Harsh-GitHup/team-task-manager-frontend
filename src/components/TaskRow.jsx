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
    <div className="task-item" onClick={() => onEdit(task)}>
      <div
        className={`task-check ${task.status === 'Done' ? 'done' : ''}`}
        onClick={handleToggle}
      >
        {task.status === 'Done' ? '✓' : ''}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div className={`task-title ${task.status === 'Done' ? 'done' : ''}`}>
          {task.title}
        </div>
        <div className="task-meta">
          {task.priority && (
            <span className={`tag tag-${priorityClass}`}>{task.priority.toUpperCase()}</span>
          )}
          {task.status && (
            <span className={`tag tag-${statusClass}`}>{task.status.toUpperCase()}</span>
          )}
          {proj && (
            <span style={{ fontSize: 11, color: 'var(--text3)' }}>
              {proj.emoji || '📁'} {proj.title}
            </span>
          )}
          {dueDateStr && (
            <span className={`date-badge ${isOverdue ? 'overdue' : ''}`}>
              {isOverdue ? '⚠ ' : ''}{dueDateStr}
            </span>
          )}
          {assignee && (
            <div
              className="assignee-bubble"
              style={{ background: `rgba(124, 106, 255, 0.2)`, color: `var(--accent)` }}
              title={assignee.name}
            >
              {assignee.name.slice(0, 2).toUpperCase()}
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <button
          className="btn-sm btn-ghost"
          style={{ padding: '5px 10px', fontSize: 12 }}
          onClick={handleEdit}
        >
          Edit
        </button>
      </div>
    </div>
  );
}
