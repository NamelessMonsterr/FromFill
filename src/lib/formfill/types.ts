export type ProfileField = {
  id: string;
  label: string;
  value: string;
  keys: string[];
};

export type Section = {
  id: string;
  title: string;
  fields: ProfileField[];
};

export type Profile = {
  id: string;
  name: string;
  who: string;
  sections: Section[];
  updatedAt: number;
};

export type Screen =
  | { name: "home" }
  | { name: "people" }
  | { name: "person"; profileId: string }
  | { name: "import"; profileId: string | null }
  | { name: "fill" }
  | { name: "flow" }
  | { name: "sync" };

export type FormKind = "web" | "paper";

export type FormField = {
  id: string;
  label: string;
  group: string;
  kind: "text" | "textarea";
};

export type FormTemplate = {
  id: string;
  kind: FormKind;
  kicker: string;
  title: string;
  source: string;
  fields: FormField[];
};

export type Proposal = {
  id: string;
  label: string;
  value: string;
  section: string;
  confidence: "sure" | "check";
  source: string;
  accepted: boolean;
};
