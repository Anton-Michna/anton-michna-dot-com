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
        className="hud-panel px-6 py-10 md:px-10"
      >
        <p className="hud-tag justify-center text-cyan">▸ Contact</p>
        <h2 className="mt-4 font-display text-2xl font-black tracking-tight text-ink uppercase [text-shadow:0_0_18px_var(--color-cyan)] md:text-4xl">
          Let's build something
        </h2>
        <p className="mt-4 text-ink/60">
          Open to new opportunities — reach out any time.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <motion.a
            href={`mailto:${links.email}`}
            whileHover={{ y: -2 }}
            whileTap={{ y: 0 }}
            className="hud-btn hud-btn-primary"
          >
            <MailIcon className="h-4 w-4" />
            {links.email}
          </motion.a>
          <motion.a
            href={links.github}
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub"
            whileHover={{ y: -2 }}
            whileTap={{ y: 0 }}
            className="flex h-12 w-12 items-center justify-center rounded border border-border text-ink/70 transition-colors hover:border-cyan hover:text-cyan"
          >
            <GithubIcon className="h-5 w-5" />
          </motion.a>
          <motion.a
            href={links.linkedin}
            target="_blank"
            rel="noreferrer"
            aria-label="LinkedIn"
            whileHover={{ y: -2 }}
            whileTap={{ y: 0 }}
            className="flex h-12 w-12 items-center justify-center rounded border border-border text-ink/70 transition-colors hover:border-cyan hover:text-cyan"
          >
            <LinkedinIcon className="h-5 w-5" />
          </motion.a>
        </div>
      </motion.div>

      <p className="mt-10 font-mono text-xs text-ink/30">
        // © {new Date().getFullYear()} Anton Michna
      </p>
    </section>
  );
}
