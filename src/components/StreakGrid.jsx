import React, { useMemo, useState, useRef } from 'react';

/**
 * StreakGrid — GitHub-style heatmap showing training history.
 * 52 columns (weeks) × 7 rows (days of week)
 * Horizontally scrollable on mobile.
 */
export default function StreakGrid({ sessionCounts = {} }) {
  const [tooltip, setTooltip] = useState(null);
  const scrollRef = useRef(null);

  const grid = useMemo(() => {
    const days = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const start = new Date(today);
    start.setDate(start.getDate() - 364);
    start.setDate(start.getDate() - start.getDay());

    const current = new Date(start);
    while (current <= today) {
      const dateKey = formatDateKey(current);
      const count = sessionCounts[dateKey] || 0;
      const isToday =
        current.getFullYear() === today.getFullYear() &&
        current.getMonth() === today.getMonth() &&
        current.getDate() === today.getDate();

      days.push({
        date: new Date(current),
        dateKey,
        count,
        isToday,
        dayOfWeek: current.getDay(),
        weekIndex: Math.floor(
          (current.getTime() - start.getTime()) / (7 * 24 * 60 * 60 * 1000)
        ),
      });

      current.setDate(current.getDate() + 1);
    }

    return days;
  }, [sessionCounts]);

  const weeks = useMemo(() => {
    const w = [];
    grid.forEach((day) => {
      if (!w[day.weekIndex]) w[day.weekIndex] = [];
      w[day.weekIndex][day.dayOfWeek] = day;
    });
    return w;
  }, [grid]);

  const months = useMemo(() => {
    const m = [];
    let lastMonth = -1;
    weeks.forEach((week, weekIdx) => {
      const firstDay = week.find((d) => d);
      if (firstDay) {
        const month = firstDay.date.getMonth();
        if (month !== lastMonth) {
          m.push({
            label: firstDay.date.toLocaleString('en-US', { month: 'short' }),
            weekIndex: weekIdx,
          });
          lastMonth = month;
        }
      }
    });
    return m;
  }, [weeks]);

  function getCellColor(count) {
    if (count === 0) return '#111111';
    if (count === 1) return '#4A6FA5';
    if (count === 2) return '#7AA2D4';
    return '#C8D8FF';
  }

  function formatDateKey(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  const CELL = 9;
  const GAP = 2;
  const STEP = CELL + GAP;
  const MONTH_GAP = 4;
  const DAY_W = 20;
  const MONTH_ROW_H = 16;

  const DAY_LABELS = ['', 'Mon', '', 'Wed', '', 'Fri', ''];

  // Week indices where a new month starts (skip first month)
  const monthBoundaryWeeks = useMemo(() => {
    const s = new Set();
    months.forEach((m, i) => {
      if (i > 0) s.add(m.weekIndex);
    });
    return s;
  }, [months]);

  // Count accumulated gaps up to a given week index
  const gapsBeforeWeek = (weekIdx) => {
    let count = 0;
    monthBoundaryWeeks.forEach((bw) => {
      if (bw <= weekIdx) count++;
    });
    return count * MONTH_GAP;
  };

  const GRID_W = weeks.length * STEP + monthBoundaryWeeks.size * MONTH_GAP;

  return (
    <div className="w-full">
      {/* Scrollable container for month labels + grid together */}
      <div
        ref={scrollRef}
        className="overflow-x-auto"
        style={{ scrollbarWidth: 'thin' }}
      >
        <div style={{ display: 'flex', minWidth: DAY_W + GRID_W + 4 }}>
          {/* Day labels column — sticks to the left */}
          <div
            style={{
              width: DAY_W,
              flexShrink: 0,
              paddingTop: MONTH_ROW_H,
            }}
          >
            {DAY_LABELS.map((label, i) => (
              <div
                key={i}
                style={{
                  height: STEP,
                  lineHeight: `${STEP}px`,
                  fontSize: '9px',
                  color: '#444',
                }}
              >
                {label}
              </div>
            ))}
          </div>

          {/* Month labels + grid column */}
          <div style={{ flexShrink: 0 }}>
            {/* Month labels row */}
            <div style={{ height: MONTH_ROW_H, position: 'relative' }}>
              {months.map((m, i) => (
                <span
                  key={i}
                  style={{
                    position: 'absolute',
                    left: m.weekIndex * STEP + gapsBeforeWeek(m.weekIndex),
                    top: 0,
                    fontSize: '9px',
                    color: '#444',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {m.label}
                </span>
              ))}
            </div>

            {/* Heatmap grid */}
            <div style={{ display: 'flex', gap: GAP }}>
              {weeks.map((week, weekIdx) => (
                <div key={weekIdx} style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: GAP,
                  marginLeft: monthBoundaryWeeks.has(weekIdx) ? MONTH_GAP : 0,
                }}>
                  {Array.from({ length: 7 }, (_, dayIdx) => {
                    const day = week?.[dayIdx];
                    if (!day) {
                      return (
                        <div
                          key={dayIdx}
                          style={{ width: CELL, height: CELL }}
                        />
                      );
                    }

                    return (
                      <div
                        key={dayIdx}
                        style={{
                          width: CELL,
                          height: CELL,
                          backgroundColor: getCellColor(day.count),
                          borderRadius: '2px',
                          border: day.isToday
                            ? '1px solid rgba(255,255,255,0.5)'
                            : day.count === 0
                            ? '1px solid #1A1A1A'
                            : 'none',
                          cursor: 'pointer',
                        }}
                        onMouseEnter={(e) => {
                          const rect = e.target.getBoundingClientRect();
                          setTooltip({
                            text: `${day.date.toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                            })} — ${day.count} session${day.count !== 1 ? 's' : ''}`,
                            x: rect.left + rect.width / 2,
                            y: rect.top - 8,
                          });
                        }}
                        onMouseLeave={() => setTooltip(null)}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 px-2 py-1 text-xs bg-kronos-surface border border-kronos-border
                     rounded text-kronos-text whitespace-nowrap pointer-events-none"
          style={{
            left: tooltip.x,
            top: tooltip.y,
            transform: 'translate(-50%, -100%)',
          }}
        >
          {tooltip.text}
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-2 mt-3 justify-end text-xs text-kronos-muted">
        <span>Less</span>
        {[0, 1, 2, 3].map((level) => (
          <div
            key={level}
            style={{
              width: CELL,
              height: CELL,
              backgroundColor: getCellColor(level),
              borderRadius: '2px',
              border: level === 0 ? '1px solid #1A1A1A' : 'none',
            }}
          />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}
