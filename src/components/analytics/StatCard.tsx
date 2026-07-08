"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  sublabel?: string;
  tone?: "default" | "success" | "warning" | "danger";
  delay?: number;
}

const toneStyles: Record<NonNullable<StatCardProps["tone"]>, string> = {
  default: "from-violet-500/20 to-blue-500/20 text-violet-300",
  success: "from-emerald-500/20 to-teal-500/20 text-emerald-300",
  warning: "from-amber-500/20 to-orange-500/20 text-amber-300",
  danger: "from-red-500/20 to-rose-500/20 text-red-300",
};

export function StatCard({ icon: Icon, label, value, sublabel, tone = "default", delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <Card>
        <CardContent className="flex items-start justify-between p-5">
          <div>
            <p className="text-xs font-medium text-muted-foreground">{label}</p>
            <p className="mt-2 font-display text-2xl font-semibold tracking-tight">{value}</p>
            {sublabel && <p className="mt-1 text-xs text-muted-foreground">{sublabel}</p>}
          </div>
          <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br", toneStyles[tone])}>
            <Icon className="h-5 w-5" />
          </span>
        </CardContent>
      </Card>
    </motion.div>
  );
}
