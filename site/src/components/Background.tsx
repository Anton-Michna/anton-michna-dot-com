import { motion } from "framer-motion";

export function Background() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-linear-to-b from-bg via-bg to-bg-soft">
      {/* CRT scanlines */}
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, var(--color-ink) 0px, var(--color-ink) 1px, transparent 1px, transparent 3px)",
        }}
      />

      {/* Grid floor */}
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(var(--color-cyan) 1px, transparent 1px), linear-gradient(90deg, var(--color-cyan) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* Neon glows */}
      <motion.div
        className="absolute top-[-10%] left-[-10%] h-[32rem] w-[32rem] rounded-full bg-cyan/20 blur-3xl"
        animate={{
          x: ["0%", "8%", "-4%", "0%"],
          y: ["0%", "-6%", "5%", "0%"],
          scale: [1, 1.1, 0.95, 1],
        }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-[20%] right-[-15%] h-[36rem] w-[36rem] rounded-full bg-magenta/20 blur-3xl"
        animate={{
          x: ["0%", "-6%", "4%", "0%"],
          y: ["0%", "5%", "-8%", "0%"],
          scale: [1, 0.9, 1.08, 1],
        }}
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-[-15%] left-[20%] h-[30rem] w-[30rem] rounded-full bg-lime/10 blur-3xl"
        animate={{
          x: ["0%", "5%", "-5%", "0%"],
          y: ["0%", "-4%", "6%", "0%"],
          scale: [1, 1.05, 0.92, 1],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Baseline */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-border to-transparent" />
    </div>
  );
}
