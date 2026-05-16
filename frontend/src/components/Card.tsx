import type { ReactNode } from "react";

interface CardProps {
  title: string;
  description: string;
  accentColor?: string;
  children: ReactNode;
}

export function Card({
  title,
  description,
  accentColor = "bg-blue-400",
  children,
}: CardProps) {
  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20">
      <div className="flex items-center mb-6">
        <div className={`w-1 h-8 ${accentColor} rounded-full mr-4`}></div>
        <h2 className="text-3xl font-bold text-white">{title}</h2>
      </div>
      <p className="text-blue-100 mb-6">{description}</p>
      <div className="relative z-0">{children}</div>
    </div>
  );
}
