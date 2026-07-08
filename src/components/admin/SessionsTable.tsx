"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export interface AdminSessionRow {
  code: string;
  host: string;
  players: number;
  status: "lobby" | "live" | "results";
  startedAgo: string;
}

const statusTone = {
  lobby: "outline",
  live: "success",
  results: "blue",
} as const;

export function SessionsTable({ sessions }: { sessions: AdminSessionRow[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Active sessions</CardTitle>
        <CardDescription>All TapBattle sessions currently tracked by the server</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/5 text-xs text-muted-foreground">
                <th className="pb-3 font-medium">Session</th>
                <th className="pb-3 font-medium">Host</th>
                <th className="pb-3 font-medium">Players</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Started</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((s, i) => (
                <motion.tr
                  key={s.code}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="border-b border-white/5 last:border-0"
                >
                  <td className="py-3 font-mono text-xs">{s.code}</td>
                  <td className="py-3 text-muted-foreground">{s.host}</td>
                  <td className="py-3">{s.players}</td>
                  <td className="py-3">
                    <Badge variant={statusTone[s.status]} className="capitalize">
                      {s.status}
                    </Badge>
                  </td>
                  <td className="py-3 text-xs text-muted-foreground">{s.startedAgo}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
