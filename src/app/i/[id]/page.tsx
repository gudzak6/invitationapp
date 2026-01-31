"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { GameType, Invite } from "@/lib/types";
import { buildIcsFile } from "@/lib/ics";
import { gameRegistry, GameResult } from "@/games/registry";
import GameShell from "@/components/GameShell";
import InviteCard from "@/components/InviteCard";

type InviteResponse = {
  invite: Invite | null;
};

export default function RecipientPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const token = searchParams.get("t");
  const [invite, setInvite] = useState<Invite | null>(null);
  const [loading, setLoading] = useState(true);
  const [unlocked, setUnlocked] = useState(false);
  const [envError, setEnvError] = useState("");
  const [gameResult, setGameResult] = useState<GameResult | null>(null);
  const [rsvpStatus, setRsvpStatus] = useState<"going" | "cant_go" | null>(
    null
  );
  const [rsvpCounts, setRsvpCounts] = useState({
    going: 0,
    cantGo: 0
  });
  const [rsvpLoading, setRsvpLoading] = useState(false);
  const [rsvpError, setRsvpError] = useState("");
  const [rsvpName, setRsvpName] = useState("");

  useEffect(() => {
    const loadInvite = async () => {
      setLoading(true);
      if (token) {
        const response = await fetch(
          `/api/invite-preview?id=${params.id}&token=${token}`
        );
        const data = (await response.json()) as InviteResponse;
        setInvite(data.invite ?? null);
        setLoading(false);
        return;
      }

      const supabase = getSupabaseClient();
      if (!supabase) {
        setEnvError("Missing Supabase env vars. Check env.example.");
        setInvite(null);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("invites")
        .select(
          "id,title,date,time,location,message,game_type,game_config,published,created_at"
        )
        .eq("id", params.id)
        .eq("published", true)
        .single();

      if (error) {
        setInvite(null);
      } else {
        setInvite(data as Invite);
      }
      setLoading(false);
    };

    if (params.id) loadInvite();
  }, [params.id, token]);

  const handleDownload = () => {
    if (!invite) return;
    const blob = buildIcsFile(invite);
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "catch-invite.ics";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const gameType = (invite?.game_type as GameType) ?? "fishing";
  const gameEntry = gameRegistry[gameType] ?? gameRegistry.fishing;
  const inviteKey = invite?.id ?? params.id;

  useEffect(() => {
    if (!inviteKey) return;
    try {
      const raw =
        typeof window !== "undefined"
          ? localStorage.getItem(`catch_result_${inviteKey}`)
          : null;
      if (!raw) return;
      setGameResult(JSON.parse(raw) as GameResult);
    } catch (error) {
      setGameResult(null);
    }
  }, [inviteKey]);

  useEffect(() => {
    if (!invite?.id) return;
    try {
      const raw =
        typeof window !== "undefined"
          ? localStorage.getItem(`reveal_rsvp_${invite.id}`)
          : null;
      if (raw === "going" || raw === "cant_go") {
        setRsvpStatus(raw);
      }
    } catch (error) {
      setRsvpStatus(null);
    }
  }, [invite?.id]);

  useEffect(() => {
    if (!invite?.id) return;
    try {
      const raw =
        typeof window !== "undefined"
          ? localStorage.getItem(`reveal_rsvp_name_${invite.id}`)
          : null;
      if (raw) {
        setRsvpName(raw);
      }
    } catch (error) {
      setRsvpName("");
    }
  }, [invite?.id]);

  useEffect(() => {
    const loadRsvps = async () => {
      if (!invite?.id) return;
      const supabase = getSupabaseClient();
      if (!supabase) return;
      const [
        { count: goingCount, error: goingError },
        { count: cantGoCount, error: cantGoError }
      ] = await Promise.all([
        supabase
          .from("rsvps")
          .select("id", { count: "exact", head: true })
          .eq("invite_id", invite.id)
          .eq("status", "going"),
        supabase
          .from("rsvps")
          .select("id", { count: "exact", head: true })
          .eq("invite_id", invite.id)
          .eq("status", "cant_go")
      ]);
      if (goingError?.code === "PGRST205" || cantGoError?.code === "PGRST205") {
        setRsvpError("RSVPs aren't set up yet. Run the SQL in docs/supabase.md.");
        return;
      }
      setRsvpCounts({
        going: goingCount ?? 0,
        cantGo: cantGoCount ?? 0
      });
    };
    loadRsvps();
  }, [invite?.id]);

  const instruction = useMemo(() => {
    if (!invite) return "";
    return `Complete the ${gameEntry.displayName.toLowerCase()} game to reveal the invite.`;
  }, [invite, gameEntry.displayName]);

  const submitRsvp = async (status: "going" | "cant_go") => {
    if (!invite?.id) return;
    const trimmedName = rsvpName.trim();
    if (!trimmedName) {
      setRsvpError("Please enter your name.");
      return;
    }
    const supabase = getSupabaseClient();
    if (!supabase) {
      setRsvpError("Missing Supabase env vars. Check env.example.");
      return;
    }
    setRsvpLoading(true);
    setRsvpError("");
    const { error } = await supabase.from("rsvps").insert({
      invite_id: invite.id,
      status,
      name: trimmedName
    });
    if (error) {
      if (error.code === "PGRST205") {
        setRsvpError("RSVPs aren't set up yet. Run the SQL in docs/supabase.md.");
      } else {
        setRsvpError("Unable to save your response.");
      }
      setRsvpLoading(false);
      return;
    }
    setRsvpStatus(status);
    setRsvpCounts((prev) => ({
      going: prev.going + (status === "going" ? 1 : 0),
      cantGo: prev.cantGo + (status === "cant_go" ? 1 : 0)
    }));
    try {
      localStorage.setItem(`reveal_rsvp_${invite.id}`, status);
      localStorage.setItem(`reveal_rsvp_name_${invite.id}`, trimmedName);
    } catch (error) {
      // Ignore storage failures.
    }
    setRsvpLoading(false);
  };

  const header = (
    <header className="container-base flex items-center justify-between py-7">
      <span className="text-xl font-semibold uppercase tracking-[0.4em] text-ink-700">
        Reveal
      </span>
      <a
        href="/"
        className="text-xs uppercase tracking-[0.2em] text-ink-600"
      >
        Back to home
      </a>
    </header>
  );

  if (loading) {
    return (
      <main className="flex min-h-screen flex-col bg-sand-50">
        {header}
        <div className="container-base flex flex-1 items-center justify-center text-sm text-ink-600">
          Loading invite...
        </div>
      </main>
    );
  }

  if (!invite) {
    return (
      <main className="flex min-h-screen flex-col bg-sand-50">
        {header}
        <div className="container-base flex flex-1 flex-col items-center justify-center gap-4 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-ink-600">
            Locked
          </p>
          <h1 className="text-3xl font-semibold text-ink-900">
            This invite isn&apos;t unlocked yet.
          </h1>
          <p className="text-sm text-ink-700">
            {envError
              ? envError
              : "Ask the host to publish it first."}
          </p>
          <a
            href="/create"
            className="rounded-full border border-ink-900/15 px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-ink-900"
          >
            Make your own invite
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col bg-sand-50">
      {header}
      <div className="container-base flex flex-1 flex-col items-center justify-center py-12">
        <AnimatePresence mode="wait">
          {!unlocked ? (
            <motion.div
              key="game"
              className="flex w-full max-w-md flex-col items-center gap-6"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
            >
              <GameShell title="unlock your invite">
                <p className="text-center text-sm text-ink-600">
                  {instruction}
                </p>
                <gameEntry.Component
                  config={invite.game_config ?? {}}
                  onWin={(result) => {
                    if (result && inviteKey) {
                      try {
                        // Stored per-device; can be upgraded to Supabase later.
                        localStorage.setItem(
                          `catch_result_${inviteKey}`,
                          JSON.stringify(result)
                        );
                        setGameResult(result);
                      } catch (error) {
                        setGameResult(result);
                      }
                    }
                    setUnlocked(true);
                  }}
                />
              </GameShell>
            </motion.div>
          ) : (
            <motion.div
              key="invite"
              className="flex w-full flex-col items-center gap-6"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              {gameResult && gameResult.game === "split-the-g" && (
                <div className="glass-panel w-full max-w-md px-6 py-4 text-left">
                  <p className="text-xs uppercase tracking-[0.3em] text-ink-600">
                    Your Pour Result
                  </p>
                  <div className="mt-3 flex items-center gap-4">
                    <div className="relative h-16 w-10">
                      <Image
                        src="/stout-pint-glass.png"
                        alt="Pint glass"
                        fill
                        className="object-contain"
                      />
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-ink-900">
                        {gameResult.label} — {gameResult.meta?.grade ?? "Close"}
                      </div>
                      <p className="mt-1 text-sm text-ink-700">
                        {gameResult.meta?.grade === "Perfect"
                          ? "Nailed it."
                          : `Missed by ${gameResult.meta?.errorPct ?? 0}% (${gameResult.meta?.underOver ?? "over"})`}
                      </p>
                      {gameResult.createdAtISO && (
                        <p className="mt-2 text-xs text-ink-500">
                          {new Date(gameResult.createdAtISO).toLocaleTimeString(
                            "en-US",
                            {
                              hour: "numeric",
                              minute: "2-digit"
                            }
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
              <InviteCard invite={invite} onDownloadCalendar={handleDownload} />
              <div className="glass-panel w-full max-w-md px-6 py-6 text-center">
                <p className="text-xs uppercase tracking-[0.3em] text-ink-600">
                  Can you make it?
                </p>
                <input
                  type="text"
                  value={rsvpName}
                  onChange={(event) => setRsvpName(event.target.value)}
                  disabled={rsvpLoading}
                  placeholder="Your name"
                  className="mt-4 w-full rounded-full border border-ink-900/15 bg-white px-4 py-2 text-sm text-ink-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-ink-900/20 disabled:cursor-not-allowed disabled:opacity-60"
                />
                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-center">
                  <button
                    type="button"
                    onClick={() => submitRsvp("going")}
                    disabled={rsvpLoading || rsvpStatus === "going"}
                    className="rounded-full border border-ink-900/15 px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-ink-900 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {rsvpStatus === "going" ? "You're going" : "I'm going"}
                  </button>
                  <button
                    type="button"
                    onClick={() => submitRsvp("cant_go")}
                    disabled={rsvpLoading || rsvpStatus === "cant_go"}
                    className="rounded-full border border-ink-900/15 px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-ink-900 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {rsvpStatus === "cant_go" ? "Can't go" : "Can't go"}
                  </button>
                </div>
                {rsvpError && (
                  <p className="mt-3 text-xs text-red-600">{rsvpError}</p>
                )}
                {(rsvpCounts.going > 0 || rsvpCounts.cantGo > 0) && (
                  <p className="mt-4 text-xs text-ink-600">
                    {rsvpCounts.going > 0
                      ? `${rsvpCounts.going} ${
                          rsvpCounts.going === 1 ? "person is" : "people are"
                        } going`
                      : "No one has responded yet"}
                    {rsvpCounts.cantGo > 0
                      ? ` • ${rsvpCounts.cantGo} ${
                          rsvpCounts.cantGo === 1
                            ? "can't make it"
                            : "can't make it"
                        }`
                      : ""}
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
