import React, { useState, useEffect } from 'react';
import OrbitalCanvas from '../components/OrbitalCanvas';
import Controls from '../components/Controls';
import { useStopwatch } from '../hooks/useStopwatch';
import { formatStopwatch } from '../utils/time';

/**
 * StopwatchScreen — Count-up timer with lap recording.
 * Orbital particles in WORK/white mode throughout.
 */
export default function StopwatchScreen() {
  const stopwatch = useStopwatch();
  const [canvasSize, setCanvasSize] = useState(280);

  // Responsive canvas sizing
  useEffect(() => {
    const updateSize = () => {
      const w = window.innerWidth;
      if (w >= 1024) setCanvasSize(380);
      else if (w >= 640) setCanvasSize(320);
      else setCanvasSize(Math.min(260, w - 40));
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Map elapsed minutes to particle speed for visual effect
  const minutesElapsed = stopwatch.elapsedMs / 60000;
  const speedProgress = Math.min(1, minutesElapsed / 10); // Max speed at 10 minutes

  const handleStartOrPauseResume = () => {
    if (!stopwatch.isRunning) {
      stopwatch.start();
    } else {
      stopwatch.togglePause();
    }
  };

  return (
    <div className="screen-enter flex flex-col items-center h-full">
      {/* Header */}
      <div className="w-full px-6 py-4">
        <span className="text-xs text-kronos-muted small-caps tracking-wider">
          STOPWATCH
        </span>
      </div>

      {/* Orbital Canvas + Stopwatch Number */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="relative" style={{ width: canvasSize, height: canvasSize }}>
          <OrbitalCanvas
            phase={stopwatch.isRunning ? 'work' : 'idle'}
            progress={speedProgress}
            isPaused={stopwatch.isPaused}
            isComplete={false}
            onTapPause={stopwatch.isRunning ? stopwatch.togglePause : undefined}
            size={canvasSize}
          />

          {/* Stopwatch number overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span
              className="tabular-nums font-bold leading-none text-kronos-text"
              style={{
                fontSize: `clamp(${canvasSize * 0.13}px, 10vw, ${canvasSize * 0.2}px)`,
              }}
            >
              {formatStopwatch(stopwatch.elapsedMs)}
            </span>

            {stopwatch.isPaused && (
              <span className="text-sm text-kronos-muted small-caps tracking-widest mt-2 fade-in">
                PAUSED
              </span>
            )}
          </div>
        </div>

        {/* Lap List */}
        <div className="w-full max-w-md px-6 mt-6 flex-shrink overflow-y-auto" style={{ maxHeight: '200px' }}>
          {stopwatch.laps.length > 0 && (
            <div className="space-y-1">
              {stopwatch.laps.map((lapItem, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-2 px-3
                             border-b border-kronos-border/50 text-sm"
                >
                  <span className="text-kronos-muted small-caps tracking-wider text-xs">
                    LAP {lapItem.number}
                  </span>
                  <div className="flex gap-4">
                    <span className="tabular-nums text-kronos-muted text-xs">
                      {formatStopwatch(lapItem.splitMs)}
                    </span>
                    <span className="tabular-nums text-kronos-text">
                      {formatStopwatch(lapItem.totalMs)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!stopwatch.isRunning && stopwatch.elapsedMs === 0 && (
            <div className="text-center text-kronos-muted text-sm mt-4">
              <p className="small-caps tracking-wider">Ready</p>
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <Controls
        onStop={stopwatch.reset}
        onPauseResume={handleStartOrPauseResume}
        onReset={stopwatch.reset}
        onLap={stopwatch.lap}
        isPaused={!stopwatch.isRunning ? true : stopwatch.isPaused}
        isRunning={true}
        showLap={true}
      />

      {/* Bottom spacer for nav */}
      <div className="h-14" />
    </div>
  );
}
