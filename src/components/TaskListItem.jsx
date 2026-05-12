import PropTypes from "prop-types";
import PriorityTag from "./PriorityTag";
import StatusBadge from "./StatusBadge";
import IconActionButtons from "./IconActionButtons";

export default function TaskListItem({ task, canModify, onEdit, onDelete }) {
    const isDone = task.status === "Done";
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
                    <StatusBadge status={task.status} />
                    <PriorityTag priority={task.priority} />
                </div>
            </div>

            {canModify && (
                <IconActionButtons
                    item={task}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    titleEdit="Edit Task"
                    titleDelete="Delete Task"
                    style={{ display: "flex", gap: 6 }}
                />
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
