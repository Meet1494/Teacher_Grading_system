import { cn } from "@/lib/utils";

interface ProgressDisplayProps {
  value: number;
  max: number;
  label?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  color?: "default" | "primary" | "success" | "warning" | "error";
  showPercentage?: boolean;
}

export function ProgressDisplay({
  value,
  max,
  label,
  className,
  size = "md",
  color = "default",
  showPercentage = true,
}: ProgressDisplayProps) {
  const percentage = Math.round((value / max) * 100);

  const sizeClasses = {
    sm: "h-1",
    md: "h-2",
    lg: "h-3",
  };

  const colorClasses = {
    default: "bg-blue-500",
    primary: "bg-primary",
    success: "bg-green-500",
    warning: "bg-amber-500",
    error: "bg-red-500",
  };

  return (
    <div className={className}>
      {label && (
        <div className="flex mb-1 items-center justify-between">
          <div className="text-xs font-medium text-neutral-700">{label}</div>
          {showPercentage && (
            <div className="text-xs font-medium text-neutral-700">{percentage}%</div>
          )}
        </div>
      )}
      <div className={cn("w-full bg-neutral-200 rounded-full overflow-hidden", sizeClasses[size])}>
        <div
          className={cn("transition-all duration-300 ease-in-out", colorClasses[color])}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
