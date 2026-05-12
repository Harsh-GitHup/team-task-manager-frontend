import PropTypes from "prop-types";

export default function TaskListItem({ task, canModify, onEdit, onDelete }) {
    const isDone = task.status === "Done";
    const isInProgress = task.status === "In Progress";
    let statusBg = "rgba(255,255,255,0.05)";
    let statusColor = "var(--text3)";

    if (isDone) {
        statusBg = "rgba(45,212,160,0.12)";
        statusColor = "var(--green)";
    } else if (isInProgress) {
        statusBg = "rgba(124,106,255,0.15)";
        statusColor = "var(--accent2)";
    }
    return (
        <button
            className="task-item"
            onClick={() => canModify && onEdit(task)}
            disabled={!canModify}
            style={{ cursor: canModify ? "pointer" : "default" }}
        >
            <div className="task-check" style={{ background: isDone ? "var(--green)" : "transparent", borderColor: isDone ? "var(--green)" : "var(--border2)" }}>
                {isDone && "✓"}
            </div>

            <div style={{ flex: 1 }}>
                <div className="task-title" style={{ textDecoration: isDone ? "line-through" : "none", color: isDone ? "var(--text2)" : "var(--text)" }}>
                    {task.title}
                </div>
                <div className="task-meta">
                    <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 99, textTransform: "uppercase", background: statusBg, color: statusColor }}>
                        {task.status}
                    </span>
                    {task.priority && (
                        <span className={`tag tag-${task.priority.toLowerCase()}`}>{task.priority.toUpperCase()}</span>
                    )}
                </div>
            </div>

            {canModify && (
                <div style={{ display: "flex", gap: 6 }} >
                    {onEdit && <button className="icon-btn edit" onClick={(e) => { e.stopPropagation(); onEdit(e); }} title="Edit Project">✎</button>}
                    {onDelete && <button className="icon-btn del" onClick={(e) => { e.stopPropagation(); onDelete(e); }} title="Delete Project">🗑️</button>}
                </div>
            )}
        </button>
    );
}

TaskListItem.propTypes = {
    task: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        title: PropTypes.string.isRequired,
        status: PropTypes.string.isRequired,
        priority: PropTypes.string,
    }).isRequired,
    canModify: PropTypes.bool.isRequired,
    onEdit: PropTypes.func,
    onDelete: PropTypes.func,
};
