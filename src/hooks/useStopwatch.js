import { useState, useRef, useCallback, useEffect } from 'react';

/**
 * useStopwatch — Count-up stopwatch with lap recording.
 * Uses Date.now() delta for accuracy.
 */
export function useStopwatch() {
  const [elapsedMs, setElapsedMs] = useState(0);
  const [lapElapsedMs, setLapElapsedMs] = useState(0);
  const [laps, setLaps] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const startTimeRef = useRef(0);
  const lapStartTimeRef = useRef(0);
  const accumulatedRef = useRef(0);
  const lapAccumulatedRef = useRef(0);
  const animFrameRef = useRef(null);
  const isPausedRef = useRef(false);

  const tick = useCallback(() => {
    if (!isPausedRef.current) {
      const now = Date.now();
      const totalElapsed = accumulatedRef.current + (now - startTimeRef.current);
      const lapElapsed = lapAccumulatedRef.current + (now - lapStartTimeRef.current);
      setElapsedMs(totalElapsed);
      setLapElapsedMs(lapElapsed);
    }
    animFrameRef.current = requestAnimationFrame(tick);
  }, []);

  const start = useCallback(() => {
    const now = Date.now();
    startTimeRef.current = now;
    lapStartTimeRef.current = now;
    accumulatedRef.current = 0;
    lapAccumulatedRef.current = 0;
    setElapsedMs(0);
    setLapElapsedMs(0);
    setLaps([]);
    setIsRunning(true);
    setIsPaused(false);
    isPausedRef.current = false;
    animFrameRef.current = requestAnimationFrame(tick);
  }, [tick]);

  const pause = useCallback(() => {
    const now = Date.now();
    accumulatedRef.current += now - startTimeRef.current;
    lapAccumulatedRef.current += now - lapStartTimeRef.current;
    isPausedRef.current = true;
    setIsPaused(true);
  }, []);

  const resume = useCallback(() => {
    const now = Date.now();
    startTimeRef.current = now;
    lapStartTimeRef.current = now;
    isPausedRef.current = false;
    setIsPaused(false);
  }, []);

  const togglePause = useCallback(() => {
    if (isPausedRef.current) {
      resume();
    } else {
      pause();
    }
  }, [pause, resume]);

  const stop = useCallback(() => {
    setIsRunning(false);
    setIsPaused(false);
    isPausedRef.current = false;
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
  }, []);

  const reset = useCallback(() => {
    setElapsedMs(0);
    setLapElapsedMs(0);
    setLaps([]);
    setIsRunning(false);
    setIsPaused(false);
    isPausedRef.current = false;
    accumulatedRef.current = 0;
    lapAccumulatedRef.current = 0;
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
  }, []);

  const lap = useCallback(() => {
    if (!isRunning || isPausedRef.current) return;

    const now = Date.now();
    const splitMs = lapAccumulatedRef.current + (now - lapStartTimeRef.current);
    const totalMs = accumulatedRef.current + (now - startTimeRef.current);

    setLaps((prev) => [
      { number: prev.length + 1, splitMs, totalMs },
      ...prev,
    ]);

    // Reset lap timer
    lapStartTimeRef.current = now;
    lapAccumulatedRef.current = 0;
    setLapElapsedMs(0);
  }, [isRunning]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  return {
    start,
    pause,
    resume,
    togglePause,
    stop,
    reset,
    lap,
    elapsedMs,
    lapElapsedMs,
    laps,
    isRunning,
    isPaused,
  };
}
