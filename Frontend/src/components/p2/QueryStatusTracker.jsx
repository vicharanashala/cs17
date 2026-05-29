// 3-stage status tracker: Posted → In Progress → Answered / Rejected

const STAGES = [
  { key: 'posted',      label: 'Posted',      icon: 'radio_button_checked' },
  { key: 'in_progress', label: 'In Progress',  icon: 'autorenew' },
  { key: 'resolved',    label: 'Answered',     icon: 'check_circle' },
];

function getStageIndex(status) {
  if (status === 'rejected') return 2;
  if (status === 'answered' || status === 'faq_promoted') return 2;
  if (status === 'in_progress') return 1;
  return 0; // posted / default
}

export default function QueryStatusTracker({ status, rejectionReason }) {
  const activeIndex = getStageIndex(status);
  const isRejected = status === 'rejected';
  const isFAQ = status === 'faq_promoted';

  return (
    <div className="w-full">
      <div className="flex items-center gap-0">
        {STAGES.map((stage, i) => {
          const isDone = i < activeIndex;
          const isActive = i === activeIndex;
          const isLast = i === STAGES.length - 1;

          let dotColor = 'bg-ink-200 text-ink-400';
          let labelColor = 'text-ink-400';
          let lineColor = 'bg-ink-200';

          if (isDone) {
            dotColor = 'bg-primary text-on-primary';
            labelColor = 'text-primary';
            lineColor = 'bg-primary';
          } else if (isActive) {
            if (isRejected && isLast) {
              dotColor = 'bg-error text-on-error';
              labelColor = 'text-error';
            } else if (isFAQ && isLast) {
              dotColor = 'bg-conf-high text-on-primary';
              labelColor = 'text-conf-high';
            } else {
              dotColor = 'bg-primary text-on-primary';
              labelColor = 'text-primary font-medium';
            }
          }

          const icon = isActive && isRejected && isLast ? 'cancel' : stage.icon;
          const displayLabel = isActive && isFAQ && isLast ? 'In FAQ' : stage.label;

          return (
            <div key={stage.key} className="flex items-center flex-1 last:flex-none">
              {/* Step */}
              <div className="flex flex-col items-center gap-1 min-w-[56px]">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${dotColor} transition-colors`}>
                  <span className="material-symbols-outlined text-base">{icon}</span>
                </div>
                <span className={`font-label-mono text-label-mono ${labelColor} transition-colors text-center leading-tight`}>
                  {displayLabel}
                </span>
              </div>
              {/* Connector line */}
              {!isLast && (
                <div className={`flex-1 h-0.5 mx-1 mb-4 ${isDone || (isActive && i < STAGES.length - 1) ? 'bg-primary' : lineColor} transition-colors`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Rejection reason */}
      {isRejected && rejectionReason && (
        <div className="mt-3 px-3 py-2 bg-error-container rounded-lg border border-error/20">
          <p className="font-body-sm text-body-sm text-error">
            <span className="font-medium">Reason: </span>{rejectionReason}
          </p>
        </div>
      )}

      {/* FAQ promoted note */}
      {isFAQ && (
        <div className="mt-3 px-3 py-2 bg-surface-container rounded-lg border border-outline-variant">
          <p className="font-body-sm text-body-sm text-conf-high">
            🎉 This question was promoted to the official FAQ!
          </p>
        </div>
      )}
    </div>
  );
}
