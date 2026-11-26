import { useMemo, useState } from "react";
import { SAMPLE_RESUME, WHO_OPTIONS } from "@/lib/formfill/samples";
import { extractDocument, readUploadedFile } from "@/lib/formfill/extract";
import { useVault } from "@/lib/formfill/store";
import type { Proposal } from "@/lib/formfill/types";
import { Button, PaperArea, PaperInput, Sheet } from "./ui";

export function ImportScreen({ profileId }: { profileId: string | null }) {
  const profile = useVault((s) => s.profiles.find((item) => item.id === profileId) ?? null);
  const importProposals = useVault((s) => s.importProposals);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [fileName, setFileName] = useState("");
  const [proposals, setProposals] = useState<Proposal[] | null>(null);
  const [leftovers, setLeftovers] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [who, setWho] = useState("Other");

  const load = (raw: string, sourceLabel: string) => {
    const result = extractDocument(raw);
    if (!result.proposals.length) {
      setError(`Nothing recognizable in ${sourceLabel}. Try lines like “Email: you@example.com”.`);
      setProposals(null);
      return;
    }
    setError("");
    setProposals(result.proposals);
    setLeftovers(result.leftovers);
    setName(result.suggestedName);
  };

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    setFileName(file.name);
    const result = await readUploadedFile(file);
    if ("error" in result) {
      setError(result.error);
      setProposals(null);
      return;
    }
    load(result.text, file.name);
  };

  const accepted = useMemo(() => proposals?.filter((item) => item.accepted).length ?? 0, [proposals]);

  if (!proposals) {
    return (
      <div className="mx-auto flex w-full max-w-xl flex-col gap-4">
        <div>
          <h1 className="font-serif text-3xl text-cream">Import</h1>
          <p className="mt-1 text-sm text-cream/70">
            {profile
              ? `Pull details into ${profile.name}. You check them before anything is saved.`
              : "Paste a resume or note. You check every line before it becomes a profile."}
          </p>
        </div>
        <Sheet className="p-4">
          <label className="text-xs font-medium tracking-widest text-mute uppercase" htmlFor="import-text">
            Paste text
          </label>
          <PaperArea
            id="import-text"
            className="mt-2"
            value={text}
            placeholder={"Asha Menon\nEmail: asha@example.com\nCity: Bengaluru"}
            onChange={(event) => setText(event.target.value)}
          />
          <div className="mt-3 flex flex-wrap gap-2">
            <Button disabled={!text.trim()} onClick={() => load(text, "the paste")}>
              Read this
            </Button>
            <Button tone="quiet" onClick={() => load(SAMPLE_RESUME, "the sample resume")}>
              Use the sample resume
            </Button>
          </div>
        </Sheet>
        <Sheet className="p-4">
          <p className="text-xs font-medium tracking-widest text-mute uppercase">Or a file</p>
          <label className="mt-3 flex min-h-24 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-rule px-4 text-center text-sm text-mute">
            <span>.txt, .md, or .csv</span>
            <span className="mt-1 text-xs">PDF and Word are refused until a reader is built.</span>
            <input
              className="sr-only"
              type="file"
              accept=".txt,.md,.csv,.pdf,.doc,.docx,text/plain"
              onChange={(event) => void onFile(event.target.files?.[0])}
            />
          </label>
          {fileName && <p className="mt-2 text-xs text-mute">{fileName}</p>}
        </Sheet>
        {error && (
          <p className="rounded-xl bg-desk-2 px-4 py-3 text-sm text-cream" role="status">
            {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-4">
      <div>
        <h1 className="font-serif text-3xl text-cream">Check this</h1>
        <p className="mt-1 text-sm text-cream/70">
          {accepted} selected. Sure lines are on by default. Check lines need a look. Nothing is saved yet.
        </p>
      </div>
      {!profile && (
        <Sheet className="p-4">
          <label className="text-xs font-medium tracking-widest text-mute uppercase" htmlFor="import-name">
            Save as
          </label>
          <PaperInput id="import-name" className="mt-2" value={name} onChange={(event) => setName(event.target.value)} />
          <div className="mt-3 flex flex-wrap gap-2">
            {WHO_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={who === option}
                onClick={() => setWho(option)}
                className={`min-h-11 rounded-full px-3 text-sm ${who === option ? "bg-stamp text-white" : "bg-cream-2 text-ink"}`}
              >
                {option}
              </button>
            ))}
          </div>
        </Sheet>
      )}
      <ul className="flex flex-col gap-3">
        {proposals.map((item) => (
          <li key={item.id}>
            <Sheet className="p-3">
              <div className="flex gap-3">
                <button
                  type="button"
                  aria-pressed={item.accepted}
                  aria-label={item.accepted ? `Skip ${item.label}` : `Keep ${item.label}`}
                  onClick={() =>
                    setProposals((current) =>
                      current!.map((entry) =>
                        entry.id === item.id ? { ...entry, accepted: !entry.accepted } : entry,
                      ),
                    )
                  }
                  className={`mt-1 size-11 shrink-0 rounded-xl border ${item.accepted ? "border-stamp bg-stamp text-white" : "border-rule bg-panel text-mute"}`}
                >
                  {item.accepted ? "On" : "Off"}
                </button>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-xs font-medium tracking-widest text-mute uppercase">
                      {item.section} · {item.label}
                    </p>
                    <span className="rounded-full bg-cream-2 px-2 py-0.5 text-xs text-ink">
                      {item.confidence === "sure" ? "Sure" : "Check"}
                    </span>
                  </div>
                  <PaperArea
                    className="mt-2 min-h-11"
                    value={item.value}
                    aria-label={item.label}
                    onChange={(event) =>
                      setProposals((current) =>
                        current!.map((entry) =>
                          entry.id === item.id ? { ...entry, value: event.target.value } : entry,
                        ),
                      )
                    }
                  />
                  <p className="mt-1 text-xs text-mute">From: {item.source}</p>
                </div>
              </div>
            </Sheet>
          </li>
        ))}
      </ul>
      {leftovers.length > 0 && (
        <Sheet className="p-4">
          <h2 className="font-serif text-xl">Left out</h2>
          <p className="mt-1 text-sm text-mute">These lines were not mapped. They are not saved.</p>
          <ul className="mt-3 flex flex-col gap-2 text-sm">
            {leftovers.map((line) => (
              <li key={line} className="border-t border-rule pt-2 first:border-t-0 first:pt-0">
                {line}
              </li>
            ))}
          </ul>
        </Sheet>
      )}
      <div className="flex flex-wrap gap-2">
        <Button
          disabled={accepted === 0 || (!profile && !name.trim())}
          onClick={() =>
            importProposals({
              profileId: profile?.id ?? null,
              name,
              who,
              proposals,
            })
          }
        >
          {profile ? `Add to ${profile.name}` : "Save as a new person"}
        </Button>
        <Button tone="paper" onClick={() => setProposals(null)}>
          Start over
        </Button>
      </div>
    </div>
  );
}
