// Thin, geometric, monochrome glyphs in the SF-Symbols spirit — a single
// meaningful symbol for a suggestion, drawn in currentColor.

import type { ReactElement } from "react";

const PATHS: Record<string, ReactElement> = {
  rain: (
    <>
      <path d="M7 15a4 4 0 0 1 .5-7.95 5 5 0 0 1 9.6 1.4A3.5 3.5 0 0 1 17 15H7z" />
      <path d="M8.5 17.5 8 19.5M12 17.5 11.5 20M15.5 17.5 15 19.5" />
    </>
  ),
  cloud: <path d="M7 16a4 4 0 0 1 .5-7.95 5 5 0 0 1 9.6 1.4A3.5 3.5 0 0 1 17 16H7z" />,
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6 17 7M7 17l-1.4 1.4" />
    </>
  ),
  message: <path d="M5 7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-6l-4 3.5V15H7a2 2 0 0 1-2-2z" />,
  note: (
    <>
      <rect x="6" y="4.5" width="12" height="15" rx="2" />
      <path d="M9 9h6M9 12h6M9 15h4" />
    </>
  ),
  walk: (
    <>
      <circle cx="13" cy="5.4" r="1.7" />
      <path d="M13 8.2v4.6l-2.2 5.4M13 12.8l2.8 3.8M13 10.2l-3 1.1M13 10.2l2.9-1.4" />
    </>
  ),
  battery: (
    <>
      <rect x="4.5" y="8" width="13" height="8" rx="2.2" />
      <path d="M19 11v2" />
      <path d="M11.6 9.6 9.4 12.6h2l-1.6 2.4 3.4-3.2h-2z" fill="currentColor" stroke="none" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="7" />
      <path d="M12 8.2V12l2.6 1.6" />
    </>
  ),
  location: (
    <>
      <path d="M12 20s5.4-4.8 5.4-9a5.4 5.4 0 1 0-10.8 0c0 4.2 5.4 9 5.4 9z" />
      <circle cx="12" cy="11" r="1.8" />
    </>
  ),
  calendar: (
    <>
      <rect x="5" y="6" width="14" height="13" rx="2" />
      <path d="M5 10h14M9 4v3M15 4v3" />
    </>
  ),
  moon: <path d="M16 4.2a7 7 0 1 0 3.8 8.9A5.6 5.6 0 0 1 16 4.2z" />,
  idea: (
    <>
      <path d="M9 14.5a5 5 0 1 1 6 0c-.6.5-.9 1-.9 1.7v.3H9.9v-.3c0-.7-.3-1.2-.9-1.7z" />
      <path d="M10 19h4M10.5 21h3" />
    </>
  ),
  check: (
    <>
      <circle cx="12" cy="12" r="7.5" />
      <path d="M8.8 12.2l2.2 2.2 4.2-4.6" />
    </>
  ),
  ring: (
    <>
      <circle cx="12" cy="12" r="6.5" />
      <circle cx="12" cy="12" r="2" fill="currentColor" stroke="none" />
    </>
  ),
};

export function Glyph({ name, className }: { name: string; className?: string }) {
  const content = PATHS[name] ?? PATHS.ring;
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {content}
    </svg>
  );
}
