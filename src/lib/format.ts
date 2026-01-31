const getOrdinal = (day: number) => {
  if (day >= 11 && day <= 13) return "th";
  switch (day % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
};

export const formatInviteDate = (date: string) => {
  if (!date) return "";
  const safeDate = new Date(`${date}T12:00:00`);
  const parts = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric"
  }).formatToParts(safeDate);

  const weekday = parts.find((part) => part.type === "weekday")?.value ?? "";
  const month = parts.find((part) => part.type === "month")?.value ?? "";
  const dayValue = parts.find((part) => part.type === "day")?.value ?? "";
  const dayNumber = Number(dayValue);
  const suffix = Number.isNaN(dayNumber) ? "" : getOrdinal(dayNumber);

  return `${weekday}, ${month} ${dayValue}${suffix}`.trim();
};

export const formatInviteTime = (time: string) => {
  if (!time) return "";
  const [rawHours, rawMinutes] = time.split(":");
  const hours = Number(rawHours);
  const minutes = Number(rawMinutes ?? "0");
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return time;

  const ampm = hours >= 12 ? "PM" : "AM";
  const adjustedHours = hours % 12 === 0 ? 12 : hours % 12;
  const paddedMinutes = String(minutes).padStart(2, "0");

  return `${adjustedHours}:${paddedMinutes}${ampm}`;
};
