import PropTypes from "prop-types";

function LoadingState({ label = "Loading" }) {
    return (
        <div className="loading-shell">
            <div className="loading-card">
                <div className="loader" />
                <span>{label}...</span>
            </div>
        </div>
    );
}

LoadingState.propTypes = {
    label: PropTypes.string,
};

export default LoadingState;
