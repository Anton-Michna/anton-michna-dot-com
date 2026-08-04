import { motion } from "framer-motion";
import { links } from "../data";
import { GithubIcon, LinkedinIcon, MailIcon } from "./icons";

export function Contact() {
  return (
    <section id="contact" className="mx-auto max-w-3xl px-6 py-24 text-center">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.6 }}
        className="comic-panel px-6 py-10 md:px-10"
      >
        <p className="comic-badge bg-grass px-4 py-1 text-xs text-white md:text-sm">
          Contact
        </p>
        <h2 className="comic-text-sm mt-4 text-2xl md:text-4xl">
          Let's build something
        </h2>
        <p className="mt-4 text-ink/70">
          Open to new opportunities — reach out any time.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-5">
          <motion.a
            href={`mailto:${links.email}`}
            whileHover={{ x: -2, y: -2 }}
            whileTap={{ x: 2, y: 2 }}
            className="comic-btn bg-sun"
          >
            <MailIcon className="h-4 w-4" />
            {links.email}
          </motion.a>
          <motion.a
            href={links.github}
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub"
            whileHover={{ x: -2, y: -2, rotate: -4 }}
            whileTap={{ x: 2, y: 2 }}
            className="flex h-12 w-12 items-center justify-center rounded-full border-[3px] border-ink bg-white text-ink shadow-[4px_4px_0_0_var(--color-ink)]"
          >
            <GithubIcon className="h-5 w-5" />
          </motion.a>
          <motion.a
            href={links.linkedin}
            target="_blank"
            rel="noreferrer"
            aria-label="LinkedIn"
            whileHover={{ x: -2, y: -2, rotate: 4 }}
            whileTap={{ x: 2, y: 2 }}
            className="flex h-12 w-12 items-center justify-center rounded-full border-[3px] border-ink bg-white text-ink shadow-[4px_4px_0_0_var(--color-ink)]"
          >
            <LinkedinIcon className="h-5 w-5" />
          </motion.a>
        </div>
      </motion.div>

      <p className="mt-10 text-xs font-bold text-ink/50">
        © {new Date().getFullYear()} Anton Michna
      </p>
    </section>
  );
}
