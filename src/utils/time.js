/**
 * Format seconds to MM:SS for timer display
 * @param {number} totalSeconds
 * @returns {string} e.g. "01:30" or "00:45"
 */
export function formatTime(totalSeconds) {
  const mins = Math.floor(Math.max(0, totalSeconds) / 60);
  const secs = Math.floor(Math.max(0, totalSeconds) % 60);
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

/**
 * Format milliseconds to MM:SS.cs for stopwatch display
 * @param {number} ms - Elapsed milliseconds
 * @returns {string} e.g. "00:32.40"
 */
export function formatStopwatch(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  const centiseconds = Math.floor((ms % 1000) / 10);
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(centiseconds).padStart(2, '0')}`;
}

/**
 * Format seconds to human-readable duration "Xm Ys"
 * @param {number} totalSeconds
 * @returns {string} e.g. "2m 30s" or "45s"
 */
export function formatDuration(totalSeconds) {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  if (mins === 0) return `${secs}s`;
  if (secs === 0) return `${mins}m`;
  return `${mins}m ${secs}s`;
}
