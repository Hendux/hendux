// Browser-only helpers for the card actions.

function icsDate(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;
}

export function downloadCalendarEvent(opts: { title: string; start: Date; end: Date; location: string; description?: string }) {
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Hendux//Campus//EN",
    "BEGIN:VEVENT",
    `UID:${Date.now()}@hendux`,
    `DTSTART:${icsDate(opts.start)}`,
    `DTEND:${icsDate(opts.end)}`,
    `SUMMARY:${opts.title}`,
    `LOCATION:${opts.location}`,
    `DESCRIPTION:${(opts.description ?? "").replace(/\n/g, " ")}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  const blob = new Blob([ics], { type: "text/calendar" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${opts.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.ics`;
  a.click();
  URL.revokeObjectURL(url);
}

export function shareToWhatsApp(text: string) {
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
}
