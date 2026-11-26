import { create } from "zustand";
import { keysFor, norm, withFormKey } from "./match";
import { AMINA_ID, createSeedProfiles, FORMS } from "./samples";
import type { Profile, ProfileField, Proposal, Screen, Section } from "./types";

const KEY = "formfill.desk.v1";

export type FillState = {
  formId: string;
  profileId: string | null;
  drafts: Record<string, string>;
};

type Persisted = {
  profiles: Profile[];
  onboarded: boolean;
  fill: { formId: string; profileId: string | null };
};

type Vault = {
  hydrated: boolean;
  onboarded: boolean;
  profiles: Profile[];
  screen: Screen;
  fill: FillState;
  hydrate: () => void;
  dismissOnboarding: () => void;
  go: (screen: Screen) => void;
  addProfile: (name: string, who: string) => string;
  removeProfile: (id: string) => void;
  updateProfileMeta: (id: string, patch: { name?: string; who?: string }) => void;
  addSection: (profileId: string, title: string) => void;
  renameSection: (profileId: string, sectionId: string, title: string) => void;
  removeSection: (profileId: string, sectionId: string) => void;
  addField: (profileId: string, sectionId: string, label: string, value: string) => void;
  updateField: (
    profileId: string,
    sectionId: string,
    fieldId: string,
    patch: Partial<Pick<ProfileField, "label" | "value">>,
  ) => void;
  removeField: (profileId: string, sectionId: string, fieldId: string) => void;
  setFillForm: (formId: string) => void;
  setFillProfile: (profileId: string) => void;
  setDraft: (fieldId: string, value: string) => void;
  saveAnswer: (args: {
    profileId: string;
    sectionTitle: string;
    label: string;
    value: string;
    formLabel: string;
    fieldId?: string;
    sectionId?: string;
  }) => void;
  importProposals: (args: {
    profileId: string | null;
    name: string;
    who: string;
    proposals: Proposal[];
  }) => string;
  resetSamples: () => void;
};

function uid(prefix: string): string {
  return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
}

function touch(profile: Profile): Profile {
  return { ...profile, updatedAt: Date.now() };
}

function mapProfile(profiles: Profile[], id: string, fn: (profile: Profile) => Profile): Profile[] {
  return profiles.map((profile) => (profile.id === id ? touch(fn(profile)) : profile));
}

function blankProfile(name: string, who: string): Profile {
  return {
    id: uid("p"),
    name,
    who,
    updatedAt: Date.now(),
    sections: [
      {
        id: uid("sec"),
        title: "Identity",
        fields: [
          {
            id: uid("fld"),
            label: "Full name",
            value: name,
            keys: ["full name", "full legal name", "legal name"],
          },
        ],
      },
    ],
  };
}

function initialFill(profiles: Profile[]): FillState {
  return {
    formId: FORMS[0]!.id,
    profileId: profiles.find((profile) => profile.id === AMINA_ID)?.id ?? profiles[0]?.id ?? null,
    drafts: {},
  };
}

function isProfile(value: unknown): value is Profile {
  if (!value || typeof value !== "object") return false;
  const profile = value as Profile;
  return typeof profile.id === "string" && typeof profile.name === "string" && Array.isArray(profile.sections);
}

function readPersisted(): Persisted | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as Partial<Persisted>;
    if (!Array.isArray(data.profiles) || !data.profiles.every(isProfile)) return null;
    return {
      profiles: data.profiles,
      onboarded: Boolean(data.onboarded),
      fill: {
        formId: typeof data.fill?.formId === "string" ? data.fill.formId : FORMS[0]!.id,
        profileId: typeof data.fill?.profileId === "string" ? data.fill.profileId : null,
      },
    };
  } catch {
    return null;
  }
}

function writePersisted(state: Vault) {
  const payload: Persisted = {
    profiles: state.profiles,
    onboarded: state.onboarded,
    fill: { formId: state.fill.formId, profileId: state.fill.profileId },
  };
  localStorage.setItem(KEY, JSON.stringify(payload));
}

function mergeProposals(profile: Profile, proposals: Proposal[]): Profile {
  const sections: Section[] = profile.sections.map((section) => ({
    ...section,
    fields: section.fields.map((field) => ({ ...field })),
  }));

  for (const item of proposals) {
    if (!item.accepted || !item.value.trim()) continue;
    let section = sections.find((entry) => norm(entry.title) === norm(item.section));
    if (!section) {
      section = { id: uid("sec"), title: item.section.trim() || "General", fields: [] };
      sections.push(section);
    }
    const existing = section.fields.find((field) => norm(field.label) === norm(item.label));
    if (existing) {
      existing.value = item.value.trim();
      existing.keys = [...new Set([...existing.keys, ...keysFor(item.label)])];
    } else {
      section.fields.push({
        id: uid("fld"),
        label: item.label.trim(),
        value: item.value.trim(),
        keys: keysFor(item.label),
      });
    }
  }

  return touch({ ...profile, sections });
}

export const useVault = create<Vault>((set, get) => ({
  hydrated: false,
  onboarded: false,
  profiles: createSeedProfiles(),
  screen: { name: "home" },
  fill: initialFill(createSeedProfiles()),

  hydrate: () => {
    if (get().hydrated) return;
    const saved = readPersisted();
    if (!saved) {
      set({ hydrated: true });
      return;
    }
    const profileId = saved.profiles.some((profile) => profile.id === saved.fill.profileId)
      ? saved.fill.profileId
      : (saved.profiles[0]?.id ?? null);
    set({
      hydrated: true,
      onboarded: saved.onboarded,
      profiles: saved.profiles,
      fill: { formId: saved.fill.formId, profileId, drafts: {} },
    });
  },

  dismissOnboarding: () => set({ onboarded: true }),

  go: (screen) => set({ screen }),

  addProfile: (name, who) => {
    const profile = blankProfile(name.trim(), who.trim() || "Other");
    set((state) => ({
      profiles: [...state.profiles, profile],
      screen: { name: "person", profileId: profile.id },
    }));
    return profile.id;
  },

  removeProfile: (id) =>
    set((state) => {
      const profiles = state.profiles.filter((profile) => profile.id !== id);
      const profileId =
        state.fill.profileId === id ? (profiles[0]?.id ?? null) : state.fill.profileId;
      const screen =
        state.screen.name === "person" && state.screen.profileId === id
          ? { name: "people" as const }
          : state.screen;
      return { profiles, screen, fill: { ...state.fill, profileId, drafts: {} } };
    }),

  updateProfileMeta: (id, patch) =>
    set((state) => ({
      profiles: mapProfile(state.profiles, id, (profile) => ({
        ...profile,
        name: patch.name?.trim() || profile.name,
        who: patch.who?.trim() || profile.who,
      })),
    })),

  addSection: (profileId, title) =>
    set((state) => ({
      profiles: mapProfile(state.profiles, profileId, (profile) => ({
        ...profile,
        sections: [
          ...profile.sections,
          { id: uid("sec"), title: title.trim() || "Untitled", fields: [] },
        ],
      })),
    })),

  renameSection: (profileId, sectionId, title) =>
    set((state) => ({
      profiles: mapProfile(state.profiles, profileId, (profile) => ({
        ...profile,
        sections: profile.sections.map((section) =>
          section.id === sectionId ? { ...section, title: title.trim() || section.title } : section,
        ),
      })),
    })),

  removeSection: (profileId, sectionId) =>
    set((state) => ({
      profiles: mapProfile(state.profiles, profileId, (profile) => ({
        ...profile,
        sections: profile.sections.filter((section) => section.id !== sectionId),
      })),
    })),

  addField: (profileId, sectionId, label, value) =>
    set((state) => ({
      profiles: mapProfile(state.profiles, profileId, (profile) => ({
        ...profile,
        sections: profile.sections.map((section) =>
          section.id === sectionId
            ? {
                ...section,
                fields: [
                  ...section.fields,
                  {
                    id: uid("fld"),
                    label: label.trim(),
                    value: value.trim(),
                    keys: keysFor(label),
                  },
                ],
              }
            : section,
        ),
      })),
    })),

  updateField: (profileId, sectionId, fieldId, patch) =>
    set((state) => ({
      profiles: mapProfile(state.profiles, profileId, (profile) => ({
        ...profile,
        sections: profile.sections.map((section) =>
          section.id === sectionId
            ? {
                ...section,
                fields: section.fields.map((field) => {
                  if (field.id !== fieldId) return field;
                  const label = patch.label !== undefined ? patch.label : field.label;
                  const value = patch.value !== undefined ? patch.value : field.value;
                  const keys =
                    patch.label !== undefined && norm(patch.label) !== norm(field.label)
                      ? [...new Set([...field.keys, ...keysFor(label)])]
                      : field.keys;
                  return { ...field, label, value, keys };
                }),
              }
            : section,
        ),
      })),
    })),

  removeField: (profileId, sectionId, fieldId) =>
    set((state) => ({
      profiles: mapProfile(state.profiles, profileId, (profile) => ({
        ...profile,
        sections: profile.sections.map((section) =>
          section.id === sectionId
            ? { ...section, fields: section.fields.filter((field) => field.id !== fieldId) }
            : section,
        ),
      })),
    })),

  setFillForm: (formId) =>
    set((state) => ({ fill: { ...state.fill, formId, drafts: {} } })),

  setFillProfile: (profileId) =>
    set((state) => ({ fill: { ...state.fill, profileId, drafts: {} } })),

  setDraft: (fieldId, value) =>
    set((state) => ({
      fill: { ...state.fill, drafts: { ...state.fill.drafts, [fieldId]: value } },
    })),

  saveAnswer: ({ profileId, sectionTitle, label, value, formLabel, fieldId, sectionId }) =>
    set((state) => ({
      profiles: mapProfile(state.profiles, profileId, (profile) => {
        const sections = profile.sections.map((section) => ({
          ...section,
          fields: section.fields.map((field) => ({ ...field })),
        }));
        const cleaned = value.trim();
        if (fieldId) {
          const section = sections.find((entry) => entry.fields.some((field) => field.id === fieldId));
          const field = section?.fields.find((entry) => entry.id === fieldId);
          if (field) {
            field.value = cleaned;
            field.keys = withFormKey(field, formLabel).keys;
            return { ...profile, sections };
          }
        }
        let section = sectionId ? sections.find((entry) => entry.id === sectionId) : undefined;
        if (!section) {
          section = sections.find((entry) => norm(entry.title) === norm(sectionTitle));
        }
        if (!section) {
          section = { id: uid("sec"), title: sectionTitle.trim() || "General", fields: [] };
          sections.push(section);
        }
        section.fields.push({
          id: uid("fld"),
          label: label.trim() || formLabel,
          value: cleaned,
          keys: [...new Set([...keysFor(label || formLabel), ...keysFor(formLabel)])],
        });
        return { ...profile, sections };
      }),
    })),

  importProposals: ({ profileId, name, who, proposals }) => {
    if (profileId) {
      set((state) => ({
        profiles: state.profiles.map((profile) =>
          profile.id === profileId ? mergeProposals(profile, proposals) : profile,
        ),
        screen: { name: "person", profileId },
      }));
      return profileId;
    }
    const base = blankProfile(name.trim() || "Imported person", who.trim() || "Other");
    const named = base.sections[0]?.fields[0];
    if (named && name.trim()) named.value = name.trim();
    const profile = mergeProposals(base, proposals);
    set((state) => ({
      profiles: [...state.profiles, profile],
      screen: { name: "person", profileId: profile.id },
      fill: { ...state.fill, profileId: profile.id },
    }));
    return profile.id;
  },

  resetSamples: () => {
    const profiles = createSeedProfiles();
    set({
      profiles,
      onboarded: true,
      screen: { name: "home" },
      fill: initialFill(profiles),
    });
  },
}));

if (typeof window !== "undefined") {
  useVault.subscribe((state) => {
    if (!state.hydrated) return;
    writePersisted(state);
  });
}
