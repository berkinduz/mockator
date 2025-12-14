"use client";

import { ShieldCheck } from "lucide-react";
import { useState } from "react";

export function PrivacyBadge() {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        className="flex items-center gap-2 rounded-md px-2 py-1 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/15 border border-emerald-700/30"
        aria-haspopup="dialog"
        aria-expanded={open}
        title="Local & Private"
      >
        <ShieldCheck className="h-4 w-4" />
        <span className="hidden sm:inline text-xs font-medium">
          Local & Private
        </span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 rounded-md border border-zinc-700 bg-zinc-900 shadow-lg p-3 z-50">
          <div className="text-sm font-semibold text-white mb-1">
            Your Keys are Safe
          </div>
          <div className="text-xs text-zinc-300">
            Mockator runs client-side. Your API keys are kept only in this tab’s
            memory and sent directly to your selected AI provider (OpenAI,
            Anthropic, Google, Groq). They never touch our servers.
          </div>
          <div className="mt-2 text-xs">
            <a
              href="https://github.com/yourname/mockator"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 hover:text-emerald-300"
            >
              Check the code
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
