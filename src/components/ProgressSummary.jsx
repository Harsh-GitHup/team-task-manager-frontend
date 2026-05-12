import PropTypes from "prop-types";

export default function ProgressSummary({ emoji, title, sub, pct = 0, color, compact = false, rightAligned = false }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: rightAligned ? 'flex-end' : 'space-between', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                {emoji && <span style={{ fontSize: compact ? 16 : 18 }}>{emoji}</span>}
                <div style={{ minWidth: 0 }}>
                    {title && <div style={{ fontSize: compact ? 13 : 14, fontWeight: 700, color: 'var(--text)' }}>{title}</div>}
                    {sub && <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 4 }}>{sub}</div>}
                </div>
            </div>

            <div style={{ flex: 1, maxWidth: 220, marginLeft: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: 12, color: 'var(--text3)', fontFamily: "'JetBrains Mono', monospace" }}>{pct}%</div>
                </div>
                <div className="progress-bar" style={{ marginTop: 8 }}>
                    <div className="progress-fill" style={{ width: `${pct}%`, background: color || 'var(--accent)' }} />
                </div>
            </div>
        </div>
    );
}

ProgressSummary.propTypes = {
    emoji: PropTypes.string,
    title: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
    sub: PropTypes.string,
    pct: PropTypes.number,
    color: PropTypes.string,
    compact: PropTypes.bool,
    rightAligned: PropTypes.bool,
};
