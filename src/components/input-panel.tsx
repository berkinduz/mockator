"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useMockator } from "@/providers/mockator-provider";
import dynamic from "next/dynamic";

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

// Example prompts with emojis and detailed generation instructions
const EXAMPLE_PROMPTS = [
  {
    label: "🛍️ E-commerce Orders",
    prompt:
      "Generate 10 e-commerce orders with order_id, customer_name, total_price, status (pending/shipped/delivered), and order_date",
  },
  {
    label: "👥 CRM Users",
    prompt:
      "Generate 8 CRM users with name, email, company, role (Manager/Sales/Support), phone, and last_login date",
  },
  {
    label: "🪙 Crypto Transactions",
    prompt:
      "Generate 12 cryptocurrency transactions with transaction_id, from_address, to_address, amount, crypto_type (BTC/ETH), and timestamp",
  },
  {
    label: "✈️ Flight Schedules",
    prompt:
      "Generate 7 flight schedules with flight_number, airline, departure_time, arrival_time, origin_city, destination_city, and status (on-time/delayed)",
  },
  {
    label: "📦 Inventory Items",
    prompt:
      "Generate 15 inventory items with item_id, name, category, quantity_in_stock, reorder_level, unit_price, and last_updated date",
  },
];

export function InputPanel() {
  const {
    inputMode,
    setInputMode,
    naturalLanguageInput,
    setNaturalLanguageInput,
    schemaInput,
    setSchemaInput,
  } = useMockator();

  const maxChars = 1000;
  const charCount = naturalLanguageInput.length;
  const isNearLimit = charCount > maxChars * 0.9; // Orange at 90%
  const isAtLimit = charCount >= maxChars;
  const charCountColor = isAtLimit
    ? "text-red-500"
    : isNearLimit
    ? "text-orange-400"
    : "text-zinc-500";

  const handleExampleClick = (prompt: string) => {
    setNaturalLanguageInput(prompt);
  };

  return (
    <div className="flex flex-col h-full bg-zinc-900 border-r border-zinc-700">
      <Tabs
        value={inputMode}
        onValueChange={(value) =>
          setInputMode(value as "natural-language" | "schema")
        }
        className="flex flex-col h-full"
      >
        <div className="border-b border-zinc-700 px-4">
          <TabsList className="grid w-full grid-cols-2 bg-zinc-800">
            <TabsTrigger value="natural-language" className="text-sm">
              Natural Language
            </TabsTrigger>
            <TabsTrigger value="schema" className="text-sm">
              Schema (TS)
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent
          value="natural-language"
          className="flex-1 px-4 py-3 overflow-y-auto flex flex-col gap-3"
        >
          {/* Example Chips - Scrollable */}
          <div className="flex flex-wrap gap-2">
            {EXAMPLE_PROMPTS.map(({ label, prompt }, idx) => (
              <Button
                key={idx}
                variant="outline"
                size="sm"
                onClick={() => handleExampleClick(prompt)}
                className="whitespace-nowrap text-xs bg-zinc-800 border-zinc-600 hover:bg-blue-700 hover:border-blue-500 text-zinc-300 hover:text-white transition-colors"
                title={`Click to generate: ${prompt}`}
              >
                {label}
              </Button>
            ))}
          </div>

          {/* Textarea with Character Counter */}
          <div className="flex-1 flex flex-col">
            <Textarea
              placeholder='Describe the data you need... (e.g., "Generate 10 products for a pet shop with price and category")'
              value={naturalLanguageInput}
              onChange={(e) => {
                const value = e.target.value.slice(0, maxChars);
                setNaturalLanguageInput(value);
              }}
              maxLength={maxChars}
              className="flex-1 resize-none bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-zinc-500 focus:ring-1 focus:ring-zinc-600"
            />
            {/* Character Counter - Color Coded */}
            <div className="flex justify-between items-center mt-2">
              <div className="text-xs text-zinc-500">
                {isAtLimit && "⚠️ Character limit reached"}
              </div>
              <div
                className={`text-xs font-medium transition-colors ${charCountColor}`}
              >
                {charCount}/{maxChars}
              </div>
            </div>
          </div>

          {/* Safety & Guidance Info */}
          <div className="text-xs text-zinc-400 bg-zinc-800/50 rounded p-2.5 border border-zinc-700">
            <div className="font-medium text-zinc-300 mb-1">
              💡 Tips for Best Results:
            </div>
            <ul className="list-disc list-inside space-y-0.5 text-zinc-400">
              <li>Be specific about fields and data types</li>
              <li>Specify the quantity you need (e.g., 10, 15, 20)</li>
              <li>Maximum 50 rows per request for best performance</li>
              <li>Click example chips above to get started quickly</li>
            </ul>
          </div>
        </TabsContent>

        <TabsContent
          value="schema"
          className="flex-1 overflow-hidden px-4 py-3 flex flex-col gap-3"
        >
          <div className="flex-1 border border-zinc-700 rounded-md overflow-hidden">
            <MonacoEditor
              height="100%"
              language="typescript"
              theme="vs-dark"
              value={schemaInput}
              onChange={(value) => setSchemaInput(value || "")}
              options={{
                minimap: { enabled: false },
                fontSize: 13,
                fontFamily: "Geist Mono, monospace",
                scrollBeyondLastLine: false,
                wordWrap: "on",
                lineNumbers: "on",
                tabSize: 2,
              }}
              defaultValue="interface User {
  id: number;
  name: string;
  email: string;
  createdAt: Date;
}"
            />
          </div>

          {/* Schema Mode Info */}
          <div className="text-xs text-zinc-400 bg-zinc-800/50 rounded p-2.5 border border-zinc-700">
            <div className="font-medium text-zinc-300 mb-1">
              💡 Schema Mode Tips:
            </div>
            <ul className="list-disc list-inside space-y-0.5 text-zinc-400">
              <li>Define clear TypeScript interfaces for type safety</li>
              <li>Schema mode strictly follows your type definitions</li>
              <li>Supports complex nested types and arrays</li>
              <li>Maximum 50 rows per request limit applies</li>
            </ul>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
