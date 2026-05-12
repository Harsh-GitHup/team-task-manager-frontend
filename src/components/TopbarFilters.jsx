import PropTypes from "prop-types";

export default function TopbarFilters({
    searchValue,
    onSearch,
    assigneeOptions = [],
    assigneeValue,
    onAssigneeChange,
    priorityValue,
    onPriorityChange,
    isAdmin,
    onCreate,
    style = {},
    inputStyle = {},
}) {
    return (
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', ...style }}>
            <input
                className="form-input"
                style={{ width: 160, height: 32, fontSize: 13, ...inputStyle }}
                placeholder="Search..."
                value={searchValue}
                onChange={(e) => onSearch?.(e.target.value)}
            />

            <select className="form-select" style={{ width: 130, height: 34 }} value={assigneeValue} onChange={(e) => onAssigneeChange?.(e.target.value)}>
                {assigneeOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>

            <select className="form-select" style={{ width: 130, height: 34 }} value={priorityValue} onChange={(e) => onPriorityChange?.(e.target.value)}>
                <option value="ALL">All Priorities</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
            </select>

            {isAdmin && onCreate && <button className="btn-sm btn-accent" onClick={onCreate}>+ New</button>}
        </div>
    );
}

TopbarFilters.propTypes = {
    searchValue: PropTypes.string,
    onSearch: PropTypes.func,
    assigneeOptions: PropTypes.array,
    assigneeValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    onAssigneeChange: PropTypes.func,
    priorityValue: PropTypes.string,
    onPriorityChange: PropTypes.func,
    isAdmin: PropTypes.bool,
    onCreate: PropTypes.func,
    style: PropTypes.object,
    inputStyle: PropTypes.object,
};
