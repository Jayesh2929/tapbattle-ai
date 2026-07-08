"use client";

import { motion } from "framer-motion";
import { Users } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { formatMs } from "@/lib/utils";

export interface AdminPlayerRow {
  name: string;
  sessionCode: string;
  avgMs: number;
  roundsPlayed: number;
  joinedAgo: string;
  status: "connected" | "disconnected";
}

export function PlayersDialog({
  open,
  onOpenChange,
  players,
  sessionFilter,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  players: AdminPlayerRow[];
  sessionFilter: string | null;
}) {
  const filtered = sessionFilter ? players.filter((p) => p.sessionCode === sessionFilter) : players;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] overflow-y-auto scrollbar-thin">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-4 w-4 text-violet-400" />
            {sessionFilter ? `Players in ${sessionFilter}` : "All connected players"}
          </DialogTitle>
          <DialogDescription>
            {sessionFilter
              ? `Everyone who has joined session ${sessionFilter}`
              : `${filtered.length} players across all active sessions`}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2">
          {filtered.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">No players found.</p>
          ) : (
            filtered.map((p, i) => (
              <motion.div
                key={`${p.sessionCode}-${p.name}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3"
              >
                <span
                  className={`h-2 w-2 shrink-0 rounded-full ${
                    p.status === "connected" ? "bg-emerald-400" : "bg-white/20"
                  }`}
                />
                <div className="flex-1">
                  <p className="text-sm font-medium">{p.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {!sessionFilter && (
                      <>
                        <span className="font-mono">{p.sessionCode}</span> ·{" "}
                      </>
                    )}
                    joined {p.joinedAgo}
                  </p>
                </div>
                <div className="text-right text-xs text-muted-foreground">
                  {p.roundsPlayed > 0 ? (
                    <>
                      <p>{formatMs(p.avgMs)} avg</p>
                      <p>{p.roundsPlayed} rounds</p>
                    </>
                  ) : (
                    <p>Not started</p>
                  )}
                </div>
                <Badge variant={p.status === "connected" ? "success" : "outline"} className="capitalize">
                  {p.status}
                </Badge>
              </motion.div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
