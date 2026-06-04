import { useEffect, useRef } from 'react';

/**
 * useWakeLock — Requests a screen wake lock to prevent the device
 * from sleeping while the app is actively running (timer/stopwatch).
 *
 * @param {boolean} active - Whether the wake lock should be held.
 */
export function useWakeLock(active) {
  const wakeLockRef = useRef(null);

  useEffect(() => {
    if (!active) {
      // Release if we're told to deactivate
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch(() => {});
        wakeLockRef.current = null;
      }
      return;
    }

    // Guard: Wake Lock API not supported
    if (!('wakeLock' in navigator)) {
      console.warn('Wake Lock API not supported on this browser.');
      return;
    }

    let released = false;

    const requestLock = async () => {
      try {
        const lock = await navigator.wakeLock.request('screen');
        if (released) {
          // Component unmounted or active turned false while awaiting
          lock.release().catch(() => {});
          return;
        }
        wakeLockRef.current = lock;

        lock.addEventListener('release', () => {
          wakeLockRef.current = null;
        });
      } catch (err) {
        // Wake lock request can fail (e.g. low battery, background tab)
        console.warn('Wake lock request failed:', err.message);
      }
    };

    requestLock();

    // Re-acquire on visibility change (browser releases wake lock when
    // the tab goes hidden, so we re-request when it becomes visible again)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !released) {
        requestLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      released = true;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch(() => {});
        wakeLockRef.current = null;
      }
    };
  }, [active]);
}
