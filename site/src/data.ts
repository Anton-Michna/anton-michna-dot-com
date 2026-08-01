export const links = {
  github: "https://github.com/Anton-Michna",
  linkedin: "https://www.linkedin.com/in/anton-michna-50168b240/",
  email: "antonmichna@gmail.com",
};

export const skills = [
  "React",
  "TypeScript",
  "Node.js",
  "PostgreSQL",
  "Tailwind CSS",
  "Docker",
];

export type Project = {
  name: string;
  description: string;
  tech: string[];
  href: string;
};

export const projects: Project[] = [
  {
    name: "TFRRS Stats Tool",
    description:
      "Search athletes and teams, compare fastest averages, and dig into race results.",
    tech: ["React", "TypeScript", "NestJS", "PostgreSQL"],
    href: "/tfrrs",
  },
];
