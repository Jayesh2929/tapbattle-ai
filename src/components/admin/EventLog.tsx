"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export interface AdminLogRow {
  level: "info" | "warn" | "error";
  message: string;
  time: string;
}

const levelTone = { info: "outline", warn: "warning", error: "destructive" } as const;

export function EventLog({ logs }: { logs: AdminLogRow[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Event logs</CardTitle>
        <CardDescription>Server-wide events across all sessions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="scrollbar-thin flex max-h-80 flex-col gap-2 overflow-y-auto">
          {logs.map((log, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className="flex items-start gap-3 rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2 text-xs"
            >
              <Badge variant={levelTone[log.level]} className="mt-0.5 shrink-0 uppercase">
                {log.level}
              </Badge>
              <span className="flex-1 text-muted-foreground">{log.message}</span>
              <span className="shrink-0 text-muted-foreground/60">{log.time}</span>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
