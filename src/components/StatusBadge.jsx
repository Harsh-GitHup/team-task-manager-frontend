import PropTypes from "prop-types";

export default function StatusBadge({ status }) {
    if (!status) return null;

    let statusBg = "rgba(255,255,255,0.05)";
    let statusColor = "var(--text3)";

    if (status === "Done") {
        statusBg = "rgba(45,212,160,0.12)";
        statusColor = "var(--green)";
    } else if (status === "In Progress") {
        statusBg = "rgba(124,106,255,0.15)";
        statusColor = "var(--accent2)";
    }

    return (
        <span
            style={{
                fontSize: 10,
                fontWeight: 600,
                padding: "2px 8px",
                borderRadius: 99,
                textTransform: "uppercase",
                background: statusBg,
                color: statusColor,
            }}
        >
            {status}
        </span>
    );
}

StatusBadge.propTypes = {
    status: PropTypes.string,
};
