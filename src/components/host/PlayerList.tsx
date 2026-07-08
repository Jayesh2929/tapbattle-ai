"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { colorForIndex } from "@/lib/utils";
import type { Player } from "@/types";

export function PlayerList({ players }: { players: Player[] }) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-4 w-4 text-violet-400" />
            Connected players
          </CardTitle>
          <CardDescription>Waiting in the lobby</CardDescription>
        </div>
        <Badge variant="blue">{players.length} joined</Badge>
      </CardHeader>
      <CardContent>
        {players.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-white/10 py-10 text-center">
            <p className="text-sm text-muted-foreground">No players yet — share the QR code to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <AnimatePresence initial={false}>
              {players.map((p) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, scale: 0.85, y: 8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5"
                >
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-xs font-semibold text-white ${colorForIndex(
                      p.avatarIndex
                    )}`}
                  >
                    {p.name.slice(0, 1).toUpperCase()}
                  </span>
                  <span className="truncate text-sm">{p.name}</span>
                  <span
                    className={`ml-auto h-2 w-2 shrink-0 rounded-full ${
                      p.connected ? "bg-emerald-400" : "bg-white/20"
                    }`}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
