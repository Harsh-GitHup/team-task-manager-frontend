import PropTypes from "prop-types";
import Modal from "./Modal";

export default function ConfirmDialog({
    open,
    title,
    message,
    confirmLabel = "Delete",
    cancelLabel = "Cancel",
    onConfirm,
    onClose,
}) {
    return (
        <Modal open={open} onClose={onClose} title={title} width="min(440px, 100%)">
            <div style={{ padding: "0 24px 24px" }}>
                <div style={{ fontSize: 14, color: "var(--text2)", lineHeight: 1.6 }}>
                    {message}
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 24 }}>
                    <button type="button" className="btn-sm btn-ghost" onClick={onClose}>
                        {cancelLabel}
                    </button>
                    <button type="button" className="btn-sm btn-danger" onClick={onConfirm}>
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </Modal>
    );
}

ConfirmDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    title: PropTypes.string.isRequired,
    message: PropTypes.node.isRequired,
    confirmLabel: PropTypes.string,
    cancelLabel: PropTypes.string,
    onConfirm: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
};