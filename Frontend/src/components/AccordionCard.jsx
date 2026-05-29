import { useEffect, useState } from 'react';

export default function AccordionCard({ id, title, content, helpfulCount, isVerified, note, shouldOpen = false }) {
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (shouldOpen) {
      setExpanded(true);
    }
  }, [shouldOpen]);

  return (
    <div 
      id={id}
      className={`bg-surface border rounded-lg transition-colors cursor-pointer ${expanded ? 'border-primary border-l-4 shadow-sm' : 'border-ink-200 hover:border-primary'}`}
      onClick={() => setExpanded(!expanded)}
    >
      <div className={`accordion-header flex justify-between items-center p-4 ${expanded ? 'expanded' : ''}`}>
        <h4 className="font-body-md text-body-md font-medium text-ink-900">{title}</h4>
        <span className={`material-symbols-outlined transition-transform duration-200 ${expanded ? 'text-primary rotate-180' : 'text-ink-400'}`}>
          expand_more
        </span>
      </div>
      
      {expanded && (
        <div className="accordion-content expanded p-4 pt-0 text-ink-700 font-body-md text-body-md border-t border-ink-100">
          <p className="whitespace-pre-line">{content}</p>
          
          {helpfulCount && (
            <div className="mt-4 flex justify-between items-center">
              <span className="font-label-mono text-label-mono text-ink-400">Helpful for {helpfulCount} users</span>
              <button className="text-primary font-body-sm text-body-sm font-medium hover:underline" onClick={(e) => e.stopPropagation()}>Was this helpful?</button>
            </div>
          )}

          {isVerified && (
            <div className="mt-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-status-resolved"></span>
              <span className="font-label-mono text-label-mono text-ink-700 uppercase">Verified Solution</span>
            </div>
          )}

          {note && (
            <div className="mt-4 bg-blue-100 p-3 rounded text-sm text-blue-600 font-medium">
              Note: {note}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
