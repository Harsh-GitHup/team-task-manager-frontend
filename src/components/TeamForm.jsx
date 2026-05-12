import { useState } from "react";
import PropTypes from "prop-types";

function TeamForm({ initialData, onSubmit, onCancel, submitLabel = "Save Team" }) {
    const [name, setName] = useState(initialData?.name || "");

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit?.({ name: name.trim() });
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="form-group">
                <label htmlFor="team-name">Team Name</label>
                <input
                    id="team-name"
                    className="form-input"
                    placeholder="Team name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
            </div>

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

TeamForm.propTypes = {
    initialData: PropTypes.shape({
        name: PropTypes.string,
    }),
    onSubmit: PropTypes.func,
    onCancel: PropTypes.func,
    submitLabel: PropTypes.string,
};

export default TeamForm;