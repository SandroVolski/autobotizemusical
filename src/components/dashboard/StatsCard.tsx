import { ReactNode } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  description?: string;
  variant?: "default" | "primary" | "secondary";
  delay?: number;
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  description,
  variant = "default",
  delay = 0,
}: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <Card variant="interactive" className="overflow-hidden h-full min-h-[120px]">
        <CardContent className="p-3 lg:p-6 h-full flex flex-col justify-between">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1 lg:space-y-2 flex-1 min-w-0">
              <p className="text-xs lg:text-sm font-medium text-muted-foreground truncate">{title}</p>
              <p className="text-xl lg:text-3xl font-bold truncate">{value}</p>
              
              {trend && (
                <div className="flex items-center gap-1 flex-wrap">
                  {trend.isPositive ? (
                    <TrendingUp className="w-3 h-3 lg:w-4 lg:h-4 text-success" />
                  ) : (
                    <TrendingDown className="w-3 h-3 lg:w-4 lg:h-4 text-destructive" />
                  )}
                  <span className={cn(
                    "text-xs lg:text-sm font-medium",
                    trend.isPositive ? "text-success" : "text-destructive"
                  )}>
                    {trend.isPositive ? "+" : ""}{trend.value}%
                  </span>
                  <span className="text-[10px] lg:text-xs text-muted-foreground hidden sm:inline">vs mês anterior</span>
                </div>
              )}
              
              {description && (
                <p className="text-[10px] lg:text-xs text-muted-foreground truncate">{description}</p>
              )}
            </div>

            <div className={cn(
              "w-8 h-8 lg:w-12 lg:h-12 rounded-lg lg:rounded-xl flex items-center justify-center flex-shrink-0",
              variant === "primary" && "bg-primary/20",
              variant === "secondary" && "bg-secondary/20",
              variant === "default" && "bg-muted"
            )}>
              <Icon className={cn(
                "w-4 h-4 lg:w-6 lg:h-6",
                variant === "primary" && "text-primary",
                variant === "secondary" && "text-secondary",
                variant === "default" && "text-muted-foreground"
              )} />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
