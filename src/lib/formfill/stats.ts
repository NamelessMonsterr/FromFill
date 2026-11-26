import type { Profile } from "./types";

export function profileStats(profile: Profile) {
  const fields = profile.sections.flatMap((section) => section.fields);
  const filled = fields.filter((field) => field.value.trim()).length;
  return { sections: profile.sections.length, fields: fields.length, filled };
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[parts.length - 1]![0] ?? ""}`.toUpperCase();
}

export function formatWhen(timestamp: number): string {
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(
    timestamp,
  );
}

export function defaultSectionFor(group: string): string {
  if (/emergency|parent/i.test(group)) return "Emergency";
  if (/work|job|background/i.test(group)) return "Work";
  if (/school|education/i.test(group)) return "Education";
  if (/address|contact/i.test(group)) return "Contact";
  if (/clinic|health|clinical/i.test(group)) return "Health";
  if (/about|you|applicant|student|identity/i.test(group)) return "Identity";
  return "General";
}
