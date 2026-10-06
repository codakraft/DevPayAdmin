import { useCallback, useEffect, useRef, useState } from "react";
import { useLogoutMutation } from "../store/apiSlice";
import { useAuth } from "../context/AuthContext";
import { LAST_ACTIVITY_KEY, setLoginNotice } from "../helpers/auth";

export const IDLE_TIMEOUT_MS = 15 * 60 * 1000;
const WARNING_MS = 60 * 1000;
const ACTIVITY_EVENTS = [
  "mousemove",
  "mousedown",
  "keydown",
  "scroll",
  "touchstart",
  "wheel",
];
// Avoid writing to localStorage on every mouse move
const ACTIVITY_WRITE_INTERVAL_MS = 5000;

const readLastActivity = () => {
  const value = Number(localStorage.getItem(LAST_ACTIVITY_KEY));
  return Number.isFinite(value) && value > 0 ? value : Date.now();
};

const recordActivity = () => {
  localStorage.setItem(LAST_ACTIVITY_KEY, String(Date.now()));
};

/**
 * Signs the admin out after a period of inactivity, with a one-minute warning.
 * While the warning is showing, only "Stay signed in" keeps the session alive.
 */
const useIdleTimeout = (timeoutMs = IDLE_TIMEOUT_MS) => {
  const { logout } = useAuth();
  const [logoutMutation] = useLogoutMutation();
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const lastWriteRef = useRef(0);
  const signingOutRef = useRef(false);
  // logout and the mutation trigger change identity on re-render; keep the
  // timer effect from restarting (and resetting) because of that
  const logoutRef = useRef(logout);
  const logoutMutationRef = useRef(logoutMutation);
  logoutRef.current = logout;
  logoutMutationRef.current = logoutMutation;
  const showWarning = secondsLeft !== null;

  const staySignedIn = useCallback(() => {
    recordActivity();
    lastWriteRef.current = Date.now();
    setSecondsLeft(null);
  }, []);

  useEffect(() => {
    // Cleared at login/logout, so a missing value means a fresh session. A
    // stale value (tab closed and reopened later) times out on the first tick.
    if (!localStorage.getItem(LAST_ACTIVITY_KEY)) recordActivity();

    const handleActivity = () => {
      const now = Date.now();
      if (now - lastWriteRef.current < ACTIVITY_WRITE_INTERVAL_MS) return;
      // Ignore background activity once the warning is up
      if (now - readLastActivity() >= timeoutMs - WARNING_MS) return;
      lastWriteRef.current = now;
      recordActivity();
    };

    const signOut = async () => {
      if (signingOutRef.current) return;
      signingOutRef.current = true;
      try {
        await logoutMutationRef.current().unwrap();
      } catch {
        // Sign out locally even if the API call fails
      }
      setLoginNotice(
        "You were signed out after 15 minutes of inactivity. Please sign in again."
      );
      logoutRef.current();
    };

    const tick = () => {
      const remaining = timeoutMs - (Date.now() - readLastActivity());
      if (remaining <= 0) {
        signOut();
      } else if (remaining <= WARNING_MS) {
        setSecondsLeft(Math.ceil(remaining / 1000));
      } else {
        setSecondsLeft(null);
      }
    };

    ACTIVITY_EVENTS.forEach((event) =>
      window.addEventListener(event, handleActivity, { passive: true })
    );
    const interval = window.setInterval(tick, 1000);

    return () => {
      ACTIVITY_EVENTS.forEach((event) =>
        window.removeEventListener(event, handleActivity)
      );
      window.clearInterval(interval);
    };
  }, [timeoutMs]);

  return { showWarning, secondsLeft, staySignedIn };
};

export default useIdleTimeout;
