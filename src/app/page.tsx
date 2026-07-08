import Link from "next/link";
import { Zap } from "lucide-react";
import { Hero } from "@/components/landing/Hero";
import { FeatureCards } from "@/components/landing/FeatureCards";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <main className="relative min-h-screen">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Link href="/" className="flex items-center gap-2 font-display text-lg font-semibold tracking-tight">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-blue-500">
            <Zap className="h-4 w-4 text-white" />
          </span>
          TapBattle <span className="gradient-text">AI</span>
        </Link>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin">Admin</Link>
          </Button>
          <Button variant="secondary" size="sm" asChild>
            <Link href="/join">Join game</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/host">Host game</Link>
          </Button>
        </div>
      </nav>

      <Hero />
      <FeatureCards />

      <footer className="border-t border-white/5 px-6 py-10 text-center text-xs text-muted-foreground">
        TapBattle AI — a real-time multiplayer reaction game with AI-driven performance analytics.
      </footer>
    </main>
  );
}
