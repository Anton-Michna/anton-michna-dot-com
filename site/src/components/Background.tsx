import { motion } from "framer-motion";

function Cloud({
  className,
  duration,
  distance = 24,
}: {
  className?: string;
  duration: number;
  distance?: number;
}) {
  return (
    <motion.div
      className={`absolute ${className}`}
      animate={{ x: [0, distance, 0] }}
      transition={{ duration, repeat: Infinity, ease: "easeInOut" }}
    >
      <div className="relative h-10 w-24 rounded-full border-4 border-ink bg-white md:h-14 md:w-36">
        <div className="absolute -top-4 left-3 h-9 w-9 rounded-full border-4 border-ink bg-white md:-top-6 md:h-14 md:w-14" />
        <div className="absolute -top-2 right-4 h-7 w-7 rounded-full border-4 border-ink bg-white md:-top-3 md:h-10 md:w-10" />
      </div>
    </motion.div>
  );
}

export function Background() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-linear-to-b from-sky via-sky-light to-sky-light">
      {/* Sun */}
      <motion.div
        className="absolute top-10 right-8 h-20 w-20 rounded-full border-4 border-ink bg-sun shadow-[0_0_70px_25px_rgba(255,210,63,0.55)] md:top-14 md:right-20 md:h-28 md:w-28"
        animate={{ scale: [1, 1.06, 1] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Clouds */}
      <Cloud className="top-24 left-[8%]" duration={26} distance={30} />
      <Cloud className="top-40 left-[55%]" duration={32} distance={-24} />
      <Cloud className="top-16 left-[30%]" duration={22} distance={18} />

      {/* Grass field */}
      <div className="absolute inset-x-0 bottom-0 h-[20vh] min-h-[140px]">
        <svg
          className="absolute -top-1 left-0 h-8 w-full md:h-12"
          viewBox="0 0 1200 60"
          preserveAspectRatio="none"
        >
          <path
            d="M0,30 Q50,0 100,30 T200,30 T300,30 T400,30 T500,30 T600,30 T700,30 T800,30 T900,30 T1000,30 T1100,30 T1200,30 V60 H0 Z"
            className="fill-grass"
          />
        </svg>
        <div
          className="absolute inset-x-0 bottom-0 top-6 border-t-4 border-ink md:top-10"
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg, var(--color-grass) 0 40px, var(--color-grass-dark) 40px 80px)",
          }}
        />
      </div>
    </div>
  );
}
