"use client";

import { useEffect, useState } from "react";

interface Props {
  className?: string;
  label?: string;
}

export default function DemoModalButton({
  className = "btn-pill btn-secondary text-center text-lg px-10 py-4",
  label = "See a profile",
}: Props) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button onClick={() => setOpen(true)} className={className} type="button">
        {label}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-ink/60 backdrop-blur-sm flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-200"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-cream rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-white">
              <div>
                <span className="text-[10px] font-sans uppercase tracking-[0.2em] text-gray-2">
                  A Marquee profile
                </span>
                <p className="font-sans font-bold text-lg leading-none mt-1">
                  marquee.bio/demo
                </p>
              </div>
              <div className="flex items-center gap-3">
                <a
                  href="/demo"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-sans text-gray hover:text-ink transition-colors"
                >
                  Open full page ↗
                </a>
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Close"
                  className="w-8 h-8 rounded-full bg-cream hover:bg-border transition-colors flex items-center justify-center"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path
                      d="M1 1L13 13M13 1L1 13"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Iframe of /demo — lets us show the real profile chrome */}
            <iframe
              src="/demo"
              className="flex-1 w-full border-0 bg-cream"
              title="Demo Marquee profile"
            />
          </div>
        </div>
      )}
    </>
  );
}
