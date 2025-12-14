"use client";

import { Github, Sparkles, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMockator } from "@/providers/mockator-provider";
import { ApiKeySettings } from "./api-key-settings";
import { PrivacyBadge } from "./privacy-badge";

export function Header() {
  const { setIsApiKeyDialogOpen } = useMockator();

  return (
    <header className="border-b border-zinc-700 bg-zinc-900 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-2xl font-bold text-white">
            <Sparkles className="h-6 w-6" />
            <span>Mockator</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <PrivacyBadge />
          <Button
            variant="ghost"
            size="icon"
            asChild
            className="text-zinc-400 hover:text-white"
          >
            <a
              href="https://github.com/berkinduz/mockator"
              target="_blank"
              rel="noopener noreferrer"
              title="GitHub"
            >
              <Github className="h-5 w-5" />
            </a>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsApiKeyDialogOpen(true)}
            className="text-zinc-400 hover:text-white"
            title="API Key Settings"
          >
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Render API Key settings dialog */}
      <ApiKeySettings />
    </header>
  );
}
