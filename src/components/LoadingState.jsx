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

export default LoadingState;
