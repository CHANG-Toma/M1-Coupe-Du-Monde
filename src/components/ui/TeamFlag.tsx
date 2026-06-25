import Image from "next/image";
import type { Equipe } from "@/lib/types";

interface TeamFlagProps {
  equipe: Equipe;
  size?: "sm" | "md" | "lg";
  showName?: boolean;
  align?: "left" | "right" | "center";
}

const SIZES = {
  sm: { flag: 20, text: "text-xs" },
  md: { flag: 28, text: "text-sm" },
  lg: { flag: 40, text: "text-base font-semibold" },
};

export default function TeamFlag({
  equipe,
  size = "md",
  showName = true,
  align = "left",
}: TeamFlagProps) {
  const { flag, text } = SIZES[size];
  const flagUrl = equipe.logoUrl || `https://flagcdn.com/${equipe.codePays.toLowerCase()}.svg`;

  const alignClass = {
    left: "flex-row",
    right: "flex-row-reverse",
    center: "flex-col items-center",
  }[align];

  return (
    <div className={`flex ${alignClass} items-center gap-2`}>
      <div
        className="shrink-0 rounded overflow-hidden shadow-sm border border-white/20"
        style={{ width: flag, height: flag * 0.67 }}
      >
        <Image
          src={flagUrl}
          alt={`Drapeau ${equipe.nom}`}
          width={flag}
          height={Math.round(flag * 0.67)}
          className="object-cover w-full h-full"
          unoptimized
        />
      </div>
      {showName && (
        <span className={`${text} text-gray-800 dark:text-gray-100 truncate`}>
          {equipe.nom}
        </span>
      )}
    </div>
  );
}
