"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMockator, ProviderId } from "@/providers/mockator-provider";

export function ApiKeySettings() {
  const {
    providerKeys,
    setProviderKeys,
    activeProvider,
    setActiveProvider,
    isApiKeyDialogOpen,
    setIsApiKeyDialogOpen,
    setError,
  } = useMockator();

  const providers: { id: ProviderId; label: string; placeholder: string }[] =
    useMemo(
      () => [
        { id: "openai", label: "OpenAI", placeholder: "sk-..." },
        { id: "anthropic", label: "Anthropic", placeholder: "sk-ant-..." },
        { id: "google", label: "Google Gemini", placeholder: "..." },
        { id: "groq", label: "Groq", placeholder: "gsk-..." },
      ],
      []
    );

  const [selectedProvider, setSelectedProvider] =
    useState<ProviderId>(activeProvider);
  const [draftKey, setDraftKey] = useState("");

  useEffect(() => {
    if (isApiKeyDialogOpen) {
      setSelectedProvider(activeProvider);
      setDraftKey(providerKeys[activeProvider] || "");
    }
  }, [activeProvider, providerKeys, isApiKeyDialogOpen]);

  const handleSave = () => {
    const trimmed = draftKey.trim();
    if (!trimmed) return;
    setProviderKeys({ ...providerKeys, [selectedProvider]: trimmed });
    setActiveProvider(selectedProvider);
    // Clear any previous error to make Generate usable immediately
    setError(null);
    // Close dialog after saving
    setIsApiKeyDialogOpen(false);
  };

  return (
    <Dialog open={isApiKeyDialogOpen} onOpenChange={setIsApiKeyDialogOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>API Keys</DialogTitle>
          <DialogDescription>
            Your API key is kept only in this tab’s memory and sent directly to
            the selected provider when generating. It is not persisted and will
            be cleared on refresh or close.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-200">
              Provider
            </label>
            <Select
              value={selectedProvider}
              onValueChange={(value) =>
                setSelectedProvider(value as ProviderId)
              }
            >
              <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                <SelectValue placeholder="Select provider" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-700 text-white">
                {providers.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-zinc-200">
              {providers.find((p) => p.id === selectedProvider)?.label} API Key
            </label>
            <Input
              type="password"
              placeholder={
                providers.find((p) => p.id === selectedProvider)?.placeholder
              }
              value={draftKey}
              onChange={(e) => setDraftKey(e.target.value)}
              autoComplete="off"
              className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
            />
          </div>
          <p className="text-xs text-zinc-400">
            Keys are transient (session-only) and cleared when you close or
            refresh the tab.
          </p>
        </div>

        <div className="border-t border-zinc-700 pt-3 mt-3">
          <p className="text-xs text-zinc-500">
            Questions or feedback?{" "}
            <a
              href="https://berkin.tech/en/about"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 hover:text-emerald-300 underline"
            >
              Get in touch
            </a>
          </p>
        </div>

        <DialogFooter>
          <Button
            onClick={handleSave}
            disabled={!draftKey.trim()}
            className="w-full sm:w-auto"
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
