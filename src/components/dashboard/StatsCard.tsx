import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: { value: number; label: string };
  variant?: "default" | "primary" | "gold" | "warning" | "danger";
  className?: string;
}

export function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = "default",
  className,
}: StatsCardProps) {
  const variantStyles = {
    default: {
      card: "bg-card border border-border shadow-sm hover:shadow",
      icon: "bg-primary/10 text-primary",
      trend: trend?.value && trend.value >= 0 ? "text-primary" : "text-destructive",
    },
    primary: {
      card: "gradient-primary text-primary-foreground shadow-emerald border-0",
      icon: "bg-white/20 text-white",
      trend: "text-white/80",
    },
    gold: {
      card: "gradient-gold text-gold-foreground shadow-gold border-0",
      icon: "bg-white/20 text-gold-foreground",
      trend: "text-gold-foreground/80",
    },
    warning: {
      card: "bg-orange-500/10 border border-orange-500/20 shadow-sm hover:shadow",
      icon: "bg-orange-500/15 text-orange-600",
      trend: "text-orange-600",
    },
    danger: {
      card: "bg-destructive/10 border border-destructive/20 shadow-sm hover:shadow",
      icon: "bg-destructive/15 text-destructive",
      trend: "text-destructive",
    },
  };

  const styles = variantStyles[variant];

  return (
    <div
      className={cn(
        "rounded-xl p-5 transition-smooth cursor-default animate-fade-in",
        styles.card,
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p
            className={cn(
              "text-xs font-medium uppercase tracking-wider mb-1.5",
              variant === "primary" || variant === "gold"
                ? "text-current opacity-80"
                : "text-muted-foreground"
            )}
          >
            {title}
          </p>
          <p
            className={cn(
              "text-2xl font-bold tracking-tight truncate",
              variant === "primary" || variant === "gold"
                ? "text-current"
                : "text-foreground"
            )}
          >
            {value}
          </p>
          {subtitle && (
            <p
              className={cn(
                "text-xs mt-1 truncate",
                variant === "primary" || variant === "gold"
                  ? "text-current opacity-70"
                  : "text-muted-foreground"
              )}
            >
              {subtitle}
            </p>
          )}
          {trend && (
            <div className={cn("flex items-center gap-1 mt-2 text-xs font-medium", styles.trend)}>
              <span>{trend.value >= 0 ? "↑" : "↓"} {Math.abs(trend.value)}%</span>
              <span className="opacity-70">{trend.label}</span>
            </div>
          )}
        </div>
        <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0", styles.icon)}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
