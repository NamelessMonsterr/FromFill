import { useState } from "react";
import { Trash2 } from "lucide-react";
import { WHO_OPTIONS } from "@/lib/formfill/samples";
import { profileStats } from "@/lib/formfill/stats";
import { useVault } from "@/lib/formfill/store";
import { Button, IconButton, PaperInput, Sheet } from "./ui";

export function PersonScreen({ profileId }: { profileId: string }) {
  const profile = useVault((s) => s.profiles.find((item) => item.id === profileId));
  const go = useVault((s) => s.go);
  const updateMeta = useVault((s) => s.updateProfileMeta);
  const addSection = useVault((s) => s.addSection);
  const renameSection = useVault((s) => s.renameSection);
  const removeSection = useVault((s) => s.removeSection);
  const addField = useVault((s) => s.addField);
  const updateField = useVault((s) => s.updateField);
  const removeField = useVault((s) => s.removeField);
  const removeProfile = useVault((s) => s.removeProfile);
  const setFillProfile = useVault((s) => s.setFillProfile);
  const [sectionTitle, setSectionTitle] = useState("");
  const [addingIn, setAddingIn] = useState<string | null>(null);
  const [fieldLabel, setFieldLabel] = useState("");
  const [fieldValue, setFieldValue] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!profile) {
    return (
      <Sheet className="mx-auto max-w-xl p-5">
        <h1 className="font-serif text-2xl">That person is gone</h1>
        <Button className="mt-4" onClick={() => go({ name: "people" })}>
          Back to people
        </Button>
      </Sheet>
    );
  }

  const stats = profileStats(profile);
  const whoKnown = WHO_OPTIONS.includes(profile.who as (typeof WHO_OPTIONS)[number]);

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-4">
      <Sheet className="p-4">
        <label className="text-xs font-medium tracking-widest text-mute uppercase" htmlFor="profile-name">
          Profile name
        </label>
        <PaperInput
          id="profile-name"
          className="mt-2 font-serif text-xl"
          value={profile.name}
          onChange={(event) => updateMeta(profile.id, { name: event.target.value })}
        />
        <p className="mt-3 text-xs font-medium tracking-widest text-mute uppercase">Who they are</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {WHO_OPTIONS.map((option) => {
            const selected = whoKnown ? profile.who === option : option === "Other";
            return (
              <button
                key={option}
                type="button"
                aria-pressed={selected}
                onClick={() => updateMeta(profile.id, { who: option === "Other" ? "Other" : option })}
                className={`min-h-11 rounded-full px-3 text-sm ${selected ? "bg-stamp text-white" : "bg-cream-2 text-ink"}`}
              >
                {option}
              </button>
            );
          })}
        </div>
        {!whoKnown && (
          <PaperInput
            className="mt-3"
            value={profile.who}
            aria-label="Custom relationship"
            onChange={(event) => updateMeta(profile.id, { who: event.target.value })}
          />
        )}
        <p className="mt-3 text-sm text-mute">
          {stats.sections} sections · {stats.filled} filled details
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            onClick={() => {
              setFillProfile(profile.id);
              go({ name: "fill" });
            }}
          >
            Use on a form
          </Button>
          <Button tone="quiet" onClick={() => go({ name: "import", profileId: profile.id })}>
            Import into this profile
          </Button>
        </div>
      </Sheet>

      {profile.sections.map((section) => (
        <Sheet key={section.id} className="p-4">
          <div className="flex items-center gap-2">
            <input
              aria-label="Section name"
              value={section.title}
              onChange={(event) => renameSection(profile.id, section.id, event.target.value)}
              className="min-h-11 w-full bg-transparent font-serif text-2xl text-ink outline-none"
            />
            <IconButton
              className="text-clay-ink"
              aria-label={`Remove ${section.title}`}
              onClick={() => removeSection(profile.id, section.id)}
            >
              <Trash2 className="size-4" />
            </IconButton>
          </div>
          <ul className="mt-2 flex flex-col">
            {section.fields.map((field) => (
              <li key={field.id} className="border-t border-rule py-3 first:border-t-0">
                <div className="flex items-start gap-2">
                  <div className="min-w-0 flex-1">
                    <input
                      aria-label="Field label"
                      value={field.label}
                      onChange={(event) =>
                        updateField(profile.id, section.id, field.id, { label: event.target.value })
                      }
                      className="w-full bg-transparent text-xs font-medium tracking-widest text-mute uppercase outline-none"
                    />
                    <input
                      aria-label={field.label}
                      value={field.value}
                      onChange={(event) =>
                        updateField(profile.id, section.id, field.id, { value: event.target.value })
                      }
                      className="mt-1 min-h-11 w-full bg-transparent text-base text-ink outline-none"
                    />
                  </div>
                  <IconButton
                    className="text-mute"
                    aria-label={`Remove ${field.label}`}
                    onClick={() => removeField(profile.id, section.id, field.id)}
                  >
                    <Trash2 className="size-4" />
                  </IconButton>
                </div>
              </li>
            ))}
          </ul>
          {addingIn === section.id ? (
            <div className="mt-2 border-t border-rule pt-3">
              <PaperInput
                placeholder="Field name"
                value={fieldLabel}
                onChange={(event) => setFieldLabel(event.target.value)}
              />
              <PaperInput
                className="mt-2"
                placeholder="Value"
                value={fieldValue}
                onChange={(event) => setFieldValue(event.target.value)}
              />
              <div className="mt-3 flex gap-2">
                <Button
                  disabled={!fieldLabel.trim()}
                  onClick={() => {
                    addField(profile.id, section.id, fieldLabel, fieldValue);
                    setFieldLabel("");
                    setFieldValue("");
                    setAddingIn(null);
                  }}
                >
                  Add field
                </Button>
                <Button tone="quiet" onClick={() => setAddingIn(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              className="mt-2 min-h-11 text-sm font-medium text-stamp"
              onClick={() => {
                setAddingIn(section.id);
                setFieldLabel("");
                setFieldValue("");
              }}
            >
              Add a field
            </button>
          )}
        </Sheet>
      ))}

      <Sheet className="p-4">
        <h2 className="font-serif text-xl">New section</h2>
        <PaperInput
          className="mt-2"
          placeholder="Health, Travel, School…"
          value={sectionTitle}
          onChange={(event) => setSectionTitle(event.target.value)}
        />
        <Button
          className="mt-3"
          tone="quiet"
          disabled={!sectionTitle.trim()}
          onClick={() => {
            addSection(profile.id, sectionTitle);
            setSectionTitle("");
          }}
        >
          Add section
        </Button>
      </Sheet>

      {!confirmDelete ? (
        <button
          type="button"
          className="min-h-11 self-start text-sm text-clay"
          onClick={() => setConfirmDelete(true)}
        >
          Remove this profile
        </button>
      ) : (
        <Sheet className="p-4">
          <p className="text-sm">
            Remove {profile.name}? This deletes the copy in this browser only.
          </p>
          <div className="mt-3 flex gap-2">
            <Button tone="quiet" className="text-clay-ink" onClick={() => removeProfile(profile.id)}>
              Remove
            </Button>
            <Button tone="quiet" onClick={() => setConfirmDelete(false)}>
              Keep
            </Button>
          </div>
        </Sheet>
      )}
    </div>
  );
}
