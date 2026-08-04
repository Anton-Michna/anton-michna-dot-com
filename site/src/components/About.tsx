import { motion } from "framer-motion";

export function About() {
  return (
    <section id="about" className="mx-auto max-w-3xl px-6 py-24">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.6 }}
        className="hud-panel px-6 py-8 md:px-10 md:py-10"
      >
        <p className="hud-tag text-magenta">▸ About Me</p>
        <h2 className="mt-4 font-display text-2xl font-black tracking-tight text-ink uppercase [text-shadow:0_0_18px_var(--color-magenta)] md:text-4xl">
          Building things that work
        </h2>
        <p className="mt-6 leading-relaxed text-ink/70">
          I'm a software engineer with three years of experience as a full-stack
          developer, designing APIs, modeling data, and building straightforward
          interfaces. I enjoy problem solving and creating solutions that are
          both functional and user-friendly. My goal is to craft software that
          not only meets requirements but also provides a seamless experience
          for users.
        </p>
      </motion.div>
    </section>
  );
}
