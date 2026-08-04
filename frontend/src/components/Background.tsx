interface BackgroundProps {
  primaryColor?: string;
  secondaryColor?: string;
}

export function Background({
  primaryColor = "#22d3ee",
  secondaryColor = "#8b7cf6",
}: BackgroundProps) {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-linear-to-b from-bg via-bg to-bg-soft">
      {/* Scanline / grid texture */}
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(var(--color-ink) 1px, transparent 1px), linear-gradient(90deg, var(--color-ink) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />

      {/* Floodlight glows */}
      <div
        className="animate-drift absolute top-[-10%] left-[-10%] h-[32rem] w-[32rem] rounded-full blur-3xl transition-colors duration-700"
        style={{ backgroundColor: `${primaryColor}33` }}
      />
      <div
        className="animate-drift-slow absolute top-[20%] right-[-15%] h-[36rem] w-[36rem] rounded-full blur-3xl transition-colors duration-700"
        style={{ backgroundColor: `${secondaryColor}33` }}
      />
      <div
        className="animate-drift absolute bottom-[-15%] left-[20%] h-[30rem] w-[30rem] rounded-full blur-3xl transition-colors duration-700"
        style={{ backgroundColor: `${primaryColor}1a` }}
      />

      {/* Baseline */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-border to-transparent" />
    </div>
  );
}
