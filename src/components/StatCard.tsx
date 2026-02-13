import { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string;
  change?: string;
  changeType?: "up" | "down" | "neutral";
  icon: LucideIcon;
}

export default function StatCard({ label, value, change, changeType = "neutral", icon: Icon }: StatCardProps) {
  return (
    <div className="glass-card rounded-lg p-4 animate-slide-up">
      <div className="flex items-center justify-between mb-3">
        <span className="stat-label">{label}</span>
        <div className="h-8 w-8 rounded-md bg-accent flex items-center justify-center">
          <Icon className="h-4 w-4 text-accent-foreground" />
        </div>
      </div>
      <div className="stat-value">{value}</div>
      {change && (
        <span
          className={`text-xs font-medium mt-1 inline-block ${
            changeType === "up"
              ? "text-chart-up"
              : changeType === "down"
              ? "text-chart-down"
              : "text-muted-foreground"
          }`}
        >
          {change}
        </span>
      )}
    </div>
  );
}
