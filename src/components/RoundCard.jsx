import React, { useState } from 'react';

/**
 * RoundCard — Individual round row in the session builder.
 * Editable inline fields: label, work time, rest time.
 * Actions: drag to reorder, duplicate, delete.
 */
export default function RoundCard({
  round,
  index,
  onUpdate,
  onDuplicate,
  onDelete,
  isAnimating,
  isDragging,
  isDragOver,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragEnter,
  onDragLeave,
  onDrop,
}) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = () => {
    setIsDeleting(true);
    setTimeout(() => onDelete(index), 200);
  };

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart?.(e, index)}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDragEnter={(e) => onDragEnter?.(e, index)}
      onDragLeave={onDragLeave}
      onDrop={(e) => onDrop?.(e, index)}
      className={`bg-kronos-surface border rounded-card p-4
        transition-all duration-200 relative
        ${isAnimating ? 'card-enter' : ''}
        ${isDeleting ? 'card-exit' : ''}
        ${isDragging ? 'opacity-40 scale-[0.97]' : ''}
        ${isDragOver ? 'border-kronos-accent' : 'border-kronos-border'}
      `}
      style={{ cursor: isDragging ? 'grabbing' : 'default' }}
    >
      {/* Drop indicator line */}
      {isDragOver && (
        <div className="absolute -top-[5px] left-2 right-2 h-[2px] bg-kronos-accent rounded-full" />
      )}

      {/* Round header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {/* Drag handle */}
          <div
            className="flex flex-col gap-[3px] cursor-grab active:cursor-grabbing p-1 -ml-1
                       text-kronos-muted hover:text-kronos-accent transition-colors"
            title="Drag to reorder"
          >
            <div className="flex gap-[3px]">
              <span className="w-[3px] h-[3px] rounded-full bg-current" />
              <span className="w-[3px] h-[3px] rounded-full bg-current" />
            </div>
            <div className="flex gap-[3px]">
              <span className="w-[3px] h-[3px] rounded-full bg-current" />
              <span className="w-[3px] h-[3px] rounded-full bg-current" />
            </div>
            <div className="flex gap-[3px]">
              <span className="w-[3px] h-[3px] rounded-full bg-current" />
              <span className="w-[3px] h-[3px] rounded-full bg-current" />
            </div>
          </div>

          <span className="text-xs text-kronos-muted small-caps tracking-wider">
            Round {index + 1}
          </span>
        </div>

        <div className="flex gap-2">
          {/* Duplicate button */}
          <button
            id={`duplicate-round-${index}`}
            onClick={() => onDuplicate(index)}
            className="w-7 h-7 flex items-center justify-center rounded text-kronos-muted
                       hover:text-kronos-accent hover:bg-white/5 transition-colors btn-press"
            title="Duplicate round"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
              <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
            </svg>
          </button>
          {/* Delete button */}
          <button
            id={`delete-round-${index}`}
            onClick={handleDelete}
            className="w-7 h-7 flex items-center justify-center rounded text-kronos-muted
                       hover:text-kronos-danger hover:bg-red-500/5 transition-colors btn-press"
            title="Delete round"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
              <path d="M10 11v6M14 11v6"/>
              <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Editable fields row */}
      <div className="flex items-center gap-3">
        {/* Label input */}
        <input
          id={`round-label-${index}`}
          type="text"
          value={round.label}
          onChange={(e) => onUpdate(index, { ...round, label: e.target.value })}
          className="flex-1 bg-transparent border-b border-kronos-border text-kronos-text
                     text-sm small-caps tracking-wider py-1 px-0 outline-none
                     focus:border-kronos-accent transition-colors min-w-0"
          placeholder="ROUND NAME"
        />

        {/* Work seconds */}
        <div className="flex items-center gap-1.5">
          <input
            id={`round-work-${index}`}
            type="number"
            min="1"
            max="999"
            value={round.workSeconds}
            onChange={(e) =>
              onUpdate(index, {
                ...round,
                workSeconds: Math.max(1, parseInt(e.target.value) || 1),
              })
            }
            className="w-12 bg-kronos-bg border border-kronos-border rounded-sm text-center
                       text-sm text-kronos-text py-1 outline-none
                       focus:border-kronos-accent transition-colors tabular-nums"
          />
          <span className="text-xs text-kronos-muted">s</span>
        </div>

        <span className="text-kronos-muted text-xs">/</span>

        {/* Rest seconds */}
        <div className="flex items-center gap-1.5">
          <input
            id={`round-rest-${index}`}
            type="number"
            min="0"
            max="999"
            value={round.restSeconds}
            onChange={(e) =>
              onUpdate(index, {
                ...round,
                restSeconds: Math.max(0, parseInt(e.target.value) || 0),
              })
            }
            className="w-12 bg-kronos-bg border border-kronos-border rounded-sm text-center
                       text-sm text-kronos-rest py-1 outline-none
                       focus:border-kronos-rest transition-colors tabular-nums"
          />
          <span className="text-xs text-kronos-muted">s</span>
        </div>
      </div>
    </div>
  );
}
