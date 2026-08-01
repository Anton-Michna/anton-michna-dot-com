import { motion } from "framer-motion";
import { ChevronDownIcon } from "./icons";

export function Hero() {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="text-sm font-semibold tracking-[0.3em] text-emerald-400 uppercase"
      >
        Hi, I&apos;m
      </motion.p>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0, backgroundPositionX: ["0%", "100%"] }}
        transition={{
          opacity: { duration: 0.7, delay: 0.2 },
          y: { duration: 0.7, delay: 0.2 },
          backgroundPositionX: {
            duration: 6,
            repeat: Infinity,
            repeatType: "mirror",
            ease: "linear",
          },
        }}
        className="mt-4 bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400 bg-[length:200%_auto] bg-clip-text text-6xl font-extrabold tracking-tight text-transparent md:text-8xl"
      >
        Anton Michna
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.35 }}
        className="mt-5 text-2xl font-medium text-white/70 md:text-3xl"
      >
        Software Engineer
      </motion.p>

      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.45 }}
        className="mt-6 max-w-xl text-white/50"
      >
        Three years of experience building full-stack web applications —
        from React front ends to Node/NestJS APIs backed by PostgreSQL.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.55 }}
        className="mt-10 flex flex-wrap items-center justify-center gap-4"
      >
        <motion.a
          href="#projects"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.96 }}
          className="rounded-full bg-gradient-to-r from-emerald-400 to-blue-400 px-6 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/20"
        >
          View Projects
        </motion.a>
        <motion.a
          href="#contact"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.96 }}
          className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white transition-colors hover:border-white/40"
        >
          Get in Touch
        </motion.a>
      </motion.div>

      <motion.a
        href="#about"
        aria-label="Scroll to About section"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-10 text-white/40 transition-colors hover:text-white/70"
      >
        <ChevronDownIcon className="h-6 w-6" />
      </motion.a>
    </section>
  );
}
