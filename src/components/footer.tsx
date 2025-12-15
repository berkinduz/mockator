"use client";

import { Button } from "@/components/ui/button";
import { useMockator } from "@/providers/mockator-provider";
import { Sparkles, Loader2, AlertCircle } from "lucide-react";

export function Footer() {
  const { generate, isLoading, error } = useMockator();

  return (
    <footer className="border-t border-zinc-700 bg-zinc-900 px-3 sm:px-6 py-2 sm:py-3">
      <div className="flex flex-col gap-2">
        {error && (
          <div className="flex items-center gap-2 bg-red-900/20 border border-red-700/50 rounded-lg px-2 sm:px-3 py-2 text-red-400 text-xs sm:text-sm">
            <AlertCircle className="h-3 sm:h-4 w-3 sm:w-4 flex-shrink-0" />
            <span className="text-xs sm:text-sm truncate">{error}</span>
          </div>
        )}
        <Button
          onClick={generate}
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold py-2 rounded-lg transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="hidden sm:inline">Generating...</span>
              <span className="sm:hidden">Gen...</span>
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              <span className="hidden sm:inline">Generate Mock Data</span>
              <span className="sm:hidden">Generate</span>
            </>
          )}
        </Button>
      </div>
    </footer>
  );
}
