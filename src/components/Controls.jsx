import React from 'react';

/**
 * Controls — Stop / Pause-Resume / Reset buttons for timer and stopwatch.
 * Circular 48px buttons with press animation.
 *
 * @param {Object} props
 * @param {Function} props.onStop - End session
 * @param {Function} props.onPauseResume - Toggle pause/resume
 * @param {Function} props.onReset - Reset to beginning
 * @param {Function} props.onLap - Record lap (stopwatch only)
 * @param {boolean} props.isPaused - Current pause state
 * @param {boolean} props.isRunning - Whether timer/stopwatch is running
 * @param {boolean} props.showLap - Whether to show LAP button
 */
export default function Controls({
  onStop,
  onPauseResume,
  onReset,
  onLap,
  isPaused,
  isRunning,
  showLap = false,
}) {
  return (
    <div className="flex items-center justify-center gap-8 py-4">
      {/* Stop button */}
      <button
        id="btn-stop"
        onClick={onStop}
        className="control-btn"
        title="Stop"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <rect x="4" y="4" width="16" height="16" rx="2" />
        </svg>
      </button>

      {/* Lap button (stopwatch only) */}
      {showLap && (
        <button
          id="btn-lap"
          onClick={onLap}
          disabled={!isRunning || isPaused}
          className={`control-btn text-xs font-medium small-caps tracking-wider
            ${!isRunning || isPaused ? 'opacity-30 cursor-not-allowed' : ''}`}
          title="Lap"
        >
          LAP
        </button>
      )}

      {/* Pause / Resume button */}
      <button
        id="btn-pause-resume"
        onClick={onPauseResume}
        disabled={!isRunning}
        className={`control-btn ${!isRunning ? 'opacity-30 cursor-not-allowed' : ''}`}
        title={isPaused ? 'Resume' : 'Pause'}
        style={{ width: '56px', height: '56px', fontSize: '22px' }}
      >
        {isPaused ? (
          /* Play / Resume icon */
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="6,3 20,12 6,21" />
          </svg>
        ) : (
          /* Pause icon */
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <rect x="5" y="3" width="5" height="18" rx="1" />
            <rect x="14" y="3" width="5" height="18" rx="1" />
          </svg>
        )}
      </button>

      {/* Reset button */}
      <button
        id="btn-reset"
        onClick={onReset}
        className="control-btn"
        title="Reset"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="1 4 1 10 7 10" />
          <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
        </svg>
      </button>
    </div>
  );
}
