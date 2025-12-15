"use client";

import { Github, Sparkles, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMockator } from "@/providers/mockator-provider";
import { ApiKeySettings } from "./api-key-settings";
import { PrivacyBadge } from "./privacy-badge";

export function Header() {
  const { setIsApiKeyDialogOpen } = useMockator();

  return (
    <header className="border-b border-zinc-700 bg-zinc-900 px-3 sm:px-6 py-3 sm:py-4 mb-3 sm:mb-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 sm:gap-2 text-xl sm:text-2xl font-bold text-white">
            <Sparkles className="h-5 sm:h-6 w-5 sm:w-6" />
            <span>Mockator</span>
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <div className="hidden sm:block">
            <PrivacyBadge />
          </div>
          <Button
            variant="ghost"
            size="icon"
            asChild
            className="text-zinc-400 hover:text-white h-9 w-9 sm:h-10 sm:w-10"
          >
            <a
              href="https://github.com/berkinduz/mockator"
              target="_blank"
              rel="noopener noreferrer"
              title="GitHub"
            >
              <Github className="h-4 sm:h-5 w-4 sm:w-5" />
            </a>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsApiKeyDialogOpen(true)}
            className="text-zinc-400 hover:text-white h-9 w-9 sm:h-10 sm:w-10"
            title="API Key Settings"
          >
            <Settings className="h-4 sm:h-5 w-4 sm:w-5" />
          </Button>
        </div>
      </div>

      {/* Render API Key settings dialog */}
      <ApiKeySettings />
    </header>
  );
}
