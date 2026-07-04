import type { Variants } from "framer-motion";

/** Shared cubic-bezier easing curve for smooth exit animations. */
export const EASE_OUT = [0.22, 1, 0.36, 1] as const;

/** Fade in while sliding upward. */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 48 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.85, ease: EASE_OUT, delay },
  }),
};

/** Fade in while sliding in from the left. */
export const fadeRight: Variants = {
  hidden: { opacity: 0, x: -48 },
  visible: (delay = 0) => ({
    opacity: 1,
    x: 0,
    transition: { duration: 0.85, ease: EASE_OUT, delay },
  }),
};

/** Fade in while sliding in from the right. */
export const fadeLeft: Variants = {
  hidden: { opacity: 0, x: 48 },
  visible: (delay = 0) => ({
    opacity: 1,
    x: 0,
    transition: { duration: 0.85, ease: EASE_OUT, delay },
  }),
};

/** Container that staggers its children with a delay between each. */
export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

/** Individual item inside a stagger container — fades up with slight scale. */
export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 36, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.65, ease: EASE_OUT },
  },
};

/** Item that slides in from the right with a subtle scale. */
export const shelfItem: Variants = {
  hidden: { opacity: 0, x: 48, scale: 0.95 },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { duration: 0.75, ease: EASE_OUT },
  },
};

/** Scale up from 88 % to full size with a fade. */
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.88 },
  visible: (delay = 0) => ({
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, ease: EASE_OUT, delay },
  }),
};
