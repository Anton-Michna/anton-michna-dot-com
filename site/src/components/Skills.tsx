import { motion } from "framer-motion";
import { skills } from "../data";

const badgeColors = [
  "bg-berry text-white",
  "bg-grass text-white",
  "bg-sun text-ink",
  "bg-grape text-white",
  "bg-sky-deep text-white",
  "bg-dirt text-white",
];

export function Skills() {
  return (
    <section id="skills" className="mx-auto max-w-3xl px-6 py-24">
      <motion.p
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.5 }}
        className="comic-badge bg-sky-deep px-4 py-1 text-xs text-white md:text-sm"
      >
        Skills
      </motion.p>

      <div className="mt-6 flex flex-wrap gap-4">
        {skills.map((skill, i) => (
          <motion.span
            key={skill}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.4, delay: i * 0.06 }}
            whileHover={{ x: -2, y: -2, rotate: -2 }}
            whileTap={{ x: 1, y: 1 }}
            className={`rounded-full border-[3px] border-ink px-5 py-2 text-sm font-bold shadow-[3px_3px_0_0_var(--color-ink)] ${badgeColors[i % badgeColors.length]}`}
          >
            {skill}
          </motion.span>
        ))}
      </div>
    </section>
  );
}
