"use client";

import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { InputPanel } from "./input-panel";
import { OutputPanel } from "./output-panel";
import { useMemo } from "react";
import { useMockator } from "@/providers/mockator-provider";
import { jsonToCsv, jsonToSql } from "@/lib/transformers";

export function Workbench() {
  const { output, outputFormat } = useMockator();

  const data = useMemo(() => {
    try {
      const parsed = JSON.parse(output);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }, [output]);

  const displayContent = useMemo(() => {
    if (!output) return "";

    if (outputFormat === "json") {
      return data.length ? JSON.stringify(data, null, 2) : output;
    }

    if (outputFormat === "sql") {
      return data.length ? jsonToSql(data) : output;
    }

    if (outputFormat === "csv") {
      return data.length ? jsonToCsv(data) : output;
    }

    return output;
  }, [data, output, outputFormat]);

  const editorLanguage = useMemo(() => {
    if (outputFormat === "json") return "json";
    if (outputFormat === "sql") return "sql";
    return "plaintext";
  }, [outputFormat]);

  return (
    <div className="flex-1 overflow-hidden flex flex-col md:flex-row w-full">
      {/* Desktop: Horizontal split with resizable panels */}
      <div className="hidden md:flex flex-1 overflow-hidden w-full">
        <ResizablePanelGroup
          direction="horizontal"
          className="flex-1 overflow-hidden w-full"
        >
          <ResizablePanel defaultSize={50} minSize={30} maxSize={70}>
            <InputPanel />
          </ResizablePanel>

          <ResizableHandle className="bg-zinc-700 hover:bg-blue-500 transition-colors" />

          <ResizablePanel defaultSize={50} minSize={30} maxSize={70}>
            <OutputPanel
              displayContent={displayContent}
              editorLanguage={editorLanguage}
            />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* Mobile: Vertical stack */}
      <div className="flex md:hidden flex-col flex-1 overflow-hidden w-full">
        <div className="flex-1 overflow-y-auto border-b border-zinc-700">
          <InputPanel />
        </div>
        <div className="flex-1 overflow-y-auto">
          <OutputPanel
            displayContent={displayContent}
            editorLanguage={editorLanguage}
          />
        </div>
      </div>
    </div>
  );
}
