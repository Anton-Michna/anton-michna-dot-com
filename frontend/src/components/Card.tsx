import type { ReactNode } from "react";

interface CardProps {
  title: string;
  description: string;
  accentColor?: string;
  accentHex?: string;
  children: ReactNode;
}

export function Card({
  title,
  description,
  accentColor = "bg-signal",
  accentHex,
  children,
}: CardProps) {
  return (
    <div className="sb-panel overflow-hidden p-0">
      <div
        className={accentHex ? "h-[3px] w-full" : `h-[3px] w-full ${accentColor}`}
        style={accentHex ? { backgroundColor: accentHex } : undefined}
      />
      <div className="p-6 md:p-8">
        <h2 className="font-display text-2xl font-bold tracking-wide text-ink uppercase md:text-3xl">
          {title}
        </h2>
        <p className="mt-2 text-ink/60">{description}</p>
        <div className="relative z-0 mt-6">{children}</div>
      </div>
    </div>
  );
}
