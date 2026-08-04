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
      className="fixed inset-x-0 top-0 z-40 border-b border-border bg-panel/80 backdrop-blur-md"
    >
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <a
          href="#"
          className="font-display text-sm font-bold tracking-wide text-ink uppercase"
        >
          <span className="text-cyan">[</span> Anton_Michna{" "}
          <span className="text-cyan">]</span>
        </a>

        <nav className="hidden items-center gap-8 sm:flex">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="border-b-2 border-transparent font-display text-sm font-semibold tracking-wide text-ink/60 uppercase transition-colors hover:border-cyan hover:text-cyan"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <a
            href={links.github}
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub"
            className="text-ink/60 transition-colors hover:text-cyan"
          >
            <GithubIcon className="h-5 w-5" />
          </a>
          <a
            href={links.linkedin}
            target="_blank"
            rel="noreferrer"
            aria-label="LinkedIn"
            className="text-ink/60 transition-colors hover:text-cyan"
          >
            <LinkedinIcon className="h-5 w-5" />
          </a>
          <a
            href={`mailto:${links.email}`}
            aria-label="Email"
            className="text-ink/60 transition-colors hover:text-cyan"
          >
            <MailIcon className="h-5 w-5" />
          </a>
        </div>
      </div>
    </motion.header>
  );
}
