import { useEffect, useState, useRef } from "react";
import PropTypes from "prop-types";
import API from "../api";

const DEFAULT_FORM = {
    title: "",
    description: "",
    project_id: "",
    assigned_to: "",
    status: "Todo",
    priority: "medium",
    due_date: "",
};

function TaskForm({
    initialData,
    projects = [],
    users = [],
    onSubmit,
    onCancel,
    submitLabel = "Save Task",
    showProjectSelect = true,
    showAssigneeSelect = true,
    showStatusSelect = true,
}) {
    const [form, setForm] = useState(DEFAULT_FORM);
    const [attachments, setAttachments] = useState([]);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

    const fetchAttachments = async (taskId) => {
        try {
            const res = await API.get(`/tasks/${taskId}/attachments`);
            setAttachments(res.data || []);
        } catch (err) {
            console.error("Failed to fetch attachments", err);
        }
    };

    useEffect(() => {
        Promise.resolve().then(() => {
            const defaultProjectId = projects[0]?.id ? String(projects[0].id) : ``;
            setForm({
                title: initialData?.title || "",
                description: initialData?.description || "",
                project_id: initialData?.project_id
                    ? String(initialData.project_id)
                    : defaultProjectId,
                assigned_to: initialData?.assigned_to
                    ? String(initialData.assigned_to)
                    : "",
                status: initialData?.status || "Todo",
                priority: initialData?.priority || "medium",
                due_date: initialData?.due_date
                    ? String(initialData.due_date).slice(0, 10)
                    : "",
            });

            if (initialData?.id) {
                fetchAttachments(initialData.id);
            } else {
                setAttachments([]);
            }
        });
    }, [initialData, projects]);

    const handleFileUpload = async (e) => {
        if (!initialData?.id) return;
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            await API.post(`/tasks/${initialData.id}/attachments`, formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            fetchAttachments(initialData.id);
        } catch (err) {
            console.error("Upload failed", err);
            alert("Upload failed. Please try again.");
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.title.trim()) return;
        onSubmit?.({
            ...form,
            title: form.title.trim(),
        });
    };

    return (
        <form onSubmit={handleSubmit} style={{ padding: "0 24px 24px", display: "flex", flexDirection: "column", gap: "14px" }}>

            {/* Title */}
            <div className="form-group" style={{ marginBottom: 0 }}>
                <label htmlFor="task-title">Task Title</label>
                <input
                    id="task-title"
                    className="form-input"
                    placeholder="What needs to be done?"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    required
                    autoFocus
                />
            </div>

            {/* Description */}
            <div className="form-group" style={{ marginBottom: 0 }}>
                <label htmlFor="task-description">Description</label>
                <textarea
                    id="task-description"
                    className="form-input"
                    placeholder="Optional details..."
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    style={{ minHeight: "80px", resize: "vertical" }}
                />
            </div>

            {/* Priority + Status */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                    <label htmlFor="task-priority">Priority</label>
                    <select
                        id="task-priority"
                        className="form-input"
                        value={form.priority}
                        onChange={(e) => setForm({ ...form, priority: e.target.value })}
                    >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                    </select>
                </div>

                {showStatusSelect && (
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label htmlFor="task-status">Status</label>
                        <select
                            id="task-status"
                            className="form-input"
                            value={form.status}
                            onChange={(e) => setForm({ ...form, status: e.target.value })}
                        >
                            <option value="Todo">To Do</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Review">In Review</option>
                            <option value="Done">Done</option>
                        </select>
                    </div>
                )}
            </div>

            {/* Assignee + Due Date */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                {showAssigneeSelect && (
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label htmlFor="task-assignee">Assign To</label>
                        <select
                            id="task-assignee"
                            className="form-input"
                            value={form.assigned_to}
                            onChange={(e) => setForm({ ...form, assigned_to: e.target.value })}
                        >
                            <option value="">Unassigned</option>
                            {users.map((u) => (
                                <option key={u.id} value={u.id}>{u.name}</option>
                            ))}
                        </select>
                    </div>
                )}

                <div className="form-group" style={{ marginBottom: 0 }}>
                    <label htmlFor="task-due-date">Due Date</label>
                    <input
                        id="task-due-date"
                        type="date"
                        className="form-input"
                        value={form.due_date}
                        onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                    />
                </div>
            </div>

            {/* Project */}
            {showProjectSelect && (
                <div className="form-group" style={{ marginBottom: 0 }}>
                    <label htmlFor="task-project">Project</label>
                    <select
                        id="task-project"
                        className="form-input"
                        value={form.project_id}
                        onChange={(e) => setForm({ ...form, project_id: e.target.value })}
                    >
                        <option value="">Select project</option>
                        {projects.map((p) => (
                            <option key={p.id} value={p.id}>
                                {p.emoji || "🚀"} {p.title}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {/* Attachments (edit only) */}
            {initialData?.id && (
                <div style={{ borderTop: "1px solid var(--border)", paddingTop: "16px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                        <span style={{ fontSize: "12px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text2)" }}>
                            Attachments
                        </span>
                        <button
                            type="button"
                            className="btn-sm btn-ghost"
                            style={{ padding: "4px 10px", fontSize: 12 }}
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                        >
                            {uploading ? "Uploading..." : "+ Add File"}
                        </button>
                    </div>
                    <input type="file" ref={fileInputRef} style={{ display: "none" }} onChange={handleFileUpload} />

                    {attachments.length === 0 ? (
                        <div style={{ fontSize: "12px", color: "var(--text3)" }}>No attachments yet.</div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                            {attachments.map(att => (
                                <a
                                    key={att.id}
                                    href={`${import.meta.env.VITE_API_URL || "http://localhost:8080"}/uploads/${att.file_path}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    style={{
                                        display: "flex", alignItems: "center", gap: "8px",
                                        padding: "8px 12px", background: "var(--bg3)",
                                        borderRadius: "var(--radius-sm)", textDecoration: "none",
                                        color: "var(--text)", border: "1px solid var(--border)", fontSize: "13px"
                                    }}
                                >
                                    📄 {att.file_name}
                                    <span style={{ marginLeft: "auto", fontSize: "11px", color: "var(--text3)" }}>
                                        by {att.uploader_name}
                                    </span>
                                </a>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Actions */}
            <div className="modal-actions" style={{ marginTop: "8px", paddingTop: "16px", borderTop: "1px solid var(--border)" }}>
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

TaskForm.propTypes = {
    initialData: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        title: PropTypes.string,
        description: PropTypes.string,
        project_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        assigned_to: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        status: PropTypes.string,
        priority: PropTypes.string,
        due_date: PropTypes.string,
    }),
    projects: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
            title: PropTypes.string.isRequired,
            emoji: PropTypes.string,
        })
    ),
    users: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
            name: PropTypes.string.isRequired,
        })
    ),
    onSubmit: PropTypes.func,
    onCancel: PropTypes.func,
    submitLabel: PropTypes.string,
    showProjectSelect: PropTypes.bool,
    showAssigneeSelect: PropTypes.bool,
    showStatusSelect: PropTypes.bool,
};

export default TaskForm;
