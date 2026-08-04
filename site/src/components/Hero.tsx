import { motion } from "framer-motion";
import { ChevronDownIcon } from "./icons";

export function Hero() {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2 }}
        className="comic-text mt-5 text-6xl leading-none md:text-8xl"
      >
        Anton Michna
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.35 }}
        className="comic-badge mt-6 bg-grass px-5 py-2 text-lg text-white md:text-2xl"
      >
        Software Engineer
      </motion.p>

      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.45 }}
        className="comic-panel mt-8 max-w-xl px-6 py-5 text-ink/80"
      >
        Three years of experience building full-stack web applications
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.55 }}
        className="mt-10 flex flex-wrap items-center justify-center gap-5"
      >
        <motion.a
          href="#projects"
          whileHover={{ x: -2, y: -2 }}
          whileTap={{ x: 2, y: 2 }}
          className="comic-btn bg-sun"
        >
          View Projects
        </motion.a>
        <motion.a
          href="#contact"
          whileHover={{ x: -2, y: -2 }}
          whileTap={{ x: 2, y: 2 }}
          className="comic-btn bg-cream"
        >
          Get in Touch
        </motion.a>
      </motion.div>

      <motion.a
        href="#about"
        aria-label="Scroll to About section"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-10 flex h-10 w-10 items-center justify-center rounded-full border-[3px] border-ink bg-cream text-ink shadow-[3px_3px_0_0_var(--color-ink)] transition-colors hover:bg-sun"
      >
        <ChevronDownIcon className="h-5 w-5" />
      </motion.a>
    </section>
  );
}
