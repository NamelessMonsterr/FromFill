import type { Proposal } from "./types";

const LABELED: Array<{ test: RegExp; label: string; section: string }> = [
  { test: /^(full name|name)$/i, label: "Full name", section: "Identity" },
  { test: /^(date of birth|dob|d\.o\.b\.)$/i, label: "Date of birth", section: "Identity" },
  { test: /^(gender|sex)$/i, label: "Gender", section: "Identity" },
  { test: /^(email|e-mail|email address)$/i, label: "Email", section: "Contact" },
  { test: /^(mobile|phone|mobile number|phone number|cell)$/i, label: "Mobile", section: "Contact" },
  { test: /^(address|home address|current address)$/i, label: "Address", section: "Address" },
  { test: /^(city|town)$/i, label: "City", section: "Address" },
  { test: /^(state)$/i, label: "State", section: "Address" },
  { test: /^(pin|pin code|pincode|zip|postal code)$/i, label: "PIN code", section: "Address" },
  { test: /^(linkedin|linked in)$/i, label: "LinkedIn", section: "Work" },
  { test: /^(github)$/i, label: "GitHub", section: "Work" },
  { test: /^(employer|company|organization|organisation)$/i, label: "Employer", section: "Work" },
  {
    test: /^(role|title|current role|job title|designation)$/i,
    label: "Current role",
    section: "Work",
  },
  { test: /^(nationality)$/i, label: "Nationality", section: "Identity" },
];

const SECTION_HEADERS: Record<string, { label: string; section: string }> = {
  experience: { label: "Experience", section: "Work" },
  "work experience": { label: "Experience", section: "Work" },
  education: { label: "Education", section: "Education" },
  skills: { label: "Skills", section: "Skills" },
  summary: { label: "Summary", section: "Identity" },
  projects: { label: "Projects", section: "Work" },
};

const EMAIL_RE = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;
const PHONE_RE = /(?:\+\d{1,3}[\s-]?)?(?:\d[\s()-]?){9,}\d/;

function proposal(
  partial: Omit<Proposal, "id" | "accepted"> & { accepted?: boolean },
  index: number,
): Proposal {
  return {
    id: `proposal-${index}-${partial.label.toLowerCase().replace(/[^a-z]+/g, "-")}`,
    accepted: partial.accepted ?? partial.confidence === "sure",
    label: partial.label,
    value: partial.value.trim(),
    section: partial.section,
    confidence: partial.confidence,
    source: partial.source,
  };
}

function looksLikeName(line: string): boolean {
  if (line.length > 40 || /@|\d/.test(line)) return false;
  const words = line.split(/\s+/).filter(Boolean);
  return words.length >= 2 && words.length <= 4;
}

export function extractDocument(text: string): {
  proposals: Proposal[];
  leftovers: string[];
  suggestedName: string;
} {
  const lines = text.split(/\r?\n/).map((line) => line.trim());
  const used = new Set<number>();
  const found: Proposal[] = [];
  let count = 0;

  const push = (item: Omit<Proposal, "id" | "accepted"> & { accepted?: boolean }) => {
    if (!item.value.trim()) return;
    if (found.some((existing) => existing.label === item.label)) return;
    found.push(proposal(item, count));
    count += 1;
  };

  lines.forEach((line, index) => {
    if (!line) return;
    const split = line.match(/^([^:]{2,40}):\s*(.+)$/);
    if (!split) return;
    const rule = LABELED.find((entry) => entry.test.test(split[1]!.trim()));
    if (!rule) return;
    used.add(index);
    push({
      label: rule.label,
      value: split[2]!.trim(),
      section: rule.section,
      confidence: "sure",
      source: line,
    });
  });

  if (!found.some((item) => item.label === "Email")) {
    const email = text.match(EMAIL_RE);
    if (email) {
      push({
        label: "Email",
        value: email[0],
        section: "Contact",
        confidence: "sure",
        source: email[0],
      });
    }
  }

  if (!found.some((item) => item.label === "Mobile")) {
    const phone = text.match(PHONE_RE);
    if (phone) {
      push({
        label: "Mobile",
        value: phone[0].trim(),
        section: "Contact",
        confidence: "check",
        source: phone[0].trim(),
      });
    }
  }

  const headerIndexes: Array<{ index: number; key: string }> = [];
  lines.forEach((line, index) => {
    const key = line.toLowerCase().replace(/[:\s]+$/g, "");
    if (SECTION_HEADERS[key]) headerIndexes.push({ index, key });
  });

  headerIndexes.forEach((header, position) => {
    const end = headerIndexes[position + 1]?.index ?? lines.length;
    const body = lines
      .slice(header.index + 1, end)
      .map((line) => line.trim())
      .filter(Boolean);
    for (let index = header.index; index < end; index += 1) used.add(index);
    const mapped = SECTION_HEADERS[header.key];
    if (!mapped || !body.length) return;
    push({
      label: mapped.label,
      value: body.join("\n"),
      section: mapped.section,
      confidence: "check",
      source: lines[header.index] ?? mapped.label,
    });
  });

  if (!found.some((item) => item.label === "Full name")) {
    const first = lines.findIndex((line) => line.length > 0);
    if (first >= 0 && looksLikeName(lines[first]!)) {
      used.add(first);
      push({
        label: "Full name",
        value: lines[first]!,
        section: "Identity",
        confidence: "check",
        source: "First line of the document",
      });
    }
  } else {
    const first = lines.findIndex((line) => line.length > 0);
    const named = found.find((item) => item.label === "Full name");
    if (first >= 0 && named && lines[first]!.toLowerCase() === named.value.toLowerCase()) {
      used.add(first);
    }
  }

  const leftovers = lines
    .map((line, index) => ({ line, index }))
    .filter(({ line, index }) => line && !used.has(index))
    .map(({ line }) => line)
    .filter((line) => line.length > 2)
    .slice(0, 6);

  const suggestedName = found.find((item) => item.label === "Full name")?.value ?? "";

  return { proposals: found, leftovers, suggestedName };
}

export function readUploadedFile(file: File): Promise<{ text: string } | { error: string }> {
  const name = file.name.toLowerCase();
  if (
    name.endsWith(".txt") ||
    name.endsWith(".md") ||
    name.endsWith(".csv") ||
    file.type.startsWith("text/")
  ) {
    return file.text().then((text) => ({ text }));
  }
  if (name.endsWith(".pdf") || name.endsWith(".doc") || name.endsWith(".docx")) {
    return Promise.resolve({
      error: "PDF and Word reading is not in this preview. Paste the text, or upload a .txt file.",
    });
  }
  return Promise.resolve({
    error: "This preview reads pasted text and .txt files.",
  });
}
