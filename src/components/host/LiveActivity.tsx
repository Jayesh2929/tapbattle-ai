"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Radio } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export function LiveActivity({ logs }: { logs: string[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Radio className="h-4 w-4 text-emerald-400" />
          Live activity
        </CardTitle>
        <CardDescription>Real-time events from this session</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="scrollbar-thin flex max-h-56 flex-col-reverse gap-2 overflow-y-auto">
          <AnimatePresence initial={false}>
            {logs.length === 0 && (
              <p className="text-sm text-muted-foreground">Activity will appear here once players join.</p>
            )}
            {[...logs].reverse().map((log, i) => (
              <motion.div
                key={`${log}-${logs.length - i}`}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25 }}
                className="flex items-center gap-2 rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2 text-xs text-muted-foreground"
              >
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-violet-400" />
                {log}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
}
