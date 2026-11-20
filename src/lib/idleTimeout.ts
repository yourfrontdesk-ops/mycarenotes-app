import { useCallback, useEffect, useRef, useState } from 'react';

// Shared across tabs, so activity in any tab keeps the user signed in.
const KEY = 'mcn_last_activity';
const TIMED_OUT_KEY = 'mcn_timed_out';
const ACTIVITY_EVENTS = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'wheel'] as const;

function read(): number | null {
  try {
    const v = localStorage.getItem(KEY);
    return v ? Number(v) : null;
  } catch {
    return null;
  }
}

function write(t: number) {
  try {
    localStorage.setItem(KEY, String(t));
  } catch {
    /* storage unavailable: the in-memory value is used instead */
  }
}

/** Forget the activity record (on sign-out, and whenever the sign-in page is shown). */
export function clearActivity() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}

/** Remember that the user was signed out for inactivity, so the sign-in page can explain why. */
export function markTimedOut() {
  try {
    sessionStorage.setItem(TIMED_OUT_KEY, '1');
  } catch {
    /* ignore */
  }
}

/** Returns true once if the last sign-out was caused by inactivity. */
export function consumeTimedOut(): boolean {
  try {
    const v = sessionStorage.getItem(TIMED_OUT_KEY) === '1';
    sessionStorage.removeItem(TIMED_OUT_KEY);
    return v;
  } catch {
    return false;
  }
}

/**
 * Signs the user out after `timeoutMs` without activity, showing a warning `warnMs` beforehand.
 * Works across tabs and after the device sleeps or the browser is reopened.
 */
export function useIdleTimeout(enabled: boolean, timeoutMs: number, warnMs: number, onTimeout: () => void) {
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const memory = useRef<number>(Date.now());
  const lastWrite = useRef(0);
  const fired = useRef(false);
  const onTimeoutRef = useRef(onTimeout);
  onTimeoutRef.current = onTimeout;

  const markActive = useCallback(() => {
    const now = Date.now();
    memory.current = now;
    // Throttle storage writes to once every 5 seconds
    if (now - lastWrite.current > 5000) {
      lastWrite.current = now;
      write(now);
    }
  }, []);

  const staySignedIn = useCallback(() => {
    lastWrite.current = 0;
    markActive();
    setSecondsLeft(null);
  }, [markActive]);

  useEffect(() => {
    if (!enabled) {
      setSecondsLeft(null);
      return;
    }
    fired.current = false;

    // No record yet means a fresh sign-in; an old record means the user left without signing out.
    const stored = read();
    if (stored === null) {
      memory.current = Date.now();
      write(memory.current);
    } else {
      memory.current = stored;
    }

    const tick = () => {
      const last = Math.max(read() ?? 0, memory.current);
      const remaining = timeoutMs - (Date.now() - last);
      if (remaining <= 0) {
        if (!fired.current) {
          fired.current = true;
          setSecondsLeft(null);
          onTimeoutRef.current();
        }
      } else if (remaining <= warnMs) {
        setSecondsLeft(Math.ceil(remaining / 1000));
      } else {
        setSecondsLeft(null);
      }
    };

    const onActivity = () => {
      markActive();
      // Moving the mouse during the warning counts as being back
      tick();
    };

    tick();
    const interval = window.setInterval(tick, 1000);
    ACTIVITY_EVENTS.forEach((e) => window.addEventListener(e, onActivity, { passive: true }));
    document.addEventListener('visibilitychange', tick);
    return () => {
      window.clearInterval(interval);
      ACTIVITY_EVENTS.forEach((e) => window.removeEventListener(e, onActivity));
      document.removeEventListener('visibilitychange', tick);
    };
  }, [enabled, timeoutMs, warnMs, markActive]);

  return { secondsLeft, staySignedIn };
}
