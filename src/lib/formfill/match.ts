import type { FormField, Profile, ProfileField } from "./types";

export type FlatField = {
  fieldId: string;
  sectionId: string;
  sectionTitle: string;
  label: string;
  value: string;
  keys: string[];
};

export type Suggestion = {
  fieldId: string;
  sectionId: string;
  sectionTitle: string;
  label: string;
  value: string;
};

export type Resolution = {
  status: "filled" | "unclear" | "missing";
  value: string;
  matched: Suggestion | null;
  suggestions: Suggestion[];
  note: string;
};

const STOP = new Set([
  "a",
  "an",
  "the",
  "of",
  "and",
  "or",
  "to",
  "for",
  "your",
  "my",
  "please",
  "enter",
  "number",
  "no",
  "code",
  "details",
]);

const SYN: Record<string, string> = {
  mobile: "phone",
  cell: "phone",
  telephone: "phone",
  mail: "email",
  pincode: "pin",
  zip: "pin",
  postal: "pin",
  gender: "sex",
  dob: "birth",
  birthdate: "birth",
};

const GENERIC = new Set([
  "name",
  "date",
  "address",
  "contact",
  "full",
  "info",
  "information",
  "person",
  "current",
  "id",
]);

const SHORT = new Set(["email", "phone", "pin", "city", "sex", "name", "role", "address"]);

const ROLE = new Set([
  "parent",
  "guardian",
  "emergency",
  "mother",
  "father",
  "alternate",
  "reference",
  "billing",
  "employer",
  "work",
  "home",
  "preferred",
  "legal",
]);

const RELATED: string[][] = [["parent", "guardian", "emergency", "mother", "father"]];

export function norm(value: string): string {
  return value
    .toLowerCase()
    .replace(/['’]s\b/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function tokens(value: string): string[] {
  return norm(value)
    .split(" ")
    .filter((token) => token && !STOP.has(token))
    .map((token) => SYN[token] ?? token);
}

function phrasesOf(field: FlatField): string[] {
  return [field.label, ...field.keys].map(norm).filter(Boolean);
}

function containsPhrase(hay: string, needle: string): boolean {
  if (needle.length < 4) return false;
  return ` ${hay} `.includes(` ${needle} `);
}

function strongContain(hay: string, needle: string): boolean {
  if (!containsPhrase(hay, needle)) return false;
  const parts = tokens(needle);
  if (parts.length >= 2) return true;
  if (parts.length === 1 && !SHORT.has(parts[0]!) && !GENERIC.has(parts[0]!)) return true;
  return false;
}

function roleMismatch(formTokens: string[], phraseTokens: string[]): boolean {
  const formRoles = formTokens.filter((token) => ROLE.has(token));
  const phraseRoles = phraseTokens.filter((token) => ROLE.has(token));
  if (!formRoles.length && !phraseRoles.length) return false;
  if (!formRoles.length || !phraseRoles.length) return true;
  return !formRoles.some((token) => phraseRoles.includes(token));
}

function relatedBoost(formLabel: string, field: FlatField): number {
  const formTokens = tokens(formLabel);
  const fieldTokens = tokens(`${field.label} ${field.keys.join(" ")}`);
  for (const group of RELATED) {
    const formHit = formTokens.some((token) => group.includes(token));
    const fieldHit = fieldTokens.some((token) => group.includes(token));
    if (formHit && fieldHit) return 0.66;
  }
  return 0;
}

function preference(formLabel: string, field: FlatField): number {
  const formTokens = tokens(formLabel);
  const fieldTokens = tokens(`${field.label} ${field.keys.join(" ")}`);
  let score = 0;
  if (formTokens.includes("name") && fieldTokens.includes("name") && !fieldTokens.includes("phone")) {
    score += 2;
  }
  if (formTokens.includes("phone") && fieldTokens.includes("phone") && !fieldTokens.includes("name")) {
    score += 2;
  }
  return score;
}

export function flatten(profile: Profile): FlatField[] {
  return profile.sections.flatMap((section) =>
    section.fields.map((field) => ({
      fieldId: field.id,
      sectionId: section.id,
      sectionTitle: section.title,
      label: field.label,
      value: field.value,
      keys: field.keys,
    })),
  );
}

function suggest(field: FlatField): Suggestion {
  return {
    fieldId: field.fieldId,
    sectionId: field.sectionId,
    sectionTitle: field.sectionTitle,
    label: field.label,
    value: field.value,
  };
}

export function scorePair(formLabel: string, field: FlatField): number {
  const formNorm = norm(formLabel);
  const formTokens = tokens(formLabel);
  const fieldTokens = tokens(`${field.label} ${field.keys.join(" ")}`);
  const formOnly = formTokens.filter((token) => !fieldTokens.includes(token) && !GENERIC.has(token));

  for (const phrase of phrasesOf(field)) {
    if (phrase === formNorm) return 1;
  }

  // The question names something this detail never mentions ("why", "teacher", "reference").
  // Don't treat a shared word as the answer. Family links (parent / emergency) can still suggest.
  if (formOnly.length) {
    return relatedBoost(formLabel, field);
  }

  let score = 0;

  for (const phrase of phrasesOf(field)) {
    if (strongContain(formNorm, phrase) || strongContain(phrase, formNorm)) {
      score = Math.max(score, 0.93);
    }
  }

  let overlap = 0;
  for (const phrase of phrasesOf(field)) {
    const phraseTokens = tokens(phrase);
    if (!formTokens.length || !phraseTokens.length) continue;
    const shared = formTokens.filter((token) => phraseTokens.includes(token));
    const specific = shared.filter((token) => !GENERIC.has(token));
    if (!specific.length) {
      const union = new Set([...formTokens, ...phraseTokens]);
      overlap = Math.max(overlap, Math.min(shared.length / union.size, 0.48));
      continue;
    }
    if (roleMismatch(formTokens, phraseTokens)) {
      overlap = Math.max(overlap, 0.58);
      continue;
    }
    const union = new Set([...formTokens, ...phraseTokens]);
    const jaccard = shared.length / union.size;
    overlap = Math.max(overlap, Math.min(0.96, 0.8 + jaccard * 0.15));
  }

  return Math.max(score, overlap, relatedBoost(formLabel, field));
}

function bareName(formLabel: string, fields: FlatField[]): Resolution | null {
  const formTokens = tokens(formLabel);
  if (!formTokens.length || !formTokens.every((token) => token === "name")) return null;
  const named = fields.filter((field) =>
    tokens(`${field.label} ${field.keys.join(" ")}`).includes("name"),
  );
  if (!named.length) return null;
  const ranked = [...named].sort((a, b) => {
    const aFull = a.keys.some((key) => norm(key) === "full name") ? 1 : 0;
    const bFull = b.keys.some((key) => norm(key) === "full name") ? 1 : 0;
    return bFull - aFull;
  });
  if (named.length === 1) {
    const only = ranked[0]!;
    if (!only.value.trim()) {
      return {
        status: "missing",
        value: "",
        matched: suggest(only),
        suggestions: [],
        note: `${only.label} is on the profile, but blank.`,
      };
    }
    return {
      status: "filled",
      value: only.value,
      matched: suggest(only),
      suggestions: [],
      note: `Filled from ${only.label}.`,
    };
  }
  return {
    status: "unclear",
    value: "",
    matched: null,
    suggestions: ranked.slice(0, 2).map(suggest),
    note: "More than one name could fit. Not filled.",
  };
}

export function resolveField(formField: FormField, fields: FlatField[]): Resolution {
  if (!fields.length) {
    return {
      status: "missing",
      value: "",
      matched: null,
      suggestions: [],
      note: "This profile has no details yet.",
    };
  }

  const named = bareName(formField.label, fields);
  if (named) return named;

  const ranked = fields
    .map((field) => ({ field, score: scorePair(formField.label, field) }))
    .sort(
      (a, b) =>
        b.score - a.score ||
        preference(formField.label, b.field) - preference(formField.label, a.field) ||
        Number(Boolean(b.field.value.trim())) - Number(Boolean(a.field.value.trim())),
    );

  const best = ranked[0];
  const second = ranked[1];
  if (!best || best.score < 0.45) {
    return {
      status: "missing",
      value: "",
      matched: null,
      suggestions: [],
      note: "Nothing on this profile matches.",
    };
  }

  const ambiguous = Boolean(second && second.score >= 0.7 && best.score - second.score < 0.12);

  if (ambiguous || best.score < 0.74) {
    const pool = [best, second].filter(
      (item): item is NonNullable<typeof best> => Boolean(item && item.score >= 0.45),
    );
    const bestPref = preference(formField.label, best.field);
    const trimmed =
      pool.length > 1 && bestPref > preference(formField.label, pool[1]!.field) ? [pool[0]!] : pool;
    const suggestions = trimmed.map((item) => suggest(item.field));
    return {
      status: "unclear",
      value: "",
      matched: null,
      suggestions,
      note:
        suggestions.length > 1
          ? "Two details could match. Not filled."
          : `Might be ${suggestions[0]?.label ?? "another detail"}. Not filled.`,
    };
  }

  if (!best.field.value.trim()) {
    return {
      status: "missing",
      value: "",
      matched: suggest(best.field),
      suggestions: [],
      note: `${best.field.label} is on the profile, but blank.`,
    };
  }

  return {
    status: "filled",
    value: best.field.value,
    matched: suggest(best.field),
    suggestions: [],
    note: `Filled from ${best.field.label}.`,
  };
}

export function keysFor(label: string): string[] {
  const normalized = norm(label);
  return normalized ? [normalized] : [];
}

export function withFormKey(field: ProfileField, formLabel: string): ProfileField {
  const next = new Set(field.keys);
  const extra = norm(formLabel);
  if (extra) next.add(extra);
  return { ...field, keys: [...next] };
}
