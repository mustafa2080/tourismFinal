import { motion } from 'framer-motion';

/**
 * Reveal
 *
 * Wraps children in a fade + slide-up entrance animation that triggers once
 * when the element scrolls into view. Used across the homepage so every
 * section "arrives" the same way instead of popping in instantly - this is
 * the same pattern Airbnb/Booking.com use for scroll-triggered content.
 *
 * @param {number} delay - stagger offset in seconds (e.g. 0.1, 0.2, 0.3 for
 *   siblings so they cascade in rather than all animating at once)
 * @param {number} y - starting vertical offset in px (how far it slides up)
 * @param {string} as - which motion element to render (default div)
 * @param {number} amount - fraction of the element that must be visible
 *   before triggering (0-1). Lower = triggers earlier.
 */
export const Reveal = ({
  children,
  delay = 0,
  y = 24,
  duration = 0.6,
  className = '',
  amount = 0.2,
  as = 'div',
  ...rest
}) => {
  const MotionTag = motion[as] || motion.div;
  return (
    <MotionTag
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount }}
      transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
      {...rest}
    >
      {children}
    </MotionTag>
  );
};

/**
 * StaggerGroup
 *
 * Wraps a list of children (e.g. cards in a grid) so they cascade in one
 * after another rather than all appearing simultaneously. Pair with
 * StaggerItem for each child.
 */
export const StaggerGroup = ({
  children,
  className = '',
  amount = 0.15,
  staggerDelay = 0.08,
  ...rest
}) => (
  <motion.div
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, amount }}
    variants={{
      hidden: {},
      visible: {
        transition: { staggerChildren: staggerDelay },
      },
    }}
    className={className}
    {...rest}
  >
    {children}
  </motion.div>
);

export const StaggerItem = ({ children, className = '', y = 24, duration = 0.5, ...rest }) => (
  <motion.div
    variants={{
      hidden: { opacity: 0, y },
      visible: {
        opacity: 1,
        y: 0,
        transition: { duration, ease: [0.22, 1, 0.36, 1] },
      },
    }}
    className={className}
    {...rest}
  >
    {children}
  </motion.div>
);
