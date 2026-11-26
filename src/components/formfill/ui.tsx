import { twMerge } from "tailwind-merge";
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";

export function cn(...parts: Array<string | false | null | undefined>) {
  return twMerge(parts.filter(Boolean).join(" "));
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  tone?: "stamp" | "paper" | "quiet" | "ghost";
};

export function Button({ tone = "stamp", className, type = "button", ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-3 text-sm font-medium disabled:opacity-40",
        tone === "stamp" && "bg-ink text-white",
        tone === "paper" && "border border-edge bg-panel text-ink",
        tone === "quiet" && "bg-cream-2 text-ink",
        tone === "ghost" && "bg-transparent text-ink",
        className,
      )}
      {...props}
    />
  );
}

export function IconButton({ className, type = "button", ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type={type}
      className={cn("inline-flex size-11 items-center justify-center rounded-md text-ink", className)}
      {...props}
    />
  );
}

export function Mark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "flex size-7 shrink-0 items-center justify-center rounded-sm bg-cream text-xs font-medium text-[#1f1b16]",
        className,
      )}
      aria-hidden="true"
    >
      F
    </span>
  );
}

export function Wordmark({ compact = false }: { compact?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2 text-base font-medium leading-none text-ink">
      <Mark />
      {compact ? null : "FormFill"}
    </span>
  );
}

export function Sheet({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <section className={cn("rounded-md border border-edge bg-panel text-ink", className)}>{children}</section>
  );
}

export function PaperInput({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "min-h-11 w-full rounded-md border border-rule bg-desk-2 px-3 text-base text-ink outline-none placeholder:text-mute/70 focus-visible:border-stamp",
        className,
      )}
      {...props}
    />
  );
}

export function PaperArea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-24 w-full rounded-md border border-rule bg-desk-2 px-3 py-2 text-base text-ink outline-none placeholder:text-mute/70 focus-visible:border-stamp",
        className,
      )}
      {...props}
    />
  );
}

export function AdSlot() {
  return (
    <aside className="rounded-md border border-dashed border-edge px-4 py-3" aria-label="Advertisement">
      <p className="text-xs font-medium tracking-widest text-mute uppercase">Ad</p>
      <p className="mt-1 text-base font-medium text-ink">Carbon & Rule</p>
      <p className="text-sm text-mute">
        Carbonless form sets, printed in Bengaluru. Same ad for everyone. It never reads a profile.
      </p>
    </aside>
  );
}
