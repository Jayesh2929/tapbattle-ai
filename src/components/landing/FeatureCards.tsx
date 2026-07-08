"use client";

import { motion } from "framer-motion";
import { Activity, Brain, QrCode, TrendingUp, Users, Gauge } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const features = [
  {
    icon: QrCode,
    title: "QR-code onboarding",
    description: "Players scan a code or enter a 6-character session ID to join instantly — no accounts, no app.",
  },
  {
    icon: Gauge,
    title: "Randomized signal timing",
    description: "Every round waits a random interval before the tap signal, eliminating anticipation and false starts.",
  },
  {
    icon: Users,
    title: "Real-time multiplayer",
    description: "Socket.io keeps every player, host, and leaderboard perfectly in sync across the session.",
  },
  {
    icon: Brain,
    title: "AI performance scoring",
    description: "Consistency score, fatigue detection, and trend prediction computed from every tap.",
  },
  {
    icon: TrendingUp,
    title: "Personalized insights",
    description: "Each player gets tailored improvement suggestions based on their own reaction pattern.",
  },
  {
    icon: Activity,
    title: "Live activity feed",
    description: "Hosts watch joins, taps, and round transitions stream in as they happen.",
  },
];

export function FeatureCards() {
  return (
    <section className="px-6 pb-28">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <h2 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
            Everything a live session needs
          </h2>
          <p className="mt-3 text-muted-foreground">
            From the first scan to the final analytics report.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.06 }}
            >
              <Card className="h-full">
                <CardHeader>
                  <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/20 to-blue-500/20 text-violet-300">
                    <f.icon className="h-5 w-5" />
                  </div>
                  <CardTitle>{f.title}</CardTitle>
                  <CardDescription>{f.description}</CardDescription>
                </CardHeader>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
