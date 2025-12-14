"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useMockator } from "@/providers/mockator-provider";
import { Copy, Check } from "lucide-react";
import { useState } from "react";
import dynamic from "next/dynamic";

interface OutputPanelProps {
  displayContent: string;
  editorLanguage: "json" | "sql" | "plaintext";
}

// Dynamically import Monaco Editor to avoid SSR issues
const MonacoEditor = dynamic(
  () => import("@monaco-editor/react").then((mod) => mod.default),
  {
    ssr: false,
    loading: () => (
      <div className="bg-zinc-800 rounded-md p-4 text-zinc-400">
        Loading editor...
      </div>
    ),
  }
);

export function OutputPanel({
  displayContent,
  editorLanguage,
}: OutputPanelProps) {
  const { outputFormat, setOutputFormat, isLoading, error } = useMockator();
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    if (!displayContent) return;
    await navigator.clipboard.writeText(displayContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-zinc-900">
      <Tabs
        value={outputFormat}
        onValueChange={(value) =>
          setOutputFormat(value as "json" | "sql" | "csv")
        }
        className="flex flex-col h-full"
      >
        <div className="border-b border-zinc-700 px-4 py-2 flex items-center justify-between">
          <TabsList className="grid w-auto grid-cols-3 bg-zinc-800">
            <TabsTrigger value="json" className="text-sm">
              JSON
            </TabsTrigger>
            <TabsTrigger value="sql" className="text-sm">
              SQL
            </TabsTrigger>
            <TabsTrigger value="csv" className="text-sm">
              CSV
            </TabsTrigger>
          </TabsList>

          <Button
            variant="ghost"
            size="sm"
            onClick={copyToClipboard}
            disabled={!displayContent}
            className="text-zinc-400 hover:text-white"
          >
            {copied ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
            <span className="ml-2 text-xs">{copied ? "Copied!" : "Copy"}</span>
          </Button>
        </div>

        <div className="flex-1 overflow-hidden px-4 py-3">
          {isLoading ? (
            <div className="flex items-center justify-center h-full text-zinc-400">
              <div className="text-center">
                <div className="animate-spin mb-3">
                  <svg
                    className="w-8 h-8 mx-auto"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <div className="animate-pulse">Generating mock data...</div>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full text-red-400">
              <div className="text-center">
                <div className="mb-3 text-4xl">⚠️</div>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          ) : displayContent ? (
            <div className="h-full border border-zinc-700 rounded-md overflow-hidden">
              <MonacoEditor
                height="100%"
                language={editorLanguage}
                theme="vs-dark"
                value={displayContent}
                options={{
                  minimap: { enabled: false },
                  fontSize: 13,
                  fontFamily: "Geist Mono, monospace",
                  scrollBeyondLastLine: false,
                  wordWrap: "on",
                  lineNumbers: "on",
                  readOnly: true,
                  tabSize: 2,
                }}
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-zinc-500 border border-dashed border-zinc-700 rounded-md">
              <p className="text-sm">
                Output will appear here after generation
              </p>
            </div>
          )}
        </div>
      </Tabs>
    </div>
  );
}
