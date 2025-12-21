"use client";

import { cn } from "@/lib/utils";

interface ScoreInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
}

export function ScoreInput({ label, value, onChange }: ScoreInputProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-sm text-gray-500">{value}점</span>
      </div>
      <div className="flex gap-1">
        {Array.from({ length: 10 }, (_, i) => i + 1).map((score) => (
          <button
            key={score}
            type="button"
            onClick={() => onChange(score)}
            className={cn(
              "flex-1 h-8 rounded text-sm font-medium transition-colors",
              score <= value
                ? "bg-blue-500 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            )}
          >
            {score}
          </button>
        ))}
      </div>
    </div>
  );
}
