import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { Desk } from "@/components/formfill/desk";
import { useVault } from "@/lib/formfill/store";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const hydrate = useVault((s) => s.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return <Desk />;
}
