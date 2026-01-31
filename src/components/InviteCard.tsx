"use client";

import { Invite } from "@/lib/types";
import { formatInviteDate, formatInviteTime } from "@/lib/format";

type InviteCardProps = {
  invite: Invite;
  onDownloadCalendar: () => void;
};

export default function InviteCard({
  invite,
  onDownloadCalendar
}: InviteCardProps) {
  return (
    <div className="glass-panel w-full max-w-md px-6 py-8 text-center">
      <p className="text-xs uppercase tracking-[0.3em] text-ink-600">
        You&apos;re invited
      </p>
      <h1 className="mt-3 text-3xl font-semibold text-ink-900">
        {invite.title}
      </h1>
      <div className="mt-6 space-y-3 text-sm text-ink-700">
        <div>
          <span className="text-xs uppercase tracking-[0.25em] text-ink-500">
            When
          </span>
          <div className="mt-1">{formatInviteDate(invite.date)}</div>
          <div>{formatInviteTime(invite.time)}</div>
        </div>
        <div>
          <span className="text-xs uppercase tracking-[0.25em] text-ink-500">
            Where
          </span>
          <div className="mt-1">{invite.location}</div>
        </div>
      </div>
      {invite.message && (
        <p className="mt-5 text-sm text-ink-700">{invite.message}</p>
      )}
      <div className="mt-6 flex flex-col gap-3">
        <button
          type="button"
          onClick={onDownloadCalendar}
          className="rounded-full border border-ink-900/15 px-5 py-2 text-xs font-semibold text-ink-900"
        >
          Add to Calendar
        </button>
        <a
          href="/"
          className="text-xs uppercase tracking-[0.2em] text-ink-600"
        >
          Made with Reveal
        </a>
      </div>
    </div>
  );
}
