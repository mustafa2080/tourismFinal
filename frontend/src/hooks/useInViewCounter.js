import { useEffect, useRef, useState } from 'react';
import { useInView } from 'framer-motion';

/**
 * useInViewCounter
 *
 * Animates a set of numeric targets from 0 up to their final values, but
 * only starts counting once the element is scrolled into view (rather than
 * on mount, which wastes the animation on a section the user hasn't
 * scrolled to yet). Runs once per mount.
 *
 * @param {Object} targets - e.g. { travelers: 25000, destinations: 850 }
 * @param {number} duration - total animation duration in ms
 * @returns {[React.RefObject, Object]} - [ref to attach to the container, current counter values]
 */
export const useInViewCounter = (targets, duration = 2200) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.4 });
  const [values, setValues] = useState(() =>
    Object.fromEntries(Object.keys(targets).map((key) => [key, 0]))
  );
  const startedRef = useRef(false);

  useEffect(() => {
    if (!isInView || startedRef.current) return;
    startedRef.current = true;

    const steps = 60;
    let currentStep = 0;
    let timeoutId;

    const animate = () => {
      currentStep++;
      const progress = currentStep / steps;
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setValues(
        Object.fromEntries(
          Object.entries(targets).map(([key, target]) => [key, Math.floor(target * eased)])
        )
      );
      if (currentStep < steps) {
        timeoutId = setTimeout(animate, duration / steps);
      } else {
        setValues(targets);
      }
    };
    animate();

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInView]);

  return [ref, values];
};
