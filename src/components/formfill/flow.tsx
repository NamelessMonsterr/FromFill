import { FARHAN_ID } from "@/lib/formfill/samples";
import { useVault } from "@/lib/formfill/store";
import { Sheet } from "./ui";

const STEPS: Array<{
  n: string;
  title: string;
  body: string;
  state: "Here" | "Partial" | "Not built";
  action: "people" | "person" | "import" | "fill" | "trip" | "sync";
}> = [
  {
    n: "01",
    title: "Keep a person",
    body: "You, a child, a parent — anyone you fill forms for.",
    state: "Here",
    action: "people",
  },
  {
    n: "02",
    title: "Name your own sections",
    body: "Identity, school, health, whatever the forms actually ask.",
    state: "Here",
    action: "person",
  },
  {
    n: "03",
    title: "Import, then check",
    body: "Paste or a text file. Sure lines and guesses stay separate until you save.",
    state: "Partial",
    action: "import",
  },
  {
    n: "04",
    title: "Choose who the form is for",
    body: "The extension asks for a person before it writes anything.",
    state: "Partial",
    action: "fill",
  },
  {
    n: "05",
    title: "Fill matches. Flag the rest.",
    body: "A confident answer goes in. A guess or a gap stays empty and marked.",
    state: "Here",
    action: "trip",
  },
  {
    n: "06",
    title: "Save a new answer back",
    body: "Type something the profile doesn't have. FormFill can offer to keep it.",
    state: "Here",
    action: "fill",
  },
  {
    n: "07",
    title: "One copy, app and extension",
    body: "The phone app and the browser extension are meant to share it, including offline.",
    state: "Not built",
    action: "sync",
  },
  {
    n: "08",
    title: "Free, with ads that stay out",
    body: "The direction is free with ads. Profile details are not for targeting.",
    state: "Here",
    action: "sync",
  },
];

export function FlowScreen() {
  const go = useVault((s) => s.go);
  const profiles = useVault((s) => s.profiles);
  const setFillForm = useVault((s) => s.setFillForm);
  const setFillProfile = useVault((s) => s.setFillProfile);

  const open = (action: (typeof STEPS)[number]["action"]) => {
    if (action === "people") go({ name: "people" });
    if (action === "person") {
      const id = profiles[0]?.id;
      if (id) go({ name: "person", profileId: id });
      else go({ name: "people" });
    }
    if (action === "import") go({ name: "import", profileId: null });
    if (action === "fill") go({ name: "fill" });
    if (action === "trip") {
      setFillForm("trip");
      if (profiles.some((profile) => profile.id === FARHAN_ID)) setFillProfile(FARHAN_ID);
      go({ name: "fill" });
    }
    if (action === "sync") go({ name: "sync" });
  };

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-4">
      <div>
        <h1 className="font-serif text-3xl text-cream">The flow</h1>
        <p className="mt-1 text-sm text-cream/70">
          What this preview can do, and what is still only a direction. Open any step.
        </p>
      </div>
      <ol className="flex flex-col gap-3">
        {STEPS.map((step) => (
          <li key={step.n}>
            <button type="button" onClick={() => open(step.action)} className="w-full text-left">
              <Sheet className="flex gap-3 p-4 transition-transform duration-150 ease-out active:scale-[0.96]">
                <span className="font-serif text-xl text-stamp tabular-nums">{step.n}</span>
                <span className="min-w-0">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="font-serif text-xl">{step.title}</span>
                    <StepState state={step.state} />
                  </span>
                  <span className="mt-1 block text-sm text-mute">{step.body}</span>
                </span>
              </Sheet>
            </button>
          </li>
        ))}
      </ol>
      <Sheet className="p-4">
        <h2 className="font-serif text-xl">Still outside this preview</h2>
        <ul className="mt-2 flex flex-col gap-2 text-sm text-mute">
          <li>A real browser extension on live websites.</li>
          <li>Reading PDF and Word forms, not just a paper facsimile.</li>
          <li>An encrypted copy, and Google sync between devices.</li>
        </ul>
      </Sheet>
    </div>
  );
}

function StepState({ state }: { state: "Here" | "Partial" | "Not built" }) {
  const className =
    state === "Not built"
      ? "bg-cream-2 text-clay-ink"
      : state === "Partial"
        ? "bg-cream-2 text-ink"
        : "bg-stamp text-white";
  return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${className}`}>{state}</span>;
}
