import { useMemo, useState } from "react";
import { FARHAN_ID, formById, FORMS } from "@/lib/formfill/samples";
import { flatten, resolveField, type Suggestion } from "@/lib/formfill/match";
import { defaultSectionFor } from "@/lib/formfill/stats";
import { useVault } from "@/lib/formfill/store";
import type { FormField, FormTemplate, Profile } from "@/lib/formfill/types";
import { AdSlot, Button, PaperArea, PaperInput } from "./ui";

type Row = {
  field: FormField;
  status: "filled" | "unclear" | "missing";
  baseline: string;
  note: string;
  matched: Suggestion | null;
  suggestions: Suggestion[];
};

function rowsFor(profile: Profile | null, template: FormTemplate): Row[] {
  const flat = profile ? flatten(profile) : [];
  return template.fields.map((field) => {
    if (!profile) {
      return {
        field,
        status: "missing",
        baseline: "",
        note: "Choose a person first.",
        matched: null,
        suggestions: [],
      };
    }
    const resolution = resolveField(field, flat);
    return {
      field,
      status: resolution.status,
      baseline: resolution.value,
      note: resolution.note,
      matched: resolution.matched,
      suggestions: resolution.suggestions,
    };
  });
}

export function FillScreen() {
  const profiles = useVault((s) => s.profiles);
  const formId = useVault((s) => s.fill.formId);
  const profileId = useVault((s) => s.fill.profileId);
  const drafts = useVault((s) => s.fill.drafts);
  const setFillForm = useVault((s) => s.setFillForm);
  const setFillProfile = useVault((s) => s.setFillProfile);
  const template = formById(formId);
  const profile = profiles.find((item) => item.id === profileId) ?? null;
  const rows = useMemo(() => rowsFor(profile, template), [profile, template]);
  const farhan = profiles.some((item) => item.id === FARHAN_ID);

  return (
    <div className="lg:grid lg:grid-cols-3 lg:items-start lg:gap-6">
      <div className="lg:col-span-2">
        <div className="flex gap-2 overflow-x-auto pb-3">
          {FORMS.map((form) => (
            <button
              key={form.id}
              type="button"
              aria-pressed={form.id === template.id}
              onClick={() => setFillForm(form.id)}
              className={`min-h-11 shrink-0 rounded-full px-4 text-sm ${form.id === template.id ? "bg-stamp text-white" : "bg-panel text-cream"}`}
            >
              {form.kind === "paper" ? "Paper · " : ""}
              {form.title}
            </button>
          ))}
        </div>
        <p className="text-sm text-cream/70">
          {template.kind === "paper"
            ? "A picture of a paper form. Filling a real PDF or Word file is not in this preview."
            : "A sample website form. Putting this on a live site is still to build."}
        </p>
        {farhan && !(template.id === "trip" && profileId === FARHAN_ID) && (
          <button
            type="button"
            className="mt-2 min-h-11 text-left text-sm text-cream underline decoration-edge underline-offset-4"
            onClick={() => {
              setFillForm("trip");
              setFillProfile(FARHAN_ID);
            }}
          >
            See unsure matches — school trip, as Farhan
          </button>
        )}
        <FormPaper
          key={`${template.id}:${profile?.id ?? "none"}`}
          template={template}
          profile={profile}
          rows={rows}
          drafts={drafts}
        />
      </div>
      <div className="hidden lg:sticky lg:top-24 lg:block">
        <Extension profile={profile} profiles={profiles} rows={rows} drafts={drafts} />
      </div>
      <MobileExtension profile={profile} profiles={profiles} rows={rows} drafts={drafts} />
    </div>
  );
}

function FormPaper({
  template,
  profile,
  rows,
  drafts,
}: {
  template: FormTemplate;
  profile: Profile | null;
  rows: Row[];
  drafts: Record<string, string>;
}) {
  const groups: Array<{ name: string; rows: Row[] }> = [];
  for (const row of rows) {
    const last = groups[groups.length - 1];
    if (!last || last.name !== row.field.group) groups.push({ name: row.field.group, rows: [row] });
    else last.rows.push(row);
  }

  return (
    <article className="mt-4 rounded-2xl border border-edge/70 bg-panel text-ink shadow-sheet">
      <header className="border-b border-rule px-5 py-4">
        <p className="text-xs font-medium tracking-widest text-mute uppercase">{template.kicker}</p>
        <h1 className="mt-1 font-serif text-3xl">{template.title}</h1>
        <p className="mt-1 text-sm text-mute">{template.source}</p>
      </header>
      <form
        className="px-5 py-4"
        autoComplete="off"
        onSubmit={(event) => event.preventDefault()}
      >
        {groups.map((group) => (
          <fieldset key={group.name} className="mt-4 first:mt-0">
            <legend className="text-xs font-medium tracking-widest text-mute uppercase">{group.name}</legend>
            <div className="mt-2 flex flex-col gap-4">
              {group.rows.map((row) => (
                <FieldRow key={row.field.id} row={row} profile={profile} draft={drafts[row.field.id]} />
              ))}
            </div>
          </fieldset>
        ))}
      </form>
    </article>
  );
}

function FieldRow({ row, profile, draft }: { row: Row; profile: Profile | null; draft: string | undefined }) {
  const setDraft = useVault((s) => s.setDraft);
  const saveAnswer = useVault((s) => s.saveAnswer);
  const [picked, setPicked] = useState<Suggestion | null>(null);
  const [sectionTitle, setSectionTitle] = useState(defaultSectionFor(row.field.group));
  const [label, setLabel] = useState(row.field.label);
  const [skipped, setSkipped] = useState<string | null>(null);
  const [saved, setSaved] = useState("");

  const shown = draft !== undefined ? draft : row.baseline;
  const dirty = draft !== undefined && draft !== row.baseline;
  const answered = shown.trim().length > 0;
  const usingStored =
    picked !== null && shown === picked.value ? picked : row.matched && shown === row.matched.value ? row.matched : null;
  const prompt =
    Boolean(profile) && dirty && answered && skipped !== shown && !usingStored;

  const bar = answered ? "bg-stamp" : row.status === "unclear" ? "bg-ink" : "bg-clay";
  const flag = answered ? (row.status === "filled" && !dirty ? "Filled" : "Typed") : row.status === "unclear" ? "Check" : "Missing";

  const sections = profile?.sections.map((section) => section.title) ?? [];
  const sectionOptions = [...new Set([sectionTitle, ...sections])];

  return (
    <div className="relative pl-3">
      <span className={`absolute top-1 bottom-1 left-0 w-1 rounded-full ${bar}`} aria-hidden="true" />
      <label className="text-sm font-medium" htmlFor={row.field.id}>
        {row.field.label}
      </label>
      {row.field.kind === "textarea" ? (
        <PaperArea
          id={row.field.id}
          className="mt-1"
          autoComplete="off"
          value={shown}
          onChange={(event) => {
            setDraft(row.field.id, event.target.value);
            setSaved("");
          }}
        />
      ) : (
        <PaperInput
          id={row.field.id}
          className="mt-1"
          autoComplete="off"
          value={shown}
          onChange={(event) => {
            setDraft(row.field.id, event.target.value);
            setSaved("");
          }}
        />
      )}
      <p className={`mt-1 text-sm ${!answered && row.status === "missing" ? "text-clay-ink" : "text-mute"}`}>
        <span className="font-medium text-ink">{flag}. </span>
        {dirty && answered ? "Typed on this form." : row.note}
      </p>
      {!answered &&
        row.suggestions.map((suggestion) => (
          <button
            key={suggestion.fieldId}
            type="button"
            className="mt-2 flex min-h-11 w-full items-center justify-between gap-3 rounded-xl bg-cream-2 px-3 text-left text-sm"
            onClick={() => {
              setPicked(suggestion);
              setDraft(row.field.id, suggestion.value);
              setSaved("");
            }}
          >
            <span>
              <span className="block font-medium">{suggestion.label}</span>
              <span className="block text-mute">
                {suggestion.sectionTitle} · {suggestion.value || "Blank"}
              </span>
            </span>
            <span className="shrink-0 font-medium text-stamp">Use</span>
          </button>
        ))}
      {prompt && profile && (
        <div className="mt-2 rounded-xl bg-cream-2 p-3">
          <p className="text-sm font-medium">
            {picked || row.matched ? `Update ${profile.name}?` : `Save this on ${profile.name}?`}
          </p>
          {!(picked || row.matched) && (
            <div className="mt-2 flex flex-col gap-2">
              <label className="text-xs tracking-widest text-mute uppercase" htmlFor={`${row.field.id}-section`}>
                Section
              </label>
              <select
                id={`${row.field.id}-section`}
                className="min-h-11 rounded-lg border border-rule bg-desk px-3 text-base text-ink"
                value={sectionTitle}
                onChange={(event) => setSectionTitle(event.target.value)}
              >
                {sectionOptions.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
              <PaperInput aria-label="Field name to save" value={label} onChange={(event) => setLabel(event.target.value)} />
            </div>
          )}
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              onClick={() => {
                const target = picked ?? row.matched;
                saveAnswer({
                  profileId: profile.id,
                  sectionTitle,
                  label: target?.label ?? label,
                  value: shown,
                  formLabel: row.field.label,
                  fieldId: target?.fieldId,
                  sectionId: target?.sectionId,
                });
                setSaved(target ? `Updated ${target.label}.` : `Saved under ${sectionTitle}.`);
              }}
            >
              {picked || row.matched ? "Update profile" : "Save to profile"}
            </Button>
            <Button tone="quiet" onClick={() => setSkipped(shown)}>
              Not now
            </Button>
          </div>
        </div>
      )}
      {saved && <p className="mt-2 text-sm text-ink">{saved}</p>}
    </div>
  );
}

function counts(rows: Row[], drafts: Record<string, string>) {
  let filled = 0;
  let check = 0;
  let missing = 0;
  for (const row of rows) {
    const shown = drafts[row.field.id] !== undefined ? drafts[row.field.id]! : row.baseline;
    if (shown.trim()) filled += 1;
    else if (row.status === "unclear") check += 1;
    else missing += 1;
  }
  return { filled, check, missing };
}

function Extension({
  profile,
  profiles,
  rows,
  drafts,
}: {
  profile: Profile | null;
  profiles: Profile[];
  rows: Row[];
  drafts: Record<string, string>;
}) {
  const setFillProfile = useVault((s) => s.setFillProfile);
  const tally = counts(rows, drafts);

  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-desk-2 p-4">
      <div>
        <p className="text-xs font-medium tracking-widest text-cream/50 uppercase">Extension</p>
        <h2 className="font-serif text-2xl text-cream">Who is this for?</h2>
      </div>
      {profiles.length === 0 ? (
        <p className="text-sm text-cream/70">Add a person before filling.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {profiles.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={item.id === profile?.id}
              onClick={() => setFillProfile(item.id)}
              className={`min-h-11 rounded-xl px-3 text-left text-sm ${item.id === profile?.id ? "bg-stamp text-white" : "bg-desk text-cream"}`}
            >
              <span className="block font-medium">{item.name}</span>
              <span className={`block ${item.id === profile?.id ? "text-mute" : "text-cream/60"}`}>{item.who}</span>
            </button>
          ))}
        </div>
      )}
      <dl className="grid grid-cols-3 gap-2 text-center">
        <Count label="Filled" value={tally.filled} />
        <Count label="Check" value={tally.check} />
        <Count label="Missing" value={tally.missing} />
      </dl>
      <p className="text-sm text-cream/70">
        Matching answers go in. Anything missing or unsure stays empty until you choose.
      </p>
      <AdSlot />
    </div>
  );
}

function Count({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-desk px-2 py-2">
      <dt className="text-xs text-cream/60">{label}</dt>
      <dd className="font-serif text-2xl text-cream tabular-nums">{value}</dd>
    </div>
  );
}

function MobileExtension(props: {
  profile: Profile | null;
  profiles: Profile[];
  rows: Row[];
  drafts: Record<string, string>;
}) {
  const [open, setOpen] = useState(false);
  const tally = counts(props.rows, props.drafts);
  return (
    <>
      <div className="ext-dock fixed inset-x-0 z-30 px-4 lg:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex min-h-12 w-full items-center justify-between rounded-full bg-stamp px-4 text-white shadow-sheet"
        >
          <span className="text-sm font-medium">{props.profile ? props.profile.name : "Choose a person"}</span>
          <span className="text-sm text-mute tabular-nums">
            {tally.filled} filled · {tally.check} check
          </span>
        </button>
      </div>
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button type="button" className="absolute inset-0 bg-desk/70" aria-label="Close extension" onClick={() => setOpen(false)} />
          <div className="ext-sheet sheet-cap absolute inset-x-0 overflow-y-auto rounded-t-2xl">
            <Extension {...props} />
          </div>
        </div>
      )}
    </>
  );
}
