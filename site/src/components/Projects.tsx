import { motion } from "framer-motion";
import { projects } from "../data";
import { ArrowRightIcon } from "./icons";

export function Projects() {
  return (
    <section id="projects" className="mx-auto max-w-3xl px-6 py-24">
      <motion.p
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.5 }}
        className="text-sm font-semibold tracking-[0.3em] text-emerald-400 uppercase"
      >
        Projects
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
            className="group rounded-2xl border border-white/10 bg-white/5 p-6 transition-colors hover:border-emerald-400/40"
          >
            <h3 className="text-xl font-semibold text-white">
              {project.name}
            </h3>
            <p className="mt-2 text-white/60">{project.description}</p>

            <div className="mt-4 flex flex-wrap gap-2">
              {project.tech.map((tech) => (
                <span
                  key={tech}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/50"
                >
                  {tech}
                </span>
              ))}
            </div>

            <div className="mt-5 flex items-center gap-1 text-sm font-semibold text-emerald-400">
              View project
              <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
          </motion.a>
        ))}
      </div>
    </section>
  );
}
