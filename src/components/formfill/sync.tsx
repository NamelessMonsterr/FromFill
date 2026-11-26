import { useState } from "react";
import { useVault } from "@/lib/formfill/store";
import { AdSlot, Button, Sheet } from "./ui";

export function SyncScreen() {
  const profiles = useVault((s) => s.profiles);
  const resetSamples = useVault((s) => s.resetSamples);
  const [confirm, setConfirm] = useState(false);
  const [exported, setExported] = useState(false);

  const download = () => {
    const blob = new Blob([JSON.stringify({ profiles }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "formfill-profiles.json";
    link.click();
    URL.revokeObjectURL(url);
    setExported(true);
  };

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-4">
      <div>
        <h1 className="font-serif text-3xl text-cream">Sync</h1>
        <p className="mt-1 text-sm text-cream/70">
          Where the copy is meant to live, and where it actually lives in this preview.
        </p>
      </div>

      <Sheet className="p-4">
        <p className="text-xs font-medium tracking-widest text-mute uppercase">This browser</p>
        <h2 className="mt-1 font-serif text-2xl">On this device only</h2>
        <p className="mt-2 text-sm text-mute">
          Profiles stay in this browser so you can leave and come back. That is ordinary storage for the
          design, not the encrypted vault. Nothing is sent to an account.
        </p>
      </Sheet>

      <Sheet className="p-4">
        <p className="text-xs font-medium tracking-widest text-mute uppercase">Google account</p>
        <h2 className="mt-1 font-serif text-2xl">Not connected</h2>
        <p className="mt-2 text-sm text-mute">
          The direction is one encrypted copy on the device, synced between the app and the extension
          through your Google account, including offline. Sync is not built here, so there is no connect
          button to pretend otherwise.
        </p>
        <p className="mt-3 text-sm font-medium text-clay-ink">Still to build</p>
      </Sheet>

      <Sheet className="p-4">
        <p className="text-xs font-medium tracking-widest text-mute uppercase">Ads</p>
        <h2 className="mt-1 font-serif text-2xl">Free, not targeted</h2>
        <p className="mt-2 text-sm text-mute">
          The product direction is free with ads. The ad below does not change based on who you have saved,
          and it cannot — it is not given the profiles.
        </p>
      </Sheet>
      <AdSlot />

      <div className="flex flex-wrap gap-2">
        <Button tone="paper" onClick={download}>
          Download a copy
        </Button>
        {!confirm ? (
          <Button tone="ghost" onClick={() => setConfirm(true)}>
            Restore samples
          </Button>
        ) : (
          <Button
            tone="paper"
            onClick={() => {
              resetSamples();
              setConfirm(false);
            }}
          >
            Replace with Amina and Farhan
          </Button>
        )}
      </div>
      {exported && <p className="text-sm text-cream/70">Downloaded formfill-profiles.json.</p>}
    </div>
  );
}
