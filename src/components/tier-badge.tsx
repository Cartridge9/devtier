import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Tier = "SSS" | "S" | "A" | "B" | "C" | "D";

const tierConfig: Record<Tier, { color: string; bg: string }> = {
  SSS: { color: "text-amber-900", bg: "bg-gradient-to-r from-amber-300 to-yellow-400" },
  S: { color: "text-purple-900", bg: "bg-gradient-to-r from-purple-300 to-purple-400" },
  A: { color: "text-blue-900", bg: "bg-gradient-to-r from-blue-300 to-blue-400" },
  B: { color: "text-green-900", bg: "bg-gradient-to-r from-green-300 to-green-400" },
  C: { color: "text-orange-900", bg: "bg-gradient-to-r from-orange-300 to-orange-400" },
  D: { color: "text-gray-900", bg: "bg-gradient-to-r from-gray-300 to-gray-400" },
};

export function getTierFromScore(score: number): Tier {
  if (score >= 9.5) return "SSS";
  if (score >= 8.5) return "S";
  if (score >= 7.0) return "A";
  if (score >= 5.5) return "B";
  if (score >= 4.0) return "C";
  return "D";
}

interface TierBadgeProps {
  score: number;
  size?: "sm" | "md" | "lg";
}

export function TierBadge({ score, size = "md" }: TierBadgeProps) {
  const tier = getTierFromScore(score);
  const config = tierConfig[tier];

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-3 py-1",
    lg: "text-lg px-4 py-2 font-bold",
  };

  return (
    <Badge
      className={cn(
        config.bg,
        config.color,
        sizeClasses[size],
        "border-0 shadow-sm"
      )}
    >
      {tier}
    </Badge>
  );
}
