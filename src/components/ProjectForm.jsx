import { useState } from "react";
import PropTypes from "prop-types";

const DEFAULT_FORM = {
    title: "",
    description: "",
    team_id: "",
    emoji: "📁",
    color: "#7c6aff",
};

const COLOR_CHOICES = [
    "#7c6aff",
    "#2dd4a0",
    "#ffb347",
    "#f472b6",
    "#60a5fa",
    "#ff6b6b",
];

function ProjectForm({ initialData, teams = [], onSubmit, onCancel, submitLabel = "Save Project", showTeamSelect = true }) {
    const [form, setForm] = useState(DEFAULT_FORM);

    useEffect(() => {
        setForm({
            title: initialData?.title || "",
            description: initialData?.description || "",
            team_id: initialData?.team_id ? String(initialData.team_id) : initialData?.teamId ? String(initialData.teamId) : teams[0]?.id ? String(teams[0].id) : "",
            emoji: initialData?.emoji || "📁",
            color: initialData?.color || "#7c6aff",
        });
    }, [initialData, teams]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit?.({
            ...form,
            title: form.title.trim(),
            description: form.description.trim(),
            team_id: form.team_id,
            color: form.color,
            emoji: form.emoji,
        });
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="form-group">
                <label htmlFor="project_name">Project Name</label>
                <input
                    className="form-input"
                    id="project_name"
                    placeholder="e.g. Mobile App v3"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
            </div>

            <div className="form-group">
                <label htmlFor="project_description">Description</label>
                <textarea
                    className="form-input"
                    id="project_description"
                    placeholder="What’s this project about?"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    style={{ minHeight: "80px", resize: "vertical" }}
                />
            </div>

            <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
                <div className="form-group">
                    <label htmlFor="project_emoji">Emoji</label>
                    <input
                        className="form-input"
                        id="project_emoji"
                        placeholder="📁"
                        value={form.emoji}
                        onChange={(e) => setForm({ ...form, emoji: e.target.value })}
                        maxLength="2"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="project_color">Color</label>
                    <div className="color-picker-row">
                        {COLOR_CHOICES.map((choice) => (
                            <button
                                type="button"
                                key={choice}
                                className={`color-swatch ${form.color === choice ? "active" : ""}`}
                                style={{ background: choice }}
                                onClick={() => setForm({ ...form, color: choice })}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {showTeamSelect && (
                <div className="form-group">
                    <label htmlFor="project_team">Team</label>
                    <select
                        className="form-input"
                        id="project_team"
                        value={form.team_id}
                        onChange={(e) => setForm({ ...form, team_id: e.target.value })}
                    >
                        <option value="">Select team</option>
                        {teams.map((team) => (
                            <option key={team.id} value={team.id}>
                                {team.name}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            <div className="modal-actions">
                <button type="button" className="btn-sm btn-ghost" onClick={onCancel}>
                    Cancel
                </button>
                <button type="submit" className="btn-sm btn-accent">
                    {submitLabel}
                </button>
            </div>
        </form>
    );
}

ProjectForm.propTypes = {
    initialData: PropTypes.shape({
        title: PropTypes.string,
        description: PropTypes.string,
        team_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        teamId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        emoji: PropTypes.string,
        color: PropTypes.string,
    }),
    teams: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
            name: PropTypes.string.isRequired,
        })
    ),
    onSubmit: PropTypes.func,
    onCancel: PropTypes.func,
    submitLabel: PropTypes.string,
    showTeamSelect: PropTypes.bool,
};

export default ProjectForm;
