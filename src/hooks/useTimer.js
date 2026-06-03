import { useState, useRef, useCallback, useEffect } from 'react';

/**
 * useTimer — Manages countdown timer for interval training sessions.
 * Uses Date.now() delta for accuracy (handles app backgrounding).
 *
 * @param {Object} options
 * @param {Function} options.onPhaseChange - Called when switching between work/rest
 * @param {Function} options.onRoundComplete - Called when a round finishes
 * @param {Function} options.onSessionComplete - Called when entire session ends
 * @param {Function} options.onTick - Called every animation frame with current state
 */
export function useTimer({ onPhaseChange, onRoundComplete, onSessionComplete, onTick } = {}) {
  const [rounds, setRounds] = useState([]);
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
  const [phase, setPhase] = useState('work'); // 'work' | 'rest'
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [totalElapsed, setTotalElapsed] = useState(0);

  const roundsRef = useRef([]);
  const currentRoundRef = useRef(0);
  const phaseRef = useRef('work');
  const timeRemainingRef = useRef(0);
  const lastTickRef = useRef(0);
  const animFrameRef = useRef(null);
  const isPausedRef = useRef(false);
  const isCompleteRef = useRef(false);
  const sessionStartTimeRef = useRef(0);
  const pauseAccumulatedRef = useRef(0);
  const pauseStartRef = useRef(0);

  const callbacksRef = useRef({ onPhaseChange, onRoundComplete, onSessionComplete, onTick });
  callbacksRef.current = { onPhaseChange, onRoundComplete, onSessionComplete, onTick };

  const getCurrentPhaseDuration = useCallback(() => {
    const round = roundsRef.current[currentRoundRef.current];
    if (!round) return 0;
    return phaseRef.current === 'work' ? round.workSeconds : round.restSeconds;
  }, []);

  const advancePhase = useCallback(() => {
    const currentRound = roundsRef.current[currentRoundRef.current];

    if (phaseRef.current === 'work') {
      // Check if rest duration is 0 — skip rest phase
      if (currentRound.restSeconds === 0) {
        // Skip rest, go to next round or complete
        callbacksRef.current.onRoundComplete?.(currentRoundRef.current);

        if (currentRoundRef.current >= roundsRef.current.length - 1) {
          // Session complete
          setIsRunning(false);
          setIsComplete(true);
          isCompleteRef.current = true;
          if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
          animFrameRef.current = null;
          callbacksRef.current.onSessionComplete?.();
          return;
        }

        // Next round — stay in work
        currentRoundRef.current += 1;
        setCurrentRoundIndex(currentRoundRef.current);
        phaseRef.current = 'work';
        setPhase('work');
        timeRemainingRef.current = roundsRef.current[currentRoundRef.current].workSeconds;
        setTimeRemaining(timeRemainingRef.current);
        callbacksRef.current.onPhaseChange?.('work', currentRoundRef.current);
      } else {
        // Transition to rest
        phaseRef.current = 'rest';
        setPhase('rest');
        timeRemainingRef.current = currentRound.restSeconds;
        setTimeRemaining(timeRemainingRef.current);
        callbacksRef.current.onPhaseChange?.('rest', currentRoundRef.current);
      }
    } else {
      // Rest → next round work (or complete)
      callbacksRef.current.onRoundComplete?.(currentRoundRef.current);

      if (currentRoundRef.current >= roundsRef.current.length - 1) {
        // Session complete
        setIsRunning(false);
        setIsComplete(true);
        isCompleteRef.current = true;
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
        callbacksRef.current.onSessionComplete?.();
        return;
      }

      currentRoundRef.current += 1;
      setCurrentRoundIndex(currentRoundRef.current);
      phaseRef.current = 'work';
      setPhase('work');
      timeRemainingRef.current = roundsRef.current[currentRoundRef.current].workSeconds;
      setTimeRemaining(timeRemainingRef.current);
      callbacksRef.current.onPhaseChange?.('work', currentRoundRef.current);
    }

    lastTickRef.current = Date.now();
  }, []);

  const tick = useCallback(() => {
    // Stop immediately if session completed
    if (isCompleteRef.current) return;

    if (!isPausedRef.current) {
      const now = Date.now();
      const delta = (now - lastTickRef.current) / 1000;
      lastTickRef.current = now;

      timeRemainingRef.current -= delta;

      // Update total elapsed
      const elapsed = (now - sessionStartTimeRef.current - pauseAccumulatedRef.current) / 1000;
      setTotalElapsed(elapsed);

      if (timeRemainingRef.current <= 0) {
        timeRemainingRef.current = 0;
        setTimeRemaining(0);
        advancePhase();
        // If session just completed, don't schedule next frame
        if (isCompleteRef.current) return;
      } else {
        setTimeRemaining(timeRemainingRef.current);
      }

      // Calculate progress for current phase
      const totalDuration = getCurrentPhaseDuration();
      const progress = totalDuration > 0 ? 1 - (timeRemainingRef.current / totalDuration) : 0;
      callbacksRef.current.onTick?.({
        timeRemaining: timeRemainingRef.current,
        totalDuration,
        progress,
        phase: phaseRef.current,
        currentRound: currentRoundRef.current,
      });
    }

    animFrameRef.current = requestAnimationFrame(tick);
  }, [advancePhase, getCurrentPhaseDuration]);

  const start = useCallback((sessionRounds) => {
    if (!sessionRounds || sessionRounds.length === 0) return;

    roundsRef.current = sessionRounds;
    setRounds(sessionRounds);
    currentRoundRef.current = 0;
    setCurrentRoundIndex(0);
    phaseRef.current = 'work';
    setPhase('work');
    timeRemainingRef.current = sessionRounds[0].workSeconds;
    setTimeRemaining(sessionRounds[0].workSeconds);
    lastTickRef.current = Date.now();
    sessionStartTimeRef.current = Date.now();
    pauseAccumulatedRef.current = 0;
    setIsRunning(true);
    setIsPaused(false);
    setIsComplete(false);
    isCompleteRef.current = false;
    isPausedRef.current = false;
    setTotalElapsed(0);

    callbacksRef.current.onPhaseChange?.('work', 0);
    animFrameRef.current = requestAnimationFrame(tick);
  }, [tick]);

  const pause = useCallback(() => {
    isPausedRef.current = true;
    setIsPaused(true);
    pauseStartRef.current = Date.now();
  }, []);

  const resume = useCallback(() => {
    isPausedRef.current = false;
    setIsPaused(false);
    lastTickRef.current = Date.now();
    pauseAccumulatedRef.current += Date.now() - pauseStartRef.current;
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
    if (roundsRef.current.length === 0) return;
    currentRoundRef.current = 0;
    setCurrentRoundIndex(0);
    phaseRef.current = 'work';
    setPhase('work');
    timeRemainingRef.current = roundsRef.current[0].workSeconds;
    setTimeRemaining(roundsRef.current[0].workSeconds);
    lastTickRef.current = Date.now();
    sessionStartTimeRef.current = Date.now();
    pauseAccumulatedRef.current = 0;
    setIsPaused(false);
    isPausedRef.current = false;
    setIsComplete(false);
    isCompleteRef.current = false;
    setTotalElapsed(0);

    callbacksRef.current.onPhaseChange?.('work', 0);
  }, []);

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
    rounds,
    timeRemaining,
    phase,
    currentRoundIndex,
    totalRounds: rounds.length,
    isRunning,
    isPaused,
    isComplete,
    totalElapsed,
    progress: getCurrentPhaseDuration() > 0 ? 1 - (timeRemaining / getCurrentPhaseDuration()) : 0,
    currentPhaseDuration: getCurrentPhaseDuration(),
  };
}
