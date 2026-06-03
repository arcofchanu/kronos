import React, { useState, useCallback, useEffect } from 'react';
import OrbitalCanvas from '../components/OrbitalCanvas';
import TimelineStrip from '../components/TimelineStrip';
import Controls from '../components/Controls';
import { useTimer } from '../hooks/useTimer';
import { formatTime, formatDuration } from '../utils/time';
import { playWorkToRest, playRestToWork, playSessionComplete } from '../utils/audio';

/**
 * ProgressRing — SVG circular progress indicator
 */
function ProgressRing({ progress, size = 120, strokeWidth = 4, color = '#C8D8FF' }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - progress * circumference;

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      {/* Background ring */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#1A1A1A"
        strokeWidth={strokeWidth}
      />
      {/* Progress ring */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 600ms ease' }}
      />
    </svg>
  );
}

/**
 * SessionSummary — Shown after session complete or early close.
 * Visual representation of progress with round stats.
 */
function SessionSummary({
  completedRounds,
  totalRounds,
  totalElapsed,
  isFullComplete,
  onSave,
  onBack,
  rounds,
}) {
  const progress = totalRounds > 0 ? completedRounds / totalRounds : 0;
  const percentage = Math.round(progress * 100);

  return (
    <div className="screen-enter flex flex-col items-center justify-center h-full px-6">
      {/* Status badge */}
      <div className="mb-6 fade-in">
        <span
          className={`px-4 py-1.5 rounded-full text-xs font-medium small-caps tracking-widest border ${
            isFullComplete
              ? 'text-kronos-accent border-kronos-accent/30 bg-kronos-accent/5'
              : 'text-kronos-rest border-kronos-rest/30 bg-kronos-rest/5'
          }`}
        >
          {isFullComplete ? 'COMPLETED' : 'SESSION ENDED'}
        </span>
      </div>

      {/* Progress Ring with stats inside */}
      <div className="relative fade-in" style={{ animationDelay: '100ms' }}>
        <ProgressRing
          progress={progress}
          size={160}
          strokeWidth={5}
          color={isFullComplete ? '#C8D8FF' : '#C8A86B'}
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold tabular-nums text-kronos-text">
            {percentage}%
          </span>
          <span className="text-xs text-kronos-muted mt-0.5">
            complete
          </span>
        </div>
      </div>

      {/* Stats row */}
      <div
        className="flex gap-6 mt-8 mb-8 fade-in"
        style={{ animationDelay: '200ms' }}
      >
        {/* Rounds */}
        <div className="text-center">
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-xl font-bold tabular-nums text-kronos-text">
              {completedRounds}
            </span>
            <span className="text-sm text-kronos-muted">/</span>
            <span className="text-sm text-kronos-muted tabular-nums">
              {totalRounds}
            </span>
          </div>
          <span className="text-xs text-kronos-muted small-caps tracking-wider">
            Rounds
          </span>
        </div>

        {/* Divider */}
        <div className="w-px bg-kronos-border" />

        {/* Time */}
        <div className="text-center">
          <span className="text-xl font-bold tabular-nums text-kronos-text">
            {formatDuration(Math.round(totalElapsed))}
          </span>
          <div>
            <span className="text-xs text-kronos-muted small-caps tracking-wider">
              Duration
            </span>
          </div>
        </div>
      </div>

      {/* Round-by-round visual */}
      <div
        className="flex flex-wrap gap-1.5 justify-center mb-8 max-w-xs fade-in"
        style={{ animationDelay: '300ms' }}
      >
        {rounds.map((round, i) => {
          const isCompleted = i < completedRounds;
          const wasCurrent = i === completedRounds && !isFullComplete;
          return (
            <div
              key={i}
              className="relative group"
              title={`${round.label}: ${isCompleted ? 'Done' : wasCurrent ? 'Stopped' : 'Skipped'}`}
            >
              <div
                className="w-6 h-6 rounded flex items-center justify-center text-[9px] font-bold transition-all"
                style={{
                  backgroundColor: isCompleted
                    ? (isFullComplete ? 'rgba(200,216,255,0.15)' : 'rgba(200,168,107,0.15)')
                    : wasCurrent
                    ? 'rgba(255,68,68,0.1)'
                    : '#111',
                  border: `1px solid ${
                    isCompleted
                      ? (isFullComplete ? 'rgba(200,216,255,0.3)' : 'rgba(200,168,107,0.3)')
                      : wasCurrent
                      ? 'rgba(255,68,68,0.3)'
                      : '#1A1A1A'
                  }`,
                  color: isCompleted
                    ? (isFullComplete ? '#C8D8FF' : '#C8A86B')
                    : wasCurrent
                    ? '#FF4444'
                    : '#333',
                }}
              >
                {isCompleted ? '✓' : wasCurrent ? '✕' : i + 1}
              </div>
            </div>
          );
        })}
      </div>

      {/* Action buttons */}
      <div
        className="flex flex-col gap-3 w-full max-w-xs mx-auto fade-in"
        style={{ animationDelay: '400ms' }}
      >
        {isFullComplete && (
          <button
            id="btn-save-streak"
            onClick={onSave}
            className="w-full py-3 rounded-card bg-kronos-text text-kronos-bg
                       text-sm font-bold small-caps tracking-widest
                       hover:bg-gray-200 transition-colors btn-press"
          >
            Save to Streak
          </button>
        )}
        <button
          id="btn-back-builder"
          onClick={onBack}
          className={`w-full py-3 rounded-card text-sm small-caps tracking-widest
                     transition-colors btn-press ${
                       isFullComplete
                         ? 'bg-kronos-surface border border-kronos-border text-kronos-muted hover:text-kronos-text hover:border-kronos-muted'
                         : 'bg-kronos-text text-kronos-bg hover:bg-gray-200 font-bold'
                     }`}
        >
          Home
        </button>
      </div>
    </div>
  );
}

/**
 * TimerScreen — Active timer with orbital particles, countdown, and controls.
 * This is the hero screen — everything must feel premium.
 */
export default function TimerScreen({ rounds, onStop, onSaveStreak, onSessionDone }) {
  const [canvasSize, setCanvasSize] = useState(280);
  const [showSummary, setShowSummary] = useState(false);
  const [summaryData, setSummaryData] = useState(null);

  // Responsive canvas sizing
  useEffect(() => {
    const updateSize = () => {
      const w = window.innerWidth;
      if (w >= 1024) setCanvasSize(420);
      else if (w >= 640) setCanvasSize(340);
      else setCanvasSize(Math.min(280, w - 40));
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const handlePhaseChange = useCallback((newPhase, roundIndex) => {
    if (newPhase === 'rest') {
      playWorkToRest();
    } else if (newPhase === 'work' && roundIndex > 0) {
      playRestToWork();
    }
  }, []);

  const handleSessionComplete = useCallback(() => {
    playSessionComplete();
  }, []);

  const timer = useTimer({
    onPhaseChange: handlePhaseChange,
    onSessionComplete: handleSessionComplete,
  });

  // Start the timer when component mounts
  useEffect(() => {
    if (rounds && rounds.length > 0) {
      timer.start(rounds);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentRound = rounds[timer.currentRoundIndex] || rounds[0];
  const timerColor = timer.phase === 'rest' ? '#C8A86B' : '#FFFFFF';
  const progressColor = timer.phase === 'rest' ? '#C8A86B' : '#C8D8FF';
  const stateLabel = timer.phase === 'work' ? 'W O R K' : 'R E S T';

  // Close session early — show summary
  const handleCloseSession = useCallback(() => {
    timer.stop();
    setSummaryData({
      completedRounds: timer.currentRoundIndex,
      totalRounds: rounds.length,
      totalElapsed: timer.totalElapsed,
      isFullComplete: false,
    });
    setShowSummary(true);
    onSessionDone?.();
  }, [timer, rounds.length, onSessionDone]);

  const handleSave = useCallback(() => {
    onSaveStreak({
      totalSeconds: Math.round(summaryData?.totalElapsed || timer.totalElapsed),
      rounds: rounds.length,
    });
  }, [onSaveStreak, summaryData, timer.totalElapsed, rounds.length]);

  // Show summary when session completes
  useEffect(() => {
    if (timer.isComplete && !showSummary) {
      setSummaryData({
        completedRounds: rounds.length,
        totalRounds: rounds.length,
        totalElapsed: timer.totalElapsed,
        isFullComplete: true,
      });
      setShowSummary(true);
      onSessionDone?.();
    }
  }, [timer.isComplete, timer.totalElapsed, rounds.length, showSummary, onSessionDone]);

  // Session summary overlay
  if (showSummary && summaryData) {
    return (
      <SessionSummary
        completedRounds={summaryData.completedRounds}
        totalRounds={summaryData.totalRounds}
        totalElapsed={summaryData.totalElapsed}
        isFullComplete={summaryData.isFullComplete}
        onSave={handleSave}
        onBack={onStop}
        rounds={rounds}
      />
    );
  }

  return (
    <div className="screen-enter flex flex-col items-center h-full">
      {/* Round header + Close button */}
      <div className="w-full flex items-center justify-between px-6 py-4">
        <span className="text-xs text-kronos-muted small-caps tracking-wider">
          {currentRound?.label || 'ROUND'}
        </span>

        <div className="flex items-center gap-3">
          <span className="text-xs text-kronos-muted tabular-nums">
            {timer.currentRoundIndex + 1} / {timer.totalRounds}
          </span>

          {/* Close session button */}
          <button
            id="btn-close-session"
            onClick={handleCloseSession}
            className="w-7 h-7 flex items-center justify-center rounded-full
                       bg-kronos-surface border border-kronos-border
                       text-kronos-muted hover:text-kronos-danger hover:border-kronos-danger
                       transition-colors btn-press"
            title="Close session"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Orbital Canvas + Timer Number */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="relative" style={{ width: canvasSize, height: canvasSize }}>
          <OrbitalCanvas
            phase={timer.phase}
            progress={timer.progress}
            isPaused={timer.isPaused}
            isComplete={false}
            onTapPause={timer.isRunning ? timer.togglePause : undefined}
            size={canvasSize}
          />

          {/* Timer number overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span
              className="tabular-nums font-bold leading-none"
              style={{
                fontSize: `clamp(${canvasSize * 0.18}px, 15vw, ${canvasSize * 0.28}px)`,
                color: timerColor,
                transition: 'color 600ms ease',
              }}
            >
              {formatTime(Math.ceil(timer.timeRemaining))}
            </span>

            {/* Paused overlay */}
            {timer.isPaused && (
              <span className="text-sm text-kronos-muted small-caps tracking-widest mt-2 fade-in">
                PAUSED
              </span>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full max-w-md px-6 mt-4">
          <div className="progress-bar">
            <div
              className="progress-bar-fill"
              style={{
                width: `${timer.progress * 100}%`,
                backgroundColor: progressColor,
                transition: 'background-color 600ms ease',
              }}
            />
          </div>
        </div>

        {/* State label */}
        <div className="mt-3">
          <span
            className="text-xs small-caps letter-spaced"
            style={{
              color: timer.phase === 'rest' ? '#C8A86B' : '#666',
              transition: 'color 600ms ease',
            }}
          >
            {stateLabel}
          </span>
        </div>
      </div>

      {/* Timeline Strip */}
      <TimelineStrip
        rounds={rounds}
        currentRoundIndex={timer.currentRoundIndex}
        phase={timer.phase}
      />

      {/* Controls */}
      <Controls
        onStop={handleCloseSession}
        onPauseResume={timer.togglePause}
        onReset={timer.reset}
        isPaused={timer.isPaused}
        isRunning={timer.isRunning}
      />

      {/* Bottom spacer for nav */}
      <div className="h-14" />
    </div>
  );
}
