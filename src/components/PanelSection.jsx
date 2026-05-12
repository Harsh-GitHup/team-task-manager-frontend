import PropTypes from "prop-types";
import SectionHeader from "./SectionHeader";

export default function PanelSection({
    title,
    count,
    titleColor,
    titleStyle,
    chipStyle,
    style,
    children,
}) {
    return (
        <div className="panel" style={style}>
            {title && (
                <SectionHeader
                    title={title}
                    count={count}
                    color={titleColor}
                    style={titleStyle}
                    chipStyle={chipStyle}
                />
            )}
            {children}
        </div>
    );
}

PanelSection.propTypes = {
    title: PropTypes.node,
    count: PropTypes.number,
    titleColor: PropTypes.string,
    titleStyle: PropTypes.object,
    chipStyle: PropTypes.object,
    style: PropTypes.object,
    children: PropTypes.node,
};
