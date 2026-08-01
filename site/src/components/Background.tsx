import { motion } from "framer-motion";

export function Background() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-slate-950">
      <motion.div
        className="absolute top-[-10%] left-[-10%] h-[32rem] w-[32rem] rounded-full bg-emerald-500/20 blur-3xl"
        animate={{
          x: ["0%", "8%", "-4%", "0%"],
          y: ["0%", "-6%", "5%", "0%"],
          scale: [1, 1.1, 0.95, 1],
        }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-[20%] right-[-15%] h-[36rem] w-[36rem] rounded-full bg-purple-500/20 blur-3xl"
        animate={{
          x: ["0%", "-6%", "4%", "0%"],
          y: ["0%", "5%", "-8%", "0%"],
          scale: [1, 0.9, 1.08, 1],
        }}
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-[-15%] left-[20%] h-[30rem] w-[30rem] rounded-full bg-blue-500/20 blur-3xl"
        animate={{
          x: ["0%", "5%", "-5%", "0%"],
          y: ["0%", "-4%", "6%", "0%"],
          scale: [1, 1.05, 0.92, 1],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}
