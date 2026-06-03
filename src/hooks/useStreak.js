import { useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'kronos_data';

/**
 * Default data shape for localStorage
 */
const defaultData = {
  sessions: [],
  bestStreak: 0,
};

/**
 * Read data from localStorage with graceful fallback
 */
function readData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...defaultData };
    const parsed = JSON.parse(raw);
    return {
      sessions: Array.isArray(parsed.sessions) ? parsed.sessions : [],
      bestStreak: typeof parsed.bestStreak === 'number' ? parsed.bestStreak : 0,
    };
  } catch {
    return { ...defaultData };
  }
}

/**
 * Write data to localStorage
 */
function writeData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    console.warn('Failed to write to localStorage');
  }
}

/**
 * Calculate current streak (consecutive days with at least 1 session)
 */
function calculateCurrentStreak(sessions) {
  if (sessions.length === 0) return 0;

  // Get unique dates sorted descending
  const dates = [...new Set(sessions.map((s) => s.date))].sort().reverse();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = formatDateKey(today);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = formatDateKey(yesterday);

  // Streak must include today or yesterday
  if (dates[0] !== todayStr && dates[0] !== yesterdayStr) return 0;

  let streak = 1;
  for (let i = 1; i < dates.length; i++) {
    const current = new Date(dates[i - 1]);
    const prev = new Date(dates[i]);
    const diffDays = Math.round((current - prev) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Format date as YYYY-MM-DD
 */
function formatDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Get session counts per date for heatmap
 */
function getSessionCountsByDate(sessions) {
  const counts = {};
  sessions.forEach((s) => {
    counts[s.date] = (counts[s.date] || 0) + 1;
  });
  return counts;
}

/**
 * useStreak — Manages streak data in localStorage
 */
export function useStreak() {
  const [data, setData] = useState(readData);

  // Re-read on mount (in case another tab modified it)
  useEffect(() => {
    setData(readData());
  }, []);

  const addSession = useCallback((session) => {
    setData((prev) => {
      const newSession = {
        date: session.date || formatDateKey(new Date()),
        completedAt: session.completedAt || new Date().toISOString(),
        totalSeconds: session.totalSeconds || 0,
        rounds: session.rounds || 0,
      };

      const newSessions = [...prev.sessions, newSession];
      const currentStreak = calculateCurrentStreak(newSessions);
      const bestStreak = Math.max(prev.bestStreak, currentStreak);

      const newData = {
        sessions: newSessions,
        bestStreak,
      };

      writeData(newData);
      return newData;
    });
  }, []);

  const currentStreak = calculateCurrentStreak(data.sessions);
  const sessionCounts = getSessionCountsByDate(data.sessions);

  return {
    sessions: data.sessions,
    currentStreak,
    bestStreak: data.bestStreak,
    totalSessions: data.sessions.length,
    sessionCounts,
    addSession,
  };
}
