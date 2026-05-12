import PropTypes from "prop-types";
import PriorityTag from "./PriorityTag";
import IconActionButtons from "./IconActionButtons";

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
                <IconActionButtons
                    item={task}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    titleEdit="Edit Task"
                    titleDelete="Delete Task"
                    style={{ position: "absolute", top: 10, right: 10, display: "flex", gap: 6 }}
                />
            )}
            <div className="kanban-card-title">{task.title}</div>
            <div className="kanban-card-footer">
                <PriorityTag priority={task.priority} fontSize={9} />
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
