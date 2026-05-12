import PropTypes from "prop-types";

export default function KanbanCard({ task, canModify, onEdit, onDelete, onDragStart }) {
    return (
        <button
            type="button"
            className="kanban-card"
            onClick={() => canModify && onEdit(task)}
            draggable={canModify}
            onDragStart={(e) => onDragStart(e, task)}
            style={{ cursor: canModify ? "grab" : "default", position: "relative" }}
        >
            {canModify && (
                <div style={{ position: "absolute", top: 10, right: 10, display: "flex", gap: 6 }} >
                    {onEdit && <button className="icon-btn edit" onClick={(e) => { e.stopPropagation(); onEdit(e); }} title="Edit Project">✎</button>}
                    {onDelete && <button className="icon-btn del" onClick={(e) => { e.stopPropagation(); onDelete(e); }} title="Delete Project">🗑️</button>}
                </div>
            )}
            <div className="kanban-card-title">{task.title}</div>
            <div className="kanban-card-footer">
                {task.priority && (
                    <span className={`tag tag-${task.priority.toLowerCase()}`} style={{ fontSize: 9 }}>{task.priority.toUpperCase()}</span>
                )}
            </div>
        </button>
    );
}

KanbanCard.propTypes = {
    task: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        title: PropTypes.string.isRequired,
        priority: PropTypes.string,
    }).isRequired,
    canModify: PropTypes.bool.isRequired,
    onEdit: PropTypes.func,
    onDelete: PropTypes.func,
    onDragStart: PropTypes.func.isRequired,
};
