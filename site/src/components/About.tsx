import { motion } from "framer-motion";

export function About() {
  return (
    <section id="about" className="mx-auto max-w-3xl px-6 py-24">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.6 }}
      >
        <p className="text-sm font-semibold tracking-[0.3em] text-emerald-400 uppercase">
          About Me
        </p>
        <h2 className="mt-3 text-3xl font-bold text-white md:text-4xl">
          Building things that work, and work well
        </h2>
        <p className="mt-6 leading-relaxed text-white/60">
          I'm a software engineer with three years of experience across the
          full stack — designing APIs, modeling data, and building
          interfaces people actually enjoy using. I like taking a project
          from a rough idea to something polished end to end, and I'm always
          looking for the next problem worth solving.
        </p>
      </motion.div>
    </section>
  );
}
