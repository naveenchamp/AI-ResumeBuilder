// ============================================
// AtsChecklistItem.jsx - Single ATS Metric Row
// ============================================
// Shows label, score bar, and expandable fix
// suggestion on click.
// ============================================

import { useState } from 'react';
import { HiChevronRight } from 'react-icons/hi2';

function AtsChecklistItem({ label, score, fix, weight }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const numericScore = typeof score === 'number' ? score : 0;

  const getBarColor = () => {
    if (numericScore >= 80) return 'var(--success)';
    if (numericScore >= 60) return 'var(--primary)';
    return 'var(--error)';
  };

  const getScoreColor = () => {
    if (numericScore >= 80) return 'var(--success)';
    if (numericScore >= 60) return 'var(--primary)';
    return 'var(--error)';
  };

  return (
    <div className="metric-row" onClick={() => setIsExpanded(!isExpanded)}>
      <div className="metric-label">{label}</div>
      <div className="metric-bar">
        <div
          className="metric-fill"
          style={{ width: `${numericScore}%`, backgroundColor: getBarColor() }}
        />
      </div>
      <span className="metric-score" style={{ color: getScoreColor() }}>{numericScore}</span>
      <span className="metric-weight">{weight}</span>
      {fix && (
        <HiChevronRight
          style={{
            transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
            flexShrink: 0,
            color: 'var(--text-muted)',
          }}
        />
      )}
      {isExpanded && fix && (
        <div className="metric-fix">{fix}</div>
      )}
    </div>
  );
}

export default AtsChecklistItem;
