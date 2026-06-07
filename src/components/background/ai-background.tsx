"use client";

/**
 * AIBackground — global ambient backdrop.
 * Pure CSS (no canvas / rAF) so it stays cheap and Lighthouse-friendly.
 * Three drifting aurora blobs + a slowly panning neural grid.
 * Fixed, behind everything, non-interactive, hidden from a11y tree.
 * Honors prefers-reduced-motion via globals.css (animations frozen).
 */
export function AIBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {/* Neural grid */}
      <div
        className="absolute inset-0 animate-grid-drift opacity-[0.18] dark:opacity-[0.12]"
        style={{
          backgroundImage:
            "linear-gradient(to right, color-mix(in oklch, var(--foreground) 100%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in oklch, var(--foreground) 100%, transparent) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage:
            "radial-gradient(ellipse 80% 60% at 50% 0%, black 20%, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 80% 60% at 50% 0%, black 20%, transparent 75%)",
        }}
      />

      {/* Aurora blobs */}
      <div
        className="absolute -top-40 -left-32 h-[38rem] w-[38rem] rounded-full blur-3xl animate-aurora"
        style={{
          background:
            "radial-gradient(circle at center, color-mix(in oklch, var(--brand-from) 55%, transparent), transparent 65%)",
        }}
      />
      <div
        className="absolute top-1/4 -right-40 h-[42rem] w-[42rem] rounded-full blur-3xl animate-float-slower"
        style={{
          background:
            "radial-gradient(circle at center, color-mix(in oklch, var(--brand-via) 50%, transparent), transparent 65%)",
        }}
      />
      <div
        className="absolute -bottom-48 left-1/3 h-[40rem] w-[40rem] rounded-full blur-3xl animate-float-slow"
        style={{
          background:
            "radial-gradient(circle at center, color-mix(in oklch, var(--brand-to) 45%, transparent), transparent 65%)",
        }}
      />

      {/* Fine grain to kill banding on gradients */}
      <div
        className="absolute inset-0 opacity-[0.015] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
    </div>
  );
}
