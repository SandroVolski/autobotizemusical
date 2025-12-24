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
      <Card variant="interactive" className="overflow-hidden h-full">
        <CardContent className="p-6 h-full flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <p className="text-3xl font-bold">{value}</p>
              
              {trend && (
                <div className="flex items-center gap-1">
                  {trend.isPositive ? (
                    <TrendingUp className="w-4 h-4 text-success" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-destructive" />
                  )}
                  <span className={cn(
                    "text-sm font-medium",
                    trend.isPositive ? "text-success" : "text-destructive"
                  )}>
                    {trend.isPositive ? "+" : ""}{trend.value}%
                  </span>
                  <span className="text-xs text-muted-foreground">vs mês anterior</span>
                </div>
              )}
              
              {description && (
                <p className="text-xs text-muted-foreground">{description}</p>
              )}
            </div>

            <div className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center",
              variant === "primary" && "bg-primary/20",
              variant === "secondary" && "bg-secondary/20",
              variant === "default" && "bg-muted"
            )}>
              <Icon className={cn(
                "w-6 h-6",
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
