import PropTypes from "prop-types";

export default function SectionHeader({
    title,
    count,
    color,
    style,
    chipStyle,
    className = "section-title",
}) {
    return (
        <div
            className={className}
            style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                color,
                ...style,
            }}
        >
            {title}
            {typeof count === "number" && (
                <span
                    style={{
                        background: "var(--bg3)",
                        color: "var(--text3)",
                        padding: "1px 6px",
                        borderRadius: 4,
                        fontSize: 10,
                        ...chipStyle,
                    }}
                >
                    {count}
                </span>
            )}
        </div>
    );
}

SectionHeader.propTypes = {
    title: PropTypes.node.isRequired,
    count: PropTypes.number,
    color: PropTypes.string,
    style: PropTypes.object,
    chipStyle: PropTypes.object,
    className: PropTypes.string,
};
