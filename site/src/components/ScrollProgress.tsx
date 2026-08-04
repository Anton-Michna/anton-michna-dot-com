import { motion, useScroll, useSpring } from "framer-motion";

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 200,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <div className="fixed inset-x-0 top-0 z-50 h-[6px] border-b border-border/60">
      <motion.div
        className="h-full origin-left bg-linear-to-r from-cyan via-magenta to-lime shadow-[0_0_12px_-1px_var(--color-cyan)]"
        style={{ scaleX }}
      />
      {/* Segmented tick overlay for a health-bar feel */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, transparent 0 18px, var(--color-bg) 18px 20px)",
        }}
      />
    </div>
  );
}
