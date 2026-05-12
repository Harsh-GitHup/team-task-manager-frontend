import PropTypes from "prop-types";

export default function PriorityTag({ priority, fontSize = 13 }) {
    if (!priority) return null;
    return (
        <span
            className={`tag tag-${priority.toLowerCase()}`}
            style={{ fontSize }}
        >
            {priority.toUpperCase()}
        </span>
    );
}

PriorityTag.propTypes = {
    priority: PropTypes.string,
    fontSize: PropTypes.number,
};
