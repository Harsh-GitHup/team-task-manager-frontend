import PropTypes from "prop-types";

export default function IconActionButtons({
    item,
    onEdit,
    onDelete,
    titleEdit = "Edit",
    titleDelete = "Delete",
    style,
    className,
}) {
    if (!onEdit && !onDelete) return null;

    const handleEdit = (e) => {
        e.stopPropagation();
        onEdit?.(item, e);
    };

    const handleDelete = (e) => {
        e.stopPropagation();
        onDelete?.(item, e);
    };

    return (
        <div className={className} style={style}>
            {onEdit && (
                <button className="icon-btn edit" onClick={handleEdit} title={titleEdit}>
                    ✎
                </button>
            )}
            {onDelete && (
                <button className="icon-btn del" onClick={handleDelete} title={titleDelete}>
                    🗑️
                </button>
            )}
        </div>
    );
}

IconActionButtons.propTypes = {
    item: PropTypes.any,
    onEdit: PropTypes.func,
    onDelete: PropTypes.func,
    titleEdit: PropTypes.string,
    titleDelete: PropTypes.string,
    style: PropTypes.object,
    className: PropTypes.string,
};
