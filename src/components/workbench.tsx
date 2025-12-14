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
    <ResizablePanelGroup
      direction="horizontal"
      className="flex-1 overflow-hidden"
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
  );
}
