"use client";

/**
 * Scroll-reveal animation system — zero external dependencies.
 * Uses IntersectionObserver to trigger CSS transitions when elements
 * enter the viewport. Respects prefers-reduced-motion.
 *
 * Exports:
 *   Reveal        — generic wrapper (variant prop controls direction)
 *   FadeUp        — shorthand: variant="up"
 *   FadeIn        — shorthand: variant="fade"
 *   SlideLeft     — shorthand: variant="left"
 *   SlideRight    — shorthand: variant="right"
 *   ScaleIn       — shorthand: variant="scale"
 *   CountUp       — animated number counter, fires when in view
 */

import { useEffect, useRef, type ReactNode, type CSSProperties } from "react";

// ─── Easing & timing ───────────────────────────────────────────────────────────
const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
const DEFAULT_DURATION = 650; // ms

// ─── Hidden-state styles per variant ──────────────────────────────────────────
type Variant = "up" | "down" | "left" | "right" | "scale" | "fade";

const HIDDEN: Record<Variant, CSSProperties> = {
  up:    { opacity: 0, transform: "translateY(30px)" },
  down:  { opacity: 0, transform: "translateY(-20px)" },
  left:  { opacity: 0, transform: "translateX(-30px)" },
  right: { opacity: 0, transform: "translateX(30px)" },
  scale: { opacity: 0, transform: "scale(0.93)" },
  fade:  { opacity: 0 },
};

// ─── Core Reveal component ─────────────────────────────────────────────────────
export interface RevealProps {
  children: ReactNode;
  variant?: Variant;
  /** Delay before animation starts, in ms */
  delay?: number;
  /** Animation duration in ms (default 650) */
  duration?: number;
  className?: string;
}

export function Reveal({
  children,
  variant = "up",
  delay = 0,
  duration = DEFAULT_DURATION,
  className,
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Honour reduced-motion preference — skip animation entirely
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Apply initial hidden state
    Object.assign(el.style, {
      ...HIDDEN[variant],
      transition: `opacity ${duration}ms ${EASE}, transform ${duration}ms ${EASE}`,
      transitionDelay: `${delay}ms`,
      willChange: "opacity, transform",
    });

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.opacity = "1";
          el.style.transform = "none";
          // Clear will-change after animation completes to free GPU memory
          setTimeout(() => {
            el.style.willChange = "auto";
          }, duration + delay + 100);
          io.unobserve(el);
        }
      },
      // rootMargin pushes the trigger point 60px above the bottom of the viewport
      // so elements start animating slightly before they're fully visible
      { threshold: 0.06, rootMargin: "0px 0px -60px 0px" }
    );

    io.observe(el);
    return () => io.disconnect();
  }, [variant, delay, duration]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

// ─── Named shorthands ──────────────────────────────────────────────────────────
export const FadeUp    = (p: Omit<RevealProps, "variant">) => <Reveal variant="up"    {...p} />;
export const FadeIn    = (p: Omit<RevealProps, "variant">) => <Reveal variant="fade"  {...p} />;
export const SlideLeft = (p: Omit<RevealProps, "variant">) => <Reveal variant="left"  {...p} />;
export const SlideRight= (p: Omit<RevealProps, "variant">) => <Reveal variant="right" {...p} />;
export const ScaleIn   = (p: Omit<RevealProps, "variant">) => <Reveal variant="scale" {...p} />;

// ─── CountUp ───────────────────────────────────────────────────────────────────
export interface CountUpProps {
  /** Final number to count to */
  to: number;
  /** Optional suffix displayed after the number, e.g. "+" or "k" */
  suffix?: string;
  /** Optional prefix before the number, e.g. "$" */
  prefix?: string;
  /** Animation duration in ms (default 1600) */
  duration?: number;
  className?: string;
}

export function CountUp({
  to,
  suffix = "",
  prefix = "",
  duration = 1600,
  className,
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const fired = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !fired.current) {
          fired.current = true;
          const startTime = performance.now();

          function tick(now: number) {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease-out cubic: decelerates toward target
            const eased = 1 - Math.pow(1 - progress, 3);
            el!.textContent = `${prefix}${Math.round(eased * to)}${suffix}`;
            if (progress < 1) requestAnimationFrame(tick);
          }

          requestAnimationFrame(tick);
          io.unobserve(el);
        }
      },
      { threshold: 0.5 }
    );

    io.observe(el);
    return () => io.disconnect();
  }, [to, suffix, prefix, duration]);

  // Server-rendered default (shown before JS fires)
  return (
    <span ref={ref} className={className}>
      {prefix}0{suffix}
    </span>
  );
}
