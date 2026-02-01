"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Invite } from "@/lib/types";

type InviteResponse = {
  invite: Invite | null;
};

export default function CreatedPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const token =
    searchParams.get("token") ??
    (typeof window !== "undefined"
      ? localStorage.getItem(`creator_token_${params.id}`) ?? ""
      : "");
  const [invite, setInvite] = useState<Invite | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("loading");
  const [publishState, setPublishState] = useState<"idle" | "publishing" | "done">(
    "idle"
  );
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    const loadInvite = async () => {
      setStatus("loading");
      try {
        const response = await fetch(
          `/api/invite-preview?id=${params.id}&token=${token}`
        );
        const json = (await response.json()) as InviteResponse;
        setInvite(json.invite);
        setStatus("idle");
      } catch (error) {
        setStatus("error");
      }
    };
    if (params.id && token) loadInvite();
  }, [params.id, token]);

  const origin =
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_SITE_URL ?? "";

  const creatorLink = useMemo(
    () => `${origin}/i/${params.id}?t=${token}`,
    [origin, params.id, token]
  );
  const recipientLink = useMemo(
    () => `${origin}/i/${params.id}`,
    [origin, params.id]
  );

  const copyLink = async (value: string) => {
    await navigator.clipboard.writeText(value);
    setCopied(value);
    setTimeout(() => setCopied(null), 1400);
  };

  const publishInvite = async () => {
    setPublishState("publishing");
    const response = await fetch("/api/publish", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: params.id, token })
    });
    if (response.ok) {
      setPublishState("done");
      setInvite((prev) => (prev ? { ...prev, published: true } : prev));
    } else {
      setPublishState("idle");
    }
  };

  const isPublished = Boolean(invite?.published) || publishState === "done";

  return (
    <main className="min-h-screen bg-sand-50">
      <div className="container-base py-12">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-ink-600">
              Invite created
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-ink-900">
              Share your Reveal
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <a
              href={`/create?id=${params.id}&token=${token}`}
              className="text-xs uppercase tracking-[0.2em] text-ink-600"
            >
              Edit invite
            </a>
            <a
              href="/create"
              className="text-xs uppercase tracking-[0.2em] text-ink-600"
            >
              New invite
            </a>
          </div>
        </div>

        {status === "error" && (
          <p className="mt-6 text-sm text-red-600">
            Unable to load the invite preview.
          </p>
        )}

        {status === "loading" && (
          <p className="mt-6 text-sm text-ink-600">Loading preview...</p>
        )}

        {!!params.id && !!token && (
          <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_1fr]">
            <div className="glass-panel p-6">
              <p className="text-xs uppercase tracking-[0.25em] text-ink-600">
                Preview the game
              </p>
              <p className="mt-2 text-sm text-ink-600">
                This is the same experience guests see before the invite unlocks.
              </p>
              <div className="mt-4 overflow-hidden rounded-3xl border border-ink-900/10 bg-white">
                <iframe
                  title="Invite preview"
                  src={`/i/${params.id}?t=${token}`}
                  className="h-[560px] w-full"
                />
              </div>
            </div>
            <div className="space-y-8">
              <div className="glass-panel p-6">
                <p className="text-xs uppercase tracking-[0.25em] text-ink-600">
                  Preview link (unpublished)
                </p>
                <div className="mt-3 rounded-2xl border border-ink-900/10 bg-white px-4 py-3 text-xs text-ink-800">
                  {creatorLink}
                </div>
                <button
                  type="button"
                  onClick={() => copyLink(creatorLink)}
                  className="mt-3 rounded-full border border-ink-900/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-ink-900"
                >
                  {copied === creatorLink ? "Copied" : "Copy preview link"}
                </button>
                <p className="mt-2 text-xs text-ink-600">
                  Share this to let guests play the game before you publish.
                </p>
              </div>

              <div className="glass-panel p-6">
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-[0.25em] text-ink-600">
                    Guest link (published)
                  </p>
                  {!isPublished && (
                    <span className="rounded-full border border-ink-900/10 bg-white/70 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-600">
                      Locked
                    </span>
                  )}
                </div>
                <div className="mt-3 rounded-2xl border border-ink-900/10 bg-white px-4 py-3 text-xs text-ink-800">
                  {isPublished ? recipientLink : "Locked until you publish."}
                </div>
                <button
                  type="button"
                  onClick={() => copyLink(recipientLink)}
                  disabled={!isPublished}
                  className="mt-3 rounded-full border border-ink-900/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-ink-900 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {copied === recipientLink ? "Copied" : "Copy guest link"}
                </button>
                {!isPublished && (
                  <p className="mt-2 text-xs text-ink-600">
                    Publish the invite to unlock the guest link.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {!token && (
          <p className="mt-6 text-sm text-red-600">
            Missing creator token. Open this page from the create flow or use
            the edit link.
          </p>
        )}

        <div className="mt-8 flex flex-wrap items-center gap-4">
          <motion.button
            type="button"
            onClick={publishInvite}
            disabled={publishState !== "idle"}
            className="rounded-full bg-ink-900 px-6 py-3 text-sm font-semibold text-sand-50 disabled:opacity-60"
            whileTap={{ scale: 0.98 }}
          >
            {publishState === "publishing"
              ? "Publishing..."
              : publishState === "done"
                ? "Published"
                : "Publish invite"}
          </motion.button>
          <p className="text-xs text-ink-600">
            Publish to make the recipient link live.
          </p>
        </div>
      </div>
    </main>
  );
}
