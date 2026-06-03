import React, { useState, useMemo, useCallback, useRef } from 'react';
import PresetStrip from '../components/PresetStrip';
import RoundCard from '../components/RoundCard';
import { formatDuration } from '../utils/time';
import { initAudio } from '../utils/audio';

/**
 * BuilderScreen — Session builder with preset loading, round editing,
 * drag-and-drop reorder, and session start.
 */
export default function BuilderScreen({ onStartSession }) {
  const [rounds, setRounds] = useState([
    { label: 'ROUND 1', workSeconds: 30, restSeconds: 10 },
  ]);
  const [activePreset, setActivePreset] = useState(null);
  const [animatingIndex, setAnimatingIndex] = useState(-1);
  const [showDuplicateMenu, setShowDuplicateMenu] = useState(false);

  // Drag-and-drop state
  const [dragIndex, setDragIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const dragCounter = useRef(0);

  const totalTime = useMemo(
    () => rounds.reduce((sum, r) => sum + r.workSeconds + r.restSeconds, 0),
    [rounds]
  );

  const handleSelectPreset = useCallback((preset) => {
    setActivePreset(preset.id);
    setRounds(preset.rounds.map((r) => ({ ...r })));
  }, []);

  const handleAddRound = useCallback(() => {
    const newRound = {
      label: `ROUND ${rounds.length + 1}`,
      workSeconds: 30,
      restSeconds: 10,
    };
    setRounds((prev) => [...prev, newRound]);
    setAnimatingIndex(rounds.length);
    setActivePreset(null);
    setTimeout(() => setAnimatingIndex(-1), 300);
  }, [rounds.length]);

  const handleUpdateRound = useCallback((index, updatedRound) => {
    setRounds((prev) => {
      const next = [...prev];
      next[index] = updatedRound;
      return next;
    });
    setActivePreset(null);
  }, []);

  const handleDuplicateRound = useCallback((index) => {
    setRounds((prev) => {
      const next = [...prev];
      const copy = { ...prev[index], label: `${prev[index].label}` };
      next.splice(index + 1, 0, copy);
      return next;
    });
    setActivePreset(null);
  }, []);

  const handleDeleteRound = useCallback((index) => {
    setRounds((prev) => prev.filter((_, i) => i !== index));
    setActivePreset(null);
  }, []);

  const handleDuplicateSession = useCallback(
    (multiplier) => {
      const original = [...rounds];
      let newRounds = [...rounds];
      for (let i = 1; i < multiplier; i++) {
        newRounds = [
          ...newRounds,
          ...original.map((r, idx) => ({
            ...r,
            label: `ROUND ${newRounds.length + idx + 1}`,
          })),
        ];
      }
      setRounds(newRounds);
      setShowDuplicateMenu(false);
      setActivePreset(null);
    },
    [rounds]
  );

  // ── Drag-and-Drop Handlers ──────────────────────────────

  const handleDragStart = useCallback((e, index) => {
    setDragIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
    // Make drag image semi-transparent
    if (e.target) {
      e.target.style.opacity = '0.4';
    }
  }, []);

  const handleDragEnd = useCallback((e) => {
    setDragIndex(null);
    setDragOverIndex(null);
    dragCounter.current = 0;
    if (e.target) {
      e.target.style.opacity = '1';
    }
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDragEnter = useCallback((e, index) => {
    e.preventDefault();
    dragCounter.current++;
    setDragOverIndex(index);
  }, []);

  const handleDragLeave = useCallback((e) => {
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setDragOverIndex(null);
    }
  }, []);

  const handleDrop = useCallback(
    (e, dropIndex) => {
      e.preventDefault();
      dragCounter.current = 0;

      const fromIndex = dragIndex;
      if (fromIndex === null || fromIndex === dropIndex) {
        setDragIndex(null);
        setDragOverIndex(null);
        return;
      }

      setRounds((prev) => {
        const next = [...prev];
        const [moved] = next.splice(fromIndex, 1);
        next.splice(dropIndex, 0, moved);
        return next;
      });

      setDragIndex(null);
      setDragOverIndex(null);
      setActivePreset(null);
    },
    [dragIndex]
  );

  const handleStart = useCallback(() => {
    if (rounds.length === 0) return;
    initAudio(); // Initialize audio context on user gesture
    onStartSession(rounds);
  }, [rounds, onStartSession]);

  return (
    <div className="screen-enter flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-center px-6 py-3 flex-shrink-0">
        <img src={`${import.meta.env.BASE_URL}banner.png`} alt="Kronos" className="h-8 object-contain" />
      </div>

      {/* Preset Strip */}
      <div className="flex-shrink-0">
        <PresetStrip
          activePreset={activePreset}
          onSelectPreset={handleSelectPreset}
          currentRounds={rounds}
        />
      </div>

      {/* Round List — scrollable, drag-and-drop enabled */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="max-w-2xl mx-auto space-y-3">
          {rounds.map((round, index) => (
            <RoundCard
              key={`round-${index}`}
              round={round}
              index={index}
              onUpdate={handleUpdateRound}
              onDuplicate={handleDuplicateRound}
              onDelete={handleDeleteRound}
              isAnimating={animatingIndex === index}
              isDragging={dragIndex === index}
              isDragOver={dragOverIndex === index && dragIndex !== index}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDragOver={handleDragOver}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            />
          ))}

          {/* Add Round button */}
          <button
            id="btn-add-round"
            onClick={handleAddRound}
            className="w-full py-3 border border-dashed border-kronos-border rounded-card
                       text-kronos-muted text-sm small-caps tracking-wider
                       hover:border-kronos-accent hover:text-kronos-accent
                       transition-colors btn-press"
          >
            + Add Round
          </button>

          {/* Duplicate Session */}
          {rounds.length > 0 && (
            <div className="flex items-center justify-center pt-1">
              <div className="relative">
                <button
                  id="btn-duplicate-session"
                  onClick={() => setShowDuplicateMenu((v) => !v)}
                  className="text-xs text-kronos-muted hover:text-kronos-accent
                             transition-colors small-caps tracking-wider"
                >
                  Duplicate session
                </button>
                {showDuplicateMenu && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2
                                  flex gap-2 bg-kronos-surface border border-kronos-border
                                  rounded-card p-2 z-10 fade-in">
                    {[2, 3, 4].map((n) => (
                      <button
                        key={n}
                        onClick={() => handleDuplicateSession(n)}
                        className="px-3 py-1 text-xs text-kronos-muted hover:text-kronos-accent
                                   hover:bg-white/5 rounded transition-colors"
                      >
                        ×{n}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Total Bar + Start Button — pinned at bottom */}
      <div className="flex-shrink-0 px-4 pb-4 pt-2 border-t border-kronos-border">
        <div className="max-w-2xl mx-auto">
          {/* Total info */}
          <div className="text-center text-sm text-kronos-muted mb-3 tabular-nums">
            {rounds.length} round{rounds.length !== 1 ? 's' : ''}
            <span className="mx-2">•</span>
            {formatDuration(totalTime)}
          </div>

          {/* Start button */}
          <button
            id="btn-start-session"
            onClick={handleStart}
            disabled={rounds.length === 0}
            className={`w-full py-4 rounded-card text-base font-bold small-caps tracking-widest
                       transition-all duration-200 btn-press
                       ${
                         rounds.length > 0
                           ? 'bg-kronos-text text-kronos-bg hover:bg-gray-200'
                           : 'bg-kronos-border text-kronos-muted cursor-not-allowed'
                       }`}
          >
            START SESSION
          </button>
        </div>
      </div>
    </div>
  );
}
