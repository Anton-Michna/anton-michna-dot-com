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
      >
        <p className="text-sm font-semibold tracking-[0.3em] text-emerald-400 uppercase">
          Contact
        </p>
        <h2 className="mt-3 text-3xl font-bold text-white md:text-4xl">
          Let's build something
        </h2>
        <p className="mt-4 text-white/60">
          Open to new opportunities — reach out any time.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <motion.a
            href={`mailto:${links.email}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.96 }}
            className="flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-400 to-blue-400 px-6 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/20"
          >
            <MailIcon className="h-4 w-4" />
            {links.email}
          </motion.a>
          <motion.a
            href={links.github}
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub"
            whileHover={{ scale: 1.08, y: -2 }}
            whileTap={{ scale: 0.96 }}
            className="rounded-full border border-white/20 p-3 text-white/80 transition-colors hover:border-white/40 hover:text-white"
          >
            <GithubIcon className="h-5 w-5" />
          </motion.a>
          <motion.a
            href={links.linkedin}
            target="_blank"
            rel="noreferrer"
            aria-label="LinkedIn"
            whileHover={{ scale: 1.08, y: -2 }}
            whileTap={{ scale: 0.96 }}
            className="rounded-full border border-white/20 p-3 text-white/80 transition-colors hover:border-white/40 hover:text-white"
          >
            <LinkedinIcon className="h-5 w-5" />
          </motion.a>
        </div>
      </motion.div>

      <p className="mt-20 text-xs text-white/30">
        © {new Date().getFullYear()} Anton Michna
      </p>
    </section>
  );
}
