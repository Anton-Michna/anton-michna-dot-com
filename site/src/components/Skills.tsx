import { motion } from "framer-motion";
import { skills } from "../data";

const accentClasses = [
  "border-cyan/50 text-cyan hover:shadow-[0_0_16px_-2px_var(--color-cyan)]",
  "border-magenta/50 text-magenta hover:shadow-[0_0_16px_-2px_var(--color-magenta)]",
  "border-lime/50 text-lime hover:shadow-[0_0_16px_-2px_var(--color-lime)]",
  "border-amber/50 text-amber hover:shadow-[0_0_16px_-2px_var(--color-amber)]",
];

export function Skills() {
  return (
    <section id="skills" className="mx-auto max-w-3xl px-6 py-24">
      <motion.p
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.5 }}
        className="hud-tag text-lime"
      >
        ▸ Skills
      </motion.p>

      <div className="mt-6 flex flex-wrap gap-3">
        {skills.map((skill, i) => (
          <motion.span
            key={skill}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.4, delay: i * 0.06 }}
            whileHover={{ y: -3 }}
            className={`rounded border bg-panel px-4 py-2 font-display text-xs font-bold tracking-wide uppercase transition-shadow ${accentClasses[i % accentClasses.length]}`}
          >
            {skill}
          </motion.span>
        ))}
      </div>
    </section>
  );
}
