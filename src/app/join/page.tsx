"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, QrCode, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getSocket } from "@/lib/socket";

function JoinForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    const fromQuery = params.get("code");
    if (fromQuery) setCode(fromQuery.toUpperCase());
  }, [params]);

  function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim() || !name.trim()) {
      setError("Enter both a session code and your name.");
      return;
    }
    setError(null);
    setJoining(true);
    const socket = getSocket();
    socket.emit("session:join", { code: code.trim().toUpperCase(), name: name.trim() });

    const onUpdate = () => {
      router.push(`/game/${code.trim().toUpperCase()}?name=${encodeURIComponent(name.trim())}`);
    };
    socket.once("session:update", onUpdate);

    setTimeout(() => {
      setJoining(false);
    }, 4000);
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-8 flex items-center gap-2 text-sm text-muted-foreground hover:text-white">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <Card>
            <CardHeader className="items-center text-center">
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/20 to-blue-500/20">
                <QrCode className="h-6 w-6 text-violet-300" />
              </div>
              <CardTitle className="text-xl">Join a session</CardTitle>
              <CardDescription>Scan a host's QR code, or enter the session ID below.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleJoin} className="flex flex-col gap-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Session ID</label>
                  <Input
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="e.g. TB7K2Q"
                    maxLength={6}
                    className="text-center font-mono text-lg tracking-[0.3em]"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Your name</label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jayesh"
                    maxLength={24}
                  />
                </div>
                {error && <p className="text-sm text-red-400">{error}</p>}
                <Button type="submit" size="lg" disabled={joining} className="mt-2">
                  <Zap className="h-4 w-4" />
                  {joining ? "Joining…" : "Join game"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Scanning a QR code opens this page with the session ID already filled in.
        </p>
      </div>
    </main>
  );
}

export default function JoinPage() {
  return (
    <Suspense fallback={null}>
      <JoinForm />
    </Suspense>
  );
}
