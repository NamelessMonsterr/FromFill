import {
  ArrowLeft,
  ClipboardCheck,
  Cloud,
  FileText,
  Home,
  Settings,
  Users,
} from "lucide-react";
import { useVault } from "@/lib/formfill/store";
import type { Screen } from "@/lib/formfill/types";
import { FillScreen } from "./fill";
import { FlowScreen } from "./flow";
import { HomeScreen } from "./home";
import { ImportScreen } from "./importer";
import { PeopleScreen } from "./people";
import { PersonScreen } from "./person";
import { SyncScreen } from "./sync";
import { IconButton, Wordmark } from "./ui";

const NAV: Array<{
  name: "home" | "people" | "import" | "fill" | "sync";
  label: string;
  icon: typeof Home;
  dock?: boolean;
}> = [
  { name: "home", label: "Home", icon: Home, dock: true },
  { name: "people", label: "Profiles", icon: Users, dock: true },
  { name: "import", label: "Documents", icon: FileText },
  { name: "fill", label: "Forms", icon: ClipboardCheck, dock: true },
  { name: "sync", label: "Settings", icon: Settings, dock: true },
];

export function Desk() {
  const screen = useVault((s) => s.screen);
  const go = useVault((s) => s.go);
  const profiles = useVault((s) => s.profiles);

  const back = (() => {
    if (screen.name === "person" || (screen.name === "import" && !screen.profileId) || screen.name === "flow") {
      return { name: "home" as const };
    }
    if (screen.name === "import" && screen.profileId) {
      return { name: "person" as const, profileId: screen.profileId };
    }
    return null;
  })();

  const title =
    screen.name === "person"
      ? (profiles.find((profile) => profile.id === screen.profileId)?.name ?? "Profile")
      : screen.name === "import"
        ? "Documents"
        : screen.name === "fill"
          ? "Forms"
          : screen.name === "flow"
            ? "How it works"
            : screen.name === "sync"
              ? "Settings"
              : screen.name === "people"
                ? "Profiles"
                : "Home";

  const active = (name: (typeof NAV)[number]["name"]) => {
    if (name === "people") return screen.name === "people" || screen.name === "person";
    if (name === "import") return screen.name === "import";
    if (name === "home") return screen.name === "home" || screen.name === "flow";
    return screen.name === name;
  };

  return (
    <div className="sky min-h-dvh text-ink">
      <div className="mx-auto grid min-h-dvh w-full max-w-[1440px] lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="hidden border-r border-edge/80 bg-desk-2/80 px-4 py-5 backdrop-blur-sm lg:flex lg:flex-col lg:gap-6">
          <Wordmark />
          <nav className="flex flex-col gap-1">
            {NAV.map((item) => {
              const Icon = item.icon;
              const on = active(item.name);
              return (
                <button
                  key={item.name}
                  type="button"
                  aria-current={on ? "page" : undefined}
                  onClick={() =>
                    go(item.name === "import" ? { name: "import", profileId: null } : { name: item.name })
                  }
                  className={`flex h-9 items-center gap-2 rounded-lg px-2 text-sm ${on ? "bg-panel-2 text-cream" : "text-mute"}`}
                >
                  <Icon className="size-4" aria-hidden="true" />
                  {item.name === "sync" ? "Sync & backup" : item.label}
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => go({ name: "flow" })}
              className="mt-6 flex h-9 items-center gap-2 rounded-lg px-2 text-sm text-mute"
            >
              <Cloud className="size-5" aria-hidden="true" />
              How it works
            </button>
          </nav>
        </aside>

        <div className="min-w-0">
          {screen.name !== "home" && (
            <header className="sticky top-0 z-20 border-b border-edge bg-desk/90 backdrop-blur-sm">
              <div className="flex items-center gap-1 px-2 py-2">
                {back ? (
                  <IconButton aria-label="Back" onClick={() => go(back)}>
                    <ArrowLeft className="size-5" />
                  </IconButton>
                ) : (
                  <span className="w-2" aria-hidden="true" />
                )}
                <span className="font-semibold">{title}</span>
              </div>
            </header>
          )}
          <main className={`px-6 pt-8 ${screen.name === "fill" ? "pb-40" : "pb-28"} lg:px-8 lg:pb-12`}>
            {screen.name === "home" && <HomeScreen />}
            {screen.name === "people" && <PeopleScreen />}
            {screen.name === "person" && <PersonScreen profileId={screen.profileId} />}
            {screen.name === "import" && <ImportScreen profileId={screen.profileId} />}
            {screen.name === "fill" && <FillScreen />}
            {screen.name === "flow" && <FlowScreen />}
            {screen.name === "sync" && <SyncScreen />}
          </main>
        </div>
      </div>
      <nav className="dock fixed inset-x-0 bottom-0 z-20 border-t border-edge bg-desk-2/95 backdrop-blur-sm lg:hidden">
        <div className="grid h-16 grid-cols-4">
          {NAV.filter((item) => item.dock).map((item) => {
            const Icon = item.icon;
            const on = active(item.name);
            return (
              <button
                key={item.name}
                type="button"
                aria-current={on ? "page" : undefined}
                onClick={() => {
                  if (item.name === "import") go({ name: "import", profileId: null });
                  else if (item.name === "home") go({ name: "home" });
                  else if (item.name === "people") go({ name: "people" });
                  else if (item.name === "fill") go({ name: "fill" });
                  else go({ name: "sync" });
                }}
                className={`flex flex-col items-center justify-center gap-0.5 text-xs ${on ? "text-ink" : "text-mute"}`}
              >
                <span className={on ? "text-ink" : ""}>
                  <Icon className="size-4" aria-hidden="true" />
                </span>
                {item.label}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
