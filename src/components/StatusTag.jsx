import PropTypes from "prop-types";

export default function StatusTag({ status, fontSize = 13 }) {
    if (!status) return null;
    const statusClass = (status || "").replaceAll(/\s+/g, "").toLowerCase();
    return (
        <span
            className={`tag tag-${statusClass}`}
            style={{ fontSize, fontWeight: 800, padding: "2px 8px" }}
        >
            {status.toUpperCase()}
        </span>
    );
}

StatusTag.propTypes = {
    status: PropTypes.string,
    fontSize: PropTypes.number,
};
