"use client";

import { QRCodeSVG } from "qrcode.react";
import { motion } from "framer-motion";
import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export function QRDisplay({ code, joinUrl }: { code: string; joinUrl: string }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>Scan to join</CardTitle>
        <CardDescription>Players can scan this code or enter the session ID manually.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="gradient-border rounded-2xl bg-white p-4"
        >
          <QRCodeSVG value={joinUrl} size={200} fgColor="#0a0a12" bgColor="#ffffff" level="M" />
        </motion.div>

        <button
          onClick={handleCopy}
          className="group flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3 transition-colors hover:bg-white/[0.07]"
        >
          <span className="font-mono text-2xl font-semibold tracking-[0.3em] gradient-text">{code}</span>
          {copied ? (
            <Check className="h-4 w-4 text-emerald-400" />
          ) : (
            <Copy className="h-4 w-4 text-muted-foreground group-hover:text-white" />
          )}
        </button>
      </CardContent>
    </Card>
  );
}
