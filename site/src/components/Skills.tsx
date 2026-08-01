import { motion } from "framer-motion";
import { skills } from "../data";

export function Skills() {
  return (
    <section id="skills" className="mx-auto max-w-3xl px-6 py-24">
      <motion.p
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.5 }}
        className="text-sm font-semibold tracking-[0.3em] text-emerald-400 uppercase"
      >
        Skills
      </motion.p>

      <div className="mt-6 flex flex-wrap gap-3">
        {skills.map((skill, i) => (
          <motion.span
            key={skill}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.4, delay: i * 0.06 }}
            whileHover={{ y: -3, scale: 1.05 }}
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80"
          >
            {skill}
          </motion.span>
        ))}
      </div>
    </section>
  );
}
