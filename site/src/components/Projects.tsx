import { motion } from "framer-motion";
import { projects } from "../data";
import { ArrowRightIcon } from "./icons";

const stripeColors = ["bg-cyan", "bg-magenta", "bg-lime", "bg-amber"];

export function Projects() {
  return (
    <section id="projects" className="mx-auto max-w-3xl px-6 py-24">
      <motion.p
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.5 }}
        className="hud-tag text-amber"
      >
        ▸ Projects
      </motion.p>

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        {projects.map((project, i) => (
          <motion.a
            key={project.name}
            href={project.href}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            whileHover={{ y: -6 }}
            className="hud-panel group overflow-hidden p-0"
          >
            <div
              className={`h-[3px] w-full ${stripeColors[i % stripeColors.length]}`}
            />
            <div className="p-6">
              <h3 className="font-display text-lg font-bold tracking-wide text-ink uppercase">
                {project.name}
              </h3>
              <p className="mt-2 text-ink/60">{project.description}</p>

              <div className="mt-4 flex flex-wrap gap-2">
                {project.tech.map((tech) => (
                  <span
                    key={tech}
                    className="rounded border border-border bg-panel-2 px-3 py-1 font-mono text-xs text-ink/60"
                  >
                    {tech}
                  </span>
                ))}
              </div>

              <div className="mt-5 flex items-center gap-1 font-display text-sm font-bold tracking-wide text-cyan uppercase">
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
