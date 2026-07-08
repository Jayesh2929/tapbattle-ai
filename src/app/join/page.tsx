"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, QrCode, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getSocket } from "@/lib/socket";

// Matches the charset used by generateSessionCode() on the server -- no
// ambiguous characters like I, O, 0, 1.
const CODE_REGEX = /^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{6}$/;
const NAME_REGEX = /^[A-Za-z0-9 '-]{2,24}$/;

function validateCode(value: string): string | null {
  if (!value.trim()) return "Session ID is required.";
  if (value.trim().length !== 6) return "Session ID must be exactly 6 characters.";
  if (!CODE_REGEX.test(value.trim())) return "Session ID can only contain letters and numbers (no I, O, 0, 1).";
  return null;
}

function validateName(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return "Name is required.";
  if (trimmed.length < 2) return "Name must be at least 2 characters.";
  if (trimmed.length > 24) return "Name must be 24 characters or fewer.";
  if (!NAME_REGEX.test(trimmed)) return "Name can only contain letters, numbers, spaces, hyphens, and apostrophes.";
  return null;
}

function JoinForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [codeError, setCodeError] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const fromQuery = params.get("code");
    if (fromQuery) setCode(fromQuery.toUpperCase().slice(0, 6));
  }, [params]);

  // Listen for the server's "no session found" style errors, which are
  // emitted only to this socket in response to our own join attempt.
  useEffect(() => {
    const socket = getSocket();
    const onActivity = (message: string) => {
      if (message.toLowerCase().includes("no session found")) {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setJoining(false);
        setServerError(`No session found for code "${code.trim().toUpperCase()}". Double-check the code with your host.`);
      }
    };
    socket.on("activity:log", onActivity);
    return () => {
      socket.off("activity:log", onActivity);
    };
  }, [code]);

  function handleJoin(e: React.FormEvent) {
    e.preventDefault();

    const cErr = validateCode(code);
    const nErr = validateName(name);
    setCodeError(cErr);
    setNameError(nErr);
    setServerError(null);
    if (cErr || nErr) return;

    setJoining(true);
    const socket = getSocket();
    const trimmedCode = code.trim().toUpperCase();
    const trimmedName = name.trim();
    socket.emit("session:join", { code: trimmedCode, name: trimmedName });

    const onUpdate = () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      router.push(`/game/${trimmedCode}?name=${encodeURIComponent(trimmedName)}`);
    };
    socket.once("session:update", onUpdate);

    timeoutRef.current = setTimeout(() => {
      setJoining(false);
      setServerError("Couldn't reach the session in time. Check your connection and try again.");
    }, 5000);
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
              <form onSubmit={handleJoin} noValidate className="flex flex-col gap-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Session ID</label>
                  <Input
                    value={code}
                    onChange={(e) => {
                      setCode(e.target.value.toUpperCase().slice(0, 6));
                      if (codeError) setCodeError(null);
                      if (serverError) setServerError(null);
                    }}
                    placeholder="e.g. TB7K2Q"
                    maxLength={6}
                    aria-invalid={!!codeError}
                    className={`text-center font-mono text-lg tracking-[0.3em] ${
                      codeError ? "border-red-500/50 focus-visible:ring-red-500" : ""
                    }`}
                  />
                  {codeError && <p className="mt-1.5 text-xs text-red-400">{codeError}</p>}
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Your name</label>
                  <Input
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value.slice(0, 24));
                      if (nameError) setNameError(null);
                    }}
                    placeholder="Jayesh"
                    maxLength={24}
                    aria-invalid={!!nameError}
                    className={nameError ? "border-red-500/50 focus-visible:ring-red-500" : ""}
                  />
                  {nameError && <p className="mt-1.5 text-xs text-red-400">{nameError}</p>}
                </div>
                {serverError && (
                  <div className="rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2 text-sm text-red-300">
                    {serverError}
                  </div>
                )}
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
