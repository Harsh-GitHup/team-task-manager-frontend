import PropTypes from "prop-types";
import IconActionButtons from "./IconActionButtons";

export default function ProjectCard({ project, taskCount, done, memberCount, onEdit, onDelete, onClick }) {
    const pct = taskCount ? Math.round((done / taskCount) * 100) : 0;
    const color = project.color || "var(--accent)";

    const handleCardKeyDown = (e) => {
        if (!onClick) return;
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onClick(e);
        }
    };

    return (
        <button
            className="project-card"
            onClick={onClick}
            onKeyDown={handleCardKeyDown}
            style={{ "--project-color": color }}
            type="button"
            tabIndex={0}
        >
            <div className="project-card-top">
                <span className="project-emoji">{project.emoji}</span>
                <span className="project-name">{project.title}</span>
            </div>

            <p className="project-desc">{project.description || "No description provided for this project."}</p>

            <div style={{ marginBottom: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "var(--text2)", marginBottom: 8, fontWeight: 500 }}>
                    <span>Progress</span>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>{pct}%</span>
                </div>
                <div className="progress-bar" style={{ height: 8 }}>
                    <div className="progress-fill" style={{ width: `${pct}%`, background: color }} />
                </div>
            </div>

            <div className="project-stats">
                <div className="stat-item"><strong>{taskCount}</strong> tasks</div>
                <div className="stat-item"><strong>{done}</strong> done</div>
                <div className="stat-item"><strong>{memberCount || 0}</strong> members</div>
            </div>

            {(onEdit || onDelete) && (
                <IconActionButtons
                    item={project}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    titleEdit="Edit Project"
                    titleDelete="Delete Project"
                    className="project-card-actions"
                />
            )}
        </button>
    );
}

ProjectCard.propTypes = {
    project: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        title: PropTypes.string.isRequired,
        description: PropTypes.string,
        emoji: PropTypes.string,
        color: PropTypes.string,
    }).isRequired,
    taskCount: PropTypes.number.isRequired,
    done: PropTypes.number.isRequired,
    memberCount: PropTypes.number,
    onEdit: PropTypes.func,
    onDelete: PropTypes.func,
    onClick: PropTypes.func,
};
