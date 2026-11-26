import { useState } from "react";
import { WHO_OPTIONS } from "@/lib/formfill/samples";
import { profileStats } from "@/lib/formfill/stats";
import { useVault } from "@/lib/formfill/store";
import { Button, PaperInput } from "./ui";

export function HomeScreen() {
  const profiles = useVault((s) => s.profiles);
  const go = useVault((s) => s.go);
  const addProfile = useVault((s) => s.addProfile);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [who, setWho] = useState("You");
  const [customWho, setCustomWho] = useState("");

  const submit = () => {
    const chosen = who === "Other" ? customWho.trim() || "Other" : who;
    if (!name.trim()) return;
    addProfile(name, chosen);
  };

  return (
    <div className="rise grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <section className="rounded-2xl bg-panel/90 p-5 shadow-sheet backdrop-blur-sm lg:p-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-[32px] leading-none font-normal">People</h1>
            <p className="mt-2 text-sm text-mute">{profiles.length} on this device</p>
          </div>
          <div className="flex gap-2">
            <Button tone="paper" onClick={() => go({ name: "import", profileId: null })}>
              Import
            </Button>
            <Button onClick={() => setAdding((open) => !open)}>New</Button>
          </div>
        </div>

        {adding && (
          <div className="mt-6 rounded-xl border border-edge bg-panel p-5">
            <label className="text-sm text-mute" htmlFor="home-name">
              Name
            </label>
            <PaperInput
              id="home-name"
              className="mt-2"
              value={name}
              placeholder="Their name"
              onChange={(event) => setName(event.target.value)}
            />
            <div className="mt-3 flex flex-wrap gap-2">
              {WHO_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  aria-pressed={who === option}
                  onClick={() => setWho(option)}
                  className={`h-9 rounded-lg px-3 text-sm ${who === option ? "bg-cream text-[#1f1b16]" : "bg-panel-2 text-cream"}`}
                >
                  {option}
                </button>
              ))}
            </div>
            {who === "Other" && (
              <PaperInput
                className="mt-3"
                value={customWho}
                placeholder="Who they are"
                onChange={(event) => setCustomWho(event.target.value)}
              />
            )}
            <Button className="mt-4" onClick={submit} disabled={!name.trim()}>
              Create
            </Button>
          </div>
        )}

        <ul className="mt-8 divide-y divide-edge border-y border-edge">
          {profiles.map((profile) => {
            const stats = profileStats(profile);
            return (
              <li key={profile.id}>
                <button
                  type="button"
                  onClick={() => go({ name: "person", profileId: profile.id })}
                  className="flex h-16 w-full items-center justify-between gap-3 text-left"
                >
                  <span>
                    <span className="block text-sm font-medium">{profile.name}</span>
                    <span className="block text-sm text-mute">{profile.who}</span>
                  </span>
                  <span className="font-mono text-xs text-mute tabular-nums">
                    {stats.filled}/{stats.fields}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <button
        type="button"
        onClick={() => go({ name: "fill" })}
        className="text-left lg:sticky lg:top-8"
      >
        <FormMoment />
        <p className="mt-3 text-sm text-mute">Clinic intake, filled from Amina</p>
      </button>
    </div>
  );
}

function FormMoment() {
  return (
    <div className="relative">
      <div className="absolute inset-x-3 top-3 h-full rounded-2xl bg-[#d5e4ec] shadow-[0_8px_20px_rgba(30,50,60,0.08)]" aria-hidden="true" />
      <div className="relative rounded-2xl bg-[#f6f1e7] p-6 text-[#1f1b16] shadow-[0_12px_32px_rgba(60,40,20,0.12)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs text-[#7b7266]">Victoria Layout Clinic</p>
            <p className="mt-1 text-lg">Patient intake</p>
          </div>
          <span className="-rotate-6 grid size-16 place-items-center rounded-full border-2 border-[#9a3412] text-xs font-medium text-[#9a3412]">
            Filed
          </span>
        </div>
        <dl className="mt-5 flex flex-col gap-3">
          <Row label="Full name" value="Amina Qureshi" />
          <Row label="Date of birth" value="19 June 1994" />
          <Row label="Mobile" value="+91 98450 22018" />
          <Row label="Address" value="14, 3rd Cross, Cooke Town" />
          <Row label="Allergies" value="Not on file" missing />
        </dl>
        <p className="mt-4 text-xs text-[#7b7266]">Carbon copy kept on this device</p>
      </div>
    </div>
  );
}

function Row({ label, value, missing = false }: { label: string; value: string; missing?: boolean }) {
  return (
    <div className="border-b border-[#e4d9c8] pb-2">
      <dt className="text-xs text-[#7b7266]">{label}</dt>
      <dd className={`mt-0.5 text-sm ${missing ? "text-[#9a3412]" : ""}`}>{value}</dd>
    </div>
  );
}
