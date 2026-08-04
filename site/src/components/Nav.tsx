import { motion } from "framer-motion";
import { links } from "../data";
import { GithubIcon, LinkedinIcon, MailIcon } from "./icons";

const navItems = [
  { label: "About", href: "#about" },
  { label: "Skills", href: "#skills" },
  { label: "Projects", href: "#projects" },
  { label: "Contact", href: "#contact" },
];

export function Nav() {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed inset-x-0 top-0 z-40 border-b-4 border-ink bg-dirt"
    >
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
        <a href="#" className="comic-text-xs text-lg md:text-xl">
          Anton Michna
        </a>

        <nav className="hidden items-center gap-3 sm:flex">
          {navItems.map((item) => (
            <motion.a
              key={item.href}
              href={item.href}
              whileHover={{ y: -2 }}
              whileTap={{ y: 1 }}
              className="comic-btn bg-cream px-4 py-1.5 text-sm shadow-[3px_3px_0_0_var(--color-ink)]"
            >
              {item.label}
            </motion.a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <motion.a
            href={links.github}
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub"
            whileHover={{ y: -2, rotate: -4 }}
            whileTap={{ y: 1 }}
            className="flex h-9 w-9 items-center justify-center rounded-full border-[3px] border-ink bg-cream text-ink shadow-[3px_3px_0_0_var(--color-ink)]"
          >
            <GithubIcon className="h-4 w-4" />
          </motion.a>
          <motion.a
            href={links.linkedin}
            target="_blank"
            rel="noreferrer"
            aria-label="LinkedIn"
            whileHover={{ y: -2, rotate: 4 }}
            whileTap={{ y: 1 }}
            className="flex h-9 w-9 items-center justify-center rounded-full border-[3px] border-ink bg-cream text-ink shadow-[3px_3px_0_0_var(--color-ink)]"
          >
            <LinkedinIcon className="h-4 w-4" />
          </motion.a>
          <motion.a
            href={`mailto:${links.email}`}
            aria-label="Email"
            whileHover={{ y: -2, rotate: -4 }}
            whileTap={{ y: 1 }}
            className="flex h-9 w-9 items-center justify-center rounded-full border-[3px] border-ink bg-cream text-ink shadow-[3px_3px_0_0_var(--color-ink)]"
          >
            <MailIcon className="h-4 w-4" />
          </motion.a>
        </div>
      </div>
    </motion.header>
  );
}
