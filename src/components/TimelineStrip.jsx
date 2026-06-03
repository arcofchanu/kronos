import React from 'react';

/**
 * TimelineStrip — Compact horizontal round blocks at bottom of timer screen.
 * Shows progression through session rounds.
 */
export default function TimelineStrip({ rounds, currentRoundIndex, phase }) {
  return (
    <div className="w-full px-4 py-3">
      <div className="flex gap-1.5 overflow-x-auto justify-center">
        {rounds.map((round, i) => {
          const isCompleted = i < currentRoundIndex;
          const isCurrent = i === currentRoundIndex;
          const isUpcoming = i > currentRoundIndex;

          let bgColor = 'bg-kronos-border'; // upcoming
          if (isCompleted) bgColor = 'bg-kronos-accent';
          if (isCurrent && phase === 'work') bgColor = 'bg-kronos-text';
          if (isCurrent && phase === 'rest') bgColor = 'bg-kronos-rest';

          return (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${bgColor}`}
              style={{
                width: isCurrent ? '24px' : '12px',
                opacity: isUpcoming ? 0.3 : 1,
              }}
              title={`Round ${i + 1}: ${round.label}`}
            />
          );
        })}
      </div>
    </div>
  );
}
