import { useEffect, useRef } from "react";

/**
 * Hook to track admin/dashboard user inactivity and trigger a callback
 * when the idle timeout is reached.
 *
 * @param timeoutSeconds - Timeout in seconds; if undefined or 0, inactivity tracking is disabled
 * @param onTimeout - Callback to invoke when the timeout expires
 */
export function useAdminInactivity(
  timeoutSeconds: number | undefined,
  onTimeout: () => void,
) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isTabActiveRef = useRef(true);
  const onTimeoutRef = useRef(onTimeout);

  useEffect(() => {
    onTimeoutRef.current = onTimeout;
  }, [onTimeout]);

  useEffect(() => {
    // If timeout is not configured or <= 0, do nothing
    if (!timeoutSeconds || timeoutSeconds <= 0) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      return;
    }

    // Track when tab becomes inactive/active
    const handleVisibilityChange = () => {
      isTabActiveRef.current = !document.hidden;

      if (!isTabActiveRef.current) {
        // Tab is now hidden; clear the timeout so we don't logout while tab is in the background
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
      } else {
        // Tab is now visible; restart the timer
        resetInactivityTimer();
      }
    };

    // Reset the inactivity timer
    const resetInactivityTimer = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Only set a new timeout if the tab is active
      if (isTabActiveRef.current) {
        console.log('[useAdminInactivity] starting timer', timeoutSeconds);
        timeoutRef.current = setTimeout(() => {
          console.log('[useAdminInactivity] timeout fired');
          onTimeoutRef.current();
        }, timeoutSeconds * 1000);
      }
    };

    // Track user activity
    const activityEvents = [
      "mousemove",
      "mousedown",
      "keydown",
      "touchstart",
      "scroll",
    ];

    const handleActivity = () => {
      if (isTabActiveRef.current) {
        resetInactivityTimer();
      }
    };

    // Listen for visibility changes
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Listen for activity events
    activityEvents.forEach((event) => {
      document.addEventListener(event, handleActivity);
    });

    // Start the initial timer
    resetInactivityTimer();

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      document.removeEventListener("visibilitychange", handleVisibilityChange);
      activityEvents.forEach((event) => {
        document.removeEventListener(event, handleActivity);
      });
    };
  }, [timeoutSeconds, onTimeout]);
}
