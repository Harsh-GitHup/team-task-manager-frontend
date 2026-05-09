import { useEffect, useState } from "react";

function TeamForm({ initialData, onSubmit, onCancel, submitLabel = "Save Team" }) {
    const [name, setName] = useState("");

    useEffect(() => {
        setName(initialData?.name || "");
    }, [initialData]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit?.({ name: name.trim() });
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="form-group">
                <label>Team Name</label>
                <input
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

export default TeamForm;