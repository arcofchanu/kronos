import React from 'react';
import StreakGrid from '../components/StreakGrid';
import { useStreak } from '../hooks/useStreak';

/**
 * StreakScreen — Training streak heatmap and stats.
 */
export default function StreakScreen() {
  const { currentStreak, bestStreak, totalSessions, sessionCounts } = useStreak();

  return (
    <div className="screen-enter flex flex-col h-full overflow-y-auto">
      {/* Header */}
      <div className="px-6 py-4">
        <span className="text-xs text-kronos-muted small-caps tracking-wider">
          STREAK
        </span>
      </div>

      {/* Stats Cards */}
      <div className="px-6 mb-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex gap-4 mb-4">
            {/* Current Streak */}
            <div className="flex-1 bg-kronos-surface border border-kronos-border rounded-card p-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">🔥</span>
                <span className="text-xs text-kronos-muted small-caps tracking-wider">
                  Current
                </span>
              </div>
              <span className="text-2xl font-bold tabular-nums text-kronos-text">
                {currentStreak}
              </span>
              <span className="text-xs text-kronos-muted ml-1">
                day{currentStreak !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Best Streak */}
            <div className="flex-1 bg-kronos-surface border border-kronos-border rounded-card p-4">
              <div className="mb-1">
                <span className="text-xs text-kronos-muted small-caps tracking-wider">
                  Best
                </span>
              </div>
              <span className="text-2xl font-bold tabular-nums text-kronos-text">
                {bestStreak}
              </span>
              <span className="text-xs text-kronos-muted ml-1">
                day{bestStreak !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {/* Total Sessions */}
          <div className="bg-kronos-surface border border-kronos-border rounded-card p-4">
            <span className="text-xs text-kronos-muted small-caps tracking-wider">
              Total Sessions
            </span>
            <div className="mt-1">
              <span className="text-xl font-bold tabular-nums text-kronos-text">
                {totalSessions}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Heatmap */}
      <div className="px-6 mb-6">
        <div className="max-w-2xl mx-auto bg-kronos-surface border border-kronos-border rounded-card p-4">
          <StreakGrid sessionCounts={sessionCounts} />
        </div>
      </div>

      {/* Empty state */}
      {totalSessions === 0 && (
        <div className="px-6 text-center">
          <p className="text-kronos-muted text-sm">
            Complete your first session to start tracking your streak.
          </p>
        </div>
      )}

      {/* Bottom spacer for nav */}
      <div className="h-20 flex-shrink-0" />
    </div>
  );
}
