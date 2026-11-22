import { useEffect, useRef } from 'react';

/**
 * Run `fn` now and then every `ms`, but only while the browser tab is visible.
 * When the user comes back to the tab it refreshes straight away, so data is
 * never stale, and hidden tabs don't drain battery or mobile data.
 */
export function usePoll(fn: () => void, ms: number, enabled = true) {
  const fnRef = useRef(fn);
  fnRef.current = fn;

  useEffect(() => {
    if (!enabled) return;
    const run = () => {
      if (document.visibilityState === 'visible') fnRef.current();
    };
    run();
    const timer = setInterval(run, ms);
    document.addEventListener('visibilitychange', run);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', run);
    };
  }, [ms, enabled]);
}
