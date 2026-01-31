"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { gameRegistry } from "@/games/registry";
import { GameType, Invite } from "@/lib/types";
import { getSupabaseClient } from "@/lib/supabaseClient";
import DateTimeSlotPicker, {
  SlotSelection
} from "@/components/DateTimeSlotPicker";

const generateToken = () => {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
};

export default function CreateInvitePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");
  const editToken = searchParams.get("token");
  const isEditing = Boolean(editId && editToken);
  const [formState, setFormState] = useState({
    title: "",
    date: "",
    time: "",
    location: "",
    message: ""
  });
  const [gameType, setGameType] = useState<GameType>("fishing");
  const [loading, setLoading] = useState(false);
  const [loadingInvite, setLoadingInvite] = useState(false);
  const [error, setError] = useState("");
  const [selectedSlot, setSelectedSlot] = useState<SlotSelection | null>(null);

  const gameOptions = useMemo(
    () =>
      (Object.keys(gameRegistry) as GameType[]).map((key) => ({
        key,
        ...gameRegistry[key]
      })),
    []
  );

  const updateField = (field: keyof typeof formState, value: string) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const handleSlotSelect = useCallback((value: SlotSelection) => {
    setSelectedSlot(value);
  }, []);

  const buildSlotLabel = (date: string, time: string) => {
    const dt = new Date(`${date}T${time}`);
    if (Number.isNaN(dt.getTime())) return `${date} ${time}`;
    const dateLabel = dt.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
    const timeLabel = dt
      .toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
      .replace(" ", "");
    return `${dateLabel} ${timeLabel}`;
  };

  useEffect(() => {
    if (!isEditing || !editId || !editToken) return;
    const loadInvite = async () => {
      setLoadingInvite(true);
      setError("");
      try {
        const response = await fetch(
          `/api/invite-preview?id=${editId}&token=${editToken}`
        );
        const data = (await response.json()) as { invite: Invite | null };
        if (!data.invite) {
          setError("Unable to load this invite for editing.");
          setLoadingInvite(false);
          return;
        }
        setFormState({
          title: data.invite.title ?? "",
          date: data.invite.date ?? "",
          time: data.invite.time ?? "",
          location: data.invite.location ?? "",
          message: data.invite.message ?? ""
        });
        setGameType((data.invite.game_type as GameType) ?? "fishing");
        const initialSlot = {
          date: data.invite.date,
          time: data.invite.time,
          label: buildSlotLabel(data.invite.date, data.invite.time)
        };
        setSelectedSlot(initialSlot);
      } catch (loadError) {
        setError("Unable to load this invite for editing.");
      } finally {
        setLoadingInvite(false);
      }
    };
    loadInvite();
  }, [editId, editToken, isEditing]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    const supabase = getSupabaseClient();
    if (!supabase) {
      setError("Missing Supabase env vars. Check env.example.");
      setLoading(false);
      return;
    }
    if (!selectedSlot) {
      setError("Select a date and time.");
      setLoading(false);
      return;
    }
    const gameConfig = gameRegistry[gameType].defaultConfig;

    if (isEditing && editId && editToken) {
      const { data, error: updateError } = await supabase
        .from("invites")
        .update({
          ...formState,
          message: formState.message || null,
          date: selectedSlot.date,
          time: selectedSlot.time,
          game_type: gameType,
          game_config: gameConfig
        })
        .eq("id", editId)
        .eq("creator_token", editToken)
        .select("id")
        .single();

      setLoading(false);

      if (updateError || !data?.id) {
        setError("Something went wrong updating the invite.");
        return;
      }

      router.push(`/created/${editId}?token=${editToken}`);
      return;
    }

    const creatorToken = generateToken();
    const { data, error: insertError } = await supabase
      .from("invites")
      .insert({
        ...formState,
        message: formState.message || null,
        date: selectedSlot.date,
        time: selectedSlot.time,
        game_type: gameType,
        game_config: gameConfig,
        published: false,
        creator_token: creatorToken
      })
      .select("id")
      .single();

    setLoading(false);

    if (insertError || !data?.id) {
      setError("Something went wrong saving the invite.");
      return;
    }

    router.push(`/created/${data.id}?token=${creatorToken}`);
  };

  return (
    <main className="min-h-screen bg-sand-50">
      <div className="container-base py-10">
        <div className="mb-10 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-ink-600">
              Reveal
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-ink-900">
              {isEditing ? "Edit your invite" : "Create an invite"}
            </h1>
          </div>
          <a
            href="/"
            className="text-xs uppercase tracking-[0.2em] text-ink-600"
          >
            Back to home
          </a>
        </div>

        {loadingInvite && (
          <p className="mb-6 text-sm text-ink-600">Loading invite...</p>
        )}

        <form
          onSubmit={handleSubmit}
          className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]"
        >
          <div className="space-y-5">
            {[
              { label: "Title", field: "title", type: "text" },
              { label: "Location", field: "location", type: "text" }
            ].map((item) => (
              <label key={item.field} className="block text-sm text-ink-700">
                {item.label}
                <input
                  required
                  type={item.type}
                  value={formState[item.field as keyof typeof formState]}
                  onChange={(event) =>
                    updateField(
                      item.field as keyof typeof formState,
                      event.target.value
                    )
                  }
                  className="mt-2 w-full rounded-2xl border border-ink-900/10 bg-white px-4 py-3 text-sm text-ink-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-ink-900/20"
                />
              </label>
            ))}

            <DateTimeSlotPicker
              initialSelection={selectedSlot}
              onSelect={handleSlotSelect}
            />
            {selectedSlot && (
              <div className="text-xs text-ink-600">
                Selected: {selectedSlot.label}
              </div>
            )}

            <label className="block text-sm text-ink-700">
              Optional message
              <textarea
                rows={4}
                value={formState.message}
                onChange={(event) => updateField("message", event.target.value)}
                className="mt-2 w-full rounded-2xl border border-ink-900/10 bg-white px-4 py-3 text-sm text-ink-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-ink-900/20"
              />
            </label>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <motion.button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-ink-900 px-6 py-3 text-sm font-semibold text-sand-50 shadow-sm disabled:opacity-60"
              whileTap={{ scale: 0.98 }}
            >
              {loading
                ? isEditing
                  ? "Saving..."
                  : "Creating..."
                : isEditing
                  ? "Save changes"
                  : "Create invite"}
            </motion.button>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-ink-900">
              Pick a mini-game
            </h2>
            <p className="text-sm text-ink-600">
              Guests unlock the invite by finishing a short game.
            </p>
            <div className="grid gap-4">
              {gameOptions.map((game) => (
                <button
                  key={game.key}
                  type="button"
                  onClick={() => setGameType(game.key)}
                  className={`rounded-2xl border px-4 py-4 text-left transition ${
                    gameType === game.key
                      ? "border-ink-900/40 bg-white shadow-sm"
                      : "border-ink-900/10 bg-white/60"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold text-ink-900">
                      {game.displayName}
                    </div>
                    {gameType === game.key && (
                      <span className="rounded-full bg-ink-900 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-sand-50">
                        Selected
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-xs text-ink-600">
                    {game.description}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}
