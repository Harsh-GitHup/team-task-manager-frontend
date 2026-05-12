import PropTypes from "prop-types";

export default function StatCard({ label, value, sub, variant }) {
    return (
        <div className={`stat-card ${variant}`}>
            <div className="stat-label">{label}</div>
            <div className="stat-value">{value}</div>
            <div className="stat-sub">{sub}</div>
        </div>
    );
}

StatCard.propTypes = {
    label: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    sub: PropTypes.string,
    variant: PropTypes.string,
};
