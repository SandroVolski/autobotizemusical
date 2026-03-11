import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { PaymentStatusColor } from "@/hooks/usePaymentStatus";

interface PaymentStatusDotProps {
  color: PaymentStatusColor;
  label: string;
  size?: "sm" | "md";
  className?: string;
}

const colorClasses: Record<PaymentStatusColor, string> = {
  green: "bg-success border-success/50",
  yellow: "bg-warning border-warning/50",
  red: "bg-destructive border-destructive/50 animate-pulse",
  gray: "bg-muted-foreground/40 border-muted-foreground/20",
};

const sizeClasses = {
  sm: "w-3 h-3",
  md: "w-3.5 h-3.5",
};

export function PaymentStatusDot({ color, label, size = "sm", className }: PaymentStatusDotProps) {
  if (color === "gray") return null;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={cn(
              "rounded-full border-2 block flex-shrink-0",
              colorClasses[color],
              sizeClasses[size],
              className
            )}
          />
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs">
          {label}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
