import { motion } from "framer-motion";
import { projects } from "../data";
import { ArrowRightIcon } from "./icons";

const stripeColors = ["bg-berry", "bg-grass", "bg-grape", "bg-sky-deep"];

export function Projects() {
  return (
    <section id="projects" className="mx-auto max-w-3xl px-6 py-24">
      <motion.p
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.5 }}
        className="comic-badge bg-berry px-4 py-1 text-xs text-white md:text-sm"
      >
        Projects
      </motion.p>

      <div className="mt-6 grid gap-8 sm:grid-cols-2">
        {projects.map((project, i) => (
          <motion.a
            key={project.name}
            href={project.href}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            whileHover={{ x: -3, y: -5, rotate: -1 }}
            whileTap={{ x: 1, y: 1 }}
            className="comic-panel group overflow-hidden p-0"
          >
            <div
              className={`h-3 w-full border-b-4 border-ink ${stripeColors[i % stripeColors.length]}`}
            />
            <div className="p-6">
              <h3 className="text-xl font-extrabold text-ink">
                {project.name}
              </h3>
              <p className="mt-2 text-ink/70">{project.description}</p>

              <div className="mt-4 flex flex-wrap gap-2">
                {project.tech.map((tech) => (
                  <span
                    key={tech}
                    className="rounded-full border-2 border-ink bg-white px-3 py-1 text-xs font-bold text-ink"
                  >
                    {tech}
                  </span>
                ))}
              </div>

              <div className="mt-5 flex items-center gap-1 text-sm font-extrabold text-berry-dark">
                View project
                <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </motion.a>
        ))}
      </div>
    </section>
  );
}
