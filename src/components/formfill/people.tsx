import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { WHO_OPTIONS } from "@/lib/formfill/samples";
import { formatWhen, initials, profileStats } from "@/lib/formfill/stats";
import { useVault } from "@/lib/formfill/store";
import { AdSlot, Button, PaperInput, Sheet } from "./ui";

export function PeopleScreen() {
  const profiles = useVault((s) => s.profiles);
  const onboarded = useVault((s) => s.onboarded);
  const dismiss = useVault((s) => s.dismissOnboarding);
  const go = useVault((s) => s.go);
  const addProfile = useVault((s) => s.addProfile);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [who, setWho] = useState<string>("You");
  const [customWho, setCustomWho] = useState("");

  const submit = () => {
    const chosen = who === "Other" ? customWho.trim() || "Other" : who;
    if (!name.trim()) return;
    addProfile(name, chosen);
  };

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-4">
      {!onboarded && (
        <Sheet className="rise p-5">
          <p className="text-xs font-medium tracking-widest text-mute uppercase">Design preview</p>
          <h1 className="mt-1 font-serif text-3xl">Answers, kept once.</h1>
          <p className="mt-2 text-sm text-mute">
            Walk the sample people, check an import, then fill a sample form. Live websites, PDF and Word
            files, and encrypted Google sync are still to build.
          </p>
          <Button className="mt-4" onClick={dismiss}>
            Look around
          </Button>
        </Sheet>
      )}

      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl text-cream">People</h1>
          <p className="text-sm text-cream/70">Anyone you fill forms for, including yourself.</p>
        </div>
        <Button tone="paper" onClick={() => setAdding((open) => !open)}>
          Add
        </Button>
      </div>

      {adding && (
        <Sheet className="p-4">
          <label className="text-xs font-medium tracking-widest text-mute uppercase" htmlFor="new-name">
            Name
          </label>
          <PaperInput
            id="new-name"
            className="mt-2"
            value={name}
            placeholder="Their name"
            onChange={(event) => setName(event.target.value)}
          />
          <p className="mt-3 text-xs font-medium tracking-widest text-mute uppercase">Who</p>
          <div className="mt-2 flex flex-wrap gap-2">
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
          {who === "Other" && (
            <PaperInput
              className="mt-3"
              value={customWho}
              placeholder="Neighbour, client…"
              onChange={(event) => setCustomWho(event.target.value)}
            />
          )}
          <div className="mt-4 flex gap-2">
            <Button onClick={submit} disabled={!name.trim()}>
              Create profile
            </Button>
            <Button tone="quiet" onClick={() => setAdding(false)}>
              Cancel
            </Button>
          </div>
        </Sheet>
      )}

      {profiles.length === 0 && (
        <Sheet className="p-5">
          <h2 className="font-serif text-2xl">No one here yet</h2>
          <p className="mt-1 text-sm text-mute">Add a person, or import a resume and check it before saving.</p>
          <Button className="mt-4" onClick={() => go({ name: "import", profileId: null })}>
            Import a document
          </Button>
        </Sheet>
      )}

      <ul className="flex flex-col gap-3">
        {profiles.map((profile, index) => {
          const stats = profileStats(profile);
          return (
            <li key={profile.id} className="rise" style={{ animationDelay: `${index * 70}ms` }}>
              <button
                type="button"
                onClick={() => go({ name: "person", profileId: profile.id })}
                className="flex w-full items-center gap-3 rounded-2xl border border-edge/70 bg-panel p-3 text-left text-ink shadow-sheet transition-transform duration-150 ease-out active:scale-[0.96]"
              >
                <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-cream-2 font-serif text-lg">
                  {initials(profile.name)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-serif text-xl">{profile.name}</span>
                  <span className="block text-sm text-mute">
                    {profile.who} · {stats.sections} sections · {stats.filled} details
                  </span>
                  <span className="block text-xs text-mute">Updated {formatWhen(profile.updatedAt)}</span>
                </span>
                <ChevronRight className="size-5 shrink-0 text-mute" aria-hidden="true" />
              </button>
            </li>
          );
        })}
      </ul>

      <Button tone="ghost" className="self-start px-0" onClick={() => go({ name: "import", profileId: null })}>
        Import a resume or note
      </Button>
      <AdSlot />
    </div>
  );
}
