"use client";

import { createContext, useContext, useState, useCallback } from "react";

export type InputMode = "natural-language" | "schema";
export type OutputFormat = "json" | "sql" | "csv";
export type ProviderId = "openai" | "anthropic" | "google" | "groq";

type ProviderKeys = Partial<Record<ProviderId, string>>;

interface MockatorContextType {
  // Input
  inputMode: InputMode;
  setInputMode: (mode: InputMode) => void;
  naturalLanguageInput: string;
  setNaturalLanguageInput: (text: string) => void;
  schemaInput: string;
  setSchemaInput: (text: string) => void;
  rowCount: number;
  setRowCount: (count: number) => void;

  // Output
  outputFormat: OutputFormat;
  setOutputFormat: (format: OutputFormat) => void;
  output: string;
  setOutput: (text: string) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;

  // API keys and provider
  providerKeys: ProviderKeys;
  setProviderKeys: (keys: ProviderKeys) => void;
  activeProvider: ProviderId;
  setActiveProvider: (provider: ProviderId) => void;
  isApiKeyDialogOpen: boolean;
  setIsApiKeyDialogOpen: (open: boolean) => void;

  // Actions
  generate: () => Promise<void>;
}

const MockatorContext = createContext<MockatorContextType | undefined>(
  undefined
);

export function MockatorProvider({ children }: { children: React.ReactNode }) {
  const [inputMode, setInputMode] = useState<InputMode>("natural-language");
  const [naturalLanguageInput, setNaturalLanguageInput] = useState("");
  const [schemaInput, setSchemaInput] = useState(`interface User {
  id: number;
  name: string;
  email: string;
  createdAt: Date;
}`);
  const [rowCount, setRowCount] = useState(10);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>("json");
  const [output, setOutput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [providerKeys, setProviderKeys] = useState<ProviderKeys>({});
  const [activeProvider, setActiveProvider] = useState<ProviderId>("openai");
  const [isApiKeyDialogOpen, setIsApiKeyDialogOpen] = useState(false);

  // No persistence: keys live only for the session and
  // disappear when the tab is closed or refreshed.

  const generate = useCallback(async () => {
    const input =
      inputMode === "natural-language" ? naturalLanguageInput : schemaInput;

    if (!input.trim()) {
      setError("Please enter some input before generating!");
      return;
    }

    const selectedKey = providerKeys[activeProvider];
    if (!selectedKey) {
      setError("Please add your API key in Settings (top right gear).");
      // Keep dialog closed; user can open it from header
      setIsApiKeyDialogOpen(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    setOutput("");

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Provider": activeProvider,
          "X-Api-Key": selectedKey,
        },
        body: JSON.stringify({
          inputMode,
          input,
          rowCount,
          // Always request JSON; downstream tabs transform client-side
          format: "json",
        }),
      });

      if (!response.ok) {
        let errorMessage = `HTTP Error: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          // If response is not JSON, use the status message
        }
        throw new Error(errorMessage);
      }

      // Handle streaming response
      if (response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });

            // toTextStreamResponse sends plain text chunks
            // Just append them as-is
            if (chunk) {
              setOutput((prev) => prev + chunk);
            }
          }
        } finally {
          reader.releaseLock();
        }
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to generate mock data";
      console.error("Generate error:", errorMessage);
      setError(errorMessage);
      setOutput("");
    } finally {
      setIsLoading(false);
    }
  }, [
    inputMode,
    naturalLanguageInput,
    schemaInput,
    rowCount,
    activeProvider,
    providerKeys,
  ]);

  // When provider or keys change, if the current provider has a key, clear any lingering error
  // This helps UX after saving a key so the red error disappears.
  const hasActiveKey = !!providerKeys[activeProvider]?.trim?.();
  if (hasActiveKey && error) {
    // Avoid setState during render loops; schedule microtask
    queueMicrotask(() => setError(null));
  }

  return (
    <MockatorContext.Provider
      value={{
        inputMode,
        setInputMode,
        naturalLanguageInput,
        setNaturalLanguageInput,
        schemaInput,
        setSchemaInput,
        rowCount,
        setRowCount,
        outputFormat,
        setOutputFormat,
        output,
        setOutput,
        isLoading,
        setIsLoading,
        error,
        setError,
        providerKeys,
        setProviderKeys,
        activeProvider,
        setActiveProvider,
        isApiKeyDialogOpen,
        setIsApiKeyDialogOpen,
        generate,
      }}
    >
      {children}
    </MockatorContext.Provider>
  );
}

export function useMockator() {
  const context = useContext(MockatorContext);
  if (!context) {
    throw new Error("useMockator must be used within MockatorProvider");
  }
  return context;
}
