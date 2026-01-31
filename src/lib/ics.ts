import { Invite } from "@/lib/types";

export const buildIcsFile = (invite: Invite) => {
  const start = `${invite.date}T${invite.time}`.replace(/[-:]/g, "");
  const uid = `${invite.id}@reveal`;
  const description = (invite.message ?? "").replace(/\n/g, "\\n");

  const icsBody = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Reveal//Invite//EN",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").split(".")[0]}Z`,
    `DTSTART:${start}`,
    `SUMMARY:${invite.title}`,
    `LOCATION:${invite.location}`,
    description ? `DESCRIPTION:${description}` : "",
    "END:VEVENT",
    "END:VCALENDAR"
  ]
    .filter(Boolean)
    .join("\r\n");

  return new Blob([icsBody], { type: "text/calendar;charset=utf-8" });
};
