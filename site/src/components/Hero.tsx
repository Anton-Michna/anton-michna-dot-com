import { motion } from "framer-motion";
import { ChevronDownIcon } from "./icons";

export function Hero() {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2 }}
        className="sb-frame"
      >
        <p className="font-display text-sm font-bold tracking-[0.4em] text-signal uppercase">
          Software Engineer
        </p>
        <h1 className="mt-4 font-display text-6xl leading-none font-black tracking-tight text-ink uppercase md:text-8xl">
          Anton Michna
        </h1>
      </motion.div>

      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.45 }}
        className="mt-8 max-w-xl text-ink/60"
      >
        Three years of experience building full-stack web applications
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.55 }}
        className="mt-10 flex flex-wrap items-center justify-center gap-4"
      >
        <motion.a
          href="#projects"
          whileHover={{ y: -2 }}
          whileTap={{ y: 0 }}
          className="sb-btn sb-btn-primary"
        >
          View Projects
        </motion.a>
        <motion.a
          href="#contact"
          whileHover={{ y: -2 }}
          whileTap={{ y: 0 }}
          className="sb-btn"
        >
          Get in Touch
        </motion.a>
      </motion.div>

      <motion.a
        href="#about"
        aria-label="Scroll to About section"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-10 text-ink/40 transition-colors hover:text-signal"
      >
        <ChevronDownIcon className="h-6 w-6" />
      </motion.a>
    </section>
  );
}
