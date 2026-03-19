import { gsap } from "gsap";

/**
 * Reusable GSAP animation presets for the EvalTech platform.
 * Use these with the `useGSAP` hook from @gsap/react for automatic cleanup.
 */

/** FadeIn + SlideUp — use when views/dashboards/tables load */
export function revealContent(
  targets: gsap.TweenTarget,
  options?: { delay?: number; duration?: number; y?: number }
) {
  const { delay = 0, duration = 0.6, y = 24 } = options ?? {};
  return gsap.fromTo(
    targets,
    { opacity: 0, y },
    {
      opacity: 1,
      y: 0,
      duration,
      delay,
      ease: "power2.out",
    }
  );
}

/** Stagger list items — each child appears one after another */
export function staggerList(
  targets: gsap.TweenTarget,
  options?: { stagger?: number; duration?: number; y?: number }
) {
  const { stagger = 0.08, duration = 0.5, y = 16 } = options ?? {};
  return gsap.fromTo(
    targets,
    { opacity: 0, y },
    {
      opacity: 1,
      y: 0,
      duration,
      stagger,
      ease: "power2.out",
    }
  );
}

/** Subtle pulsing scale for the timer component */
export function pulseTimer(targets: gsap.TweenTarget) {
  return gsap.to(targets, {
    scale: 1.05,
    duration: 0.5,
    repeat: -1,
    yoyo: true,
    ease: "power1.inOut",
  });
}

/** Micro-interaction: gentle scale-up on hover */
export function hoverScale(
  target: gsap.TweenTarget,
  scaleUp = 1.02
) {
  return gsap.to(target, {
    scale: scaleUp,
    duration: 0.2,
    ease: "power1.out",
  });
}

/** Micro-interaction: return to normal scale */
export function hoverScaleReset(target: gsap.TweenTarget) {
  return gsap.to(target, {
    scale: 1,
    duration: 0.2,
    ease: "power1.out",
  });
}
