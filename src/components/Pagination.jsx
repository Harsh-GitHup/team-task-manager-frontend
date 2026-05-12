import PropTypes from "prop-types";

export default function Pagination({ page, totalPages, onPrev, onNext }) {
    return (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 16, marginTop: 32, marginBottom: 40 }}>
            <button
                className="btn-sm btn-ghost"
                disabled={page === 1}
                onClick={onPrev}
            >
                Previous
            </button>
            <span style={{ fontSize: 13, color: "var(--text2)" }}>
                Page <strong>{page}</strong> of {totalPages}
            </span>
            <button
                className="btn-sm btn-ghost"
                disabled={page === totalPages}
                onClick={onNext}
            >
                Next
            </button>
        </div>
    );
}

Pagination.propTypes = {
    page: PropTypes.number.isRequired,
    totalPages: PropTypes.number.isRequired,
    onPrev: PropTypes.func.isRequired,
    onNext: PropTypes.func.isRequired,
};
