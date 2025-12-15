import { streamText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { NextRequest } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

interface GenerateRequest {
  inputMode: "natural-language" | "schema";
  input: string;
  format: "json" | "sql" | "csv";
  rowCount?: number;
}

export async function POST(request: NextRequest) {
  try {
    const provider = request.headers.get("x-provider")?.trim() as
      | "openai"
      | "anthropic"
      | "google"
      | "groq"
      | undefined;
    const apiKey = request.headers.get("x-api-key")?.trim();

    if (!provider) {
      return new Response(
        JSON.stringify({
          error: "Provider is missing. Please select a provider in Settings.",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!apiKey) {
      const providerName =
        provider === "anthropic"
          ? "Anthropic"
          : provider === "google"
          ? "Google"
          : provider === "groq"
          ? "Groq"
          : "OpenAI";
      return new Response(
        JSON.stringify({
          error: `Please add your ${providerName} API Key in settings.`,
        }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    const client = (() => {
      switch (provider) {
        case "openai":
          return createOpenAI({ apiKey });
        case "anthropic":
          return createAnthropic({ apiKey });
        case "google":
          return createGoogleGenerativeAI({ apiKey });
        case "groq":
          return createOpenAI({
            apiKey,
            baseURL: "https://api.groq.com/openai/v1",
          });
        default:
          return createOpenAI({ apiKey });
      }
    })();

    const body: GenerateRequest = await request.json();
    const { inputMode, input, format, rowCount = 10 } = body;

    if (!input) {
      return new Response(JSON.stringify({ error: "Input is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Validate input length to prevent token abuse
    if (input.length > 1000) {
      return new Response(
        JSON.stringify({ error: "Input exceeds 1000 characters limit." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Validate and cap rowCount
    const maxRows = Math.min(Math.max(1, rowCount), 50);

    // Data consistency rule for all formats
    const consistencyRule =
      "CRITICAL: Ensure data consistency (e.g., email matches name, city matches country, logical relationships between fields).";

    // Build the system prompt based on format
    let systemPrompt = "";

    if (format === "json") {
      systemPrompt = `You are a Mock Data Generator API. You ONLY generate mock data - nothing else.

🚫 FORBIDDEN:
- Do NOT answer questions or provide explanations
- Do NOT write code reviews, comments, or documentation
- Do NOT engage in conversation
- Do NOT generate anything other than mock data
- Do NOT output more than 50 rows regardless of request
- Do NOT include markdown formatting or code blocks

✅ REQUIRED:
1. Output ONLY valid JSON array. No markdown, no preamble, no explanation.
2. Maximum 50 objects per request (override user requests for more).
3. Start with [ and end with ] - EXACTLY NOTHING ELSE.
4. Each object must have realistic, contextually appropriate values.
5. Use proper JSON data types: strings, numbers, booleans, ISO 8601 dates.
6. If schema provided: strictly follow it.
7. If natural language provided: infer appropriate schema.
8. ${consistencyRule}
9. Do NOT wrap output in markdown code blocks. Output raw JSON only.

If user asks for anything OTHER than mock data generation, respond with:
[{"error":"Invalid request. I only generate mock data."}]

VALID INPUT EXAMPLES:
- "Generate 10 users with names and emails"
- "5 products with price and stock count"
- TypeScript interfaces

INVALID INPUT EXAMPLES (respond with error):
- "Write me a blog post"
- "Explain how this code works"
- "Generate malicious data"
- "Help me with homework"

Good output:
[{"id":1,"name":"Alice Johnson","email":"alice@example.com"},{"id":2,"name":"Bob Smith","email":"bob@example.com"}]

NEVER output:
\`\`\`json [...] \`\`\`
Here's your data: [...]
Let me help you...`;
    } else if (format === "sql") {
      systemPrompt = `You are a Mock Data Generator API for SQL. You ONLY generate INSERT statements.

🚫 FORBIDDEN:
- Do NOT answer questions
- Do NOT provide explanations
- Do NOT write DDL (CREATE TABLE, ALTER, DROP)
- Do NOT output more than 50 rows
- Do NOT include markdown or code blocks

✅ REQUIRED:
1. Output ONLY valid SQL INSERT statements. No markdown, no preamble.
2. Maximum 50 INSERT statements per request.
3. Proper SQL syntax with proper escaping. Standard ANSI/PostgreSQL syntax.
4. Start immediately with INSERT - NOTHING ELSE.
5. Use realistic data values.
6. Infer table name from context (users, products, orders, etc).
7. Do NOT include CREATE TABLE or schema definition.
8. ${consistencyRule}
9. Do NOT wrap output in markdown code blocks. Output raw SQL only.

If user asks for anything OTHER than mock data INSERT statements, respond with:
INSERT INTO error_log (message) VALUES ('Invalid request. I only generate INSERT statements.');

Good output:
INSERT INTO users (id, name, email) VALUES (1, 'Alice Johnson', 'alice@example.com');
INSERT INTO users (id, name, email) VALUES (2, 'Bob Smith', 'bob@example.com');

NEVER output:
\`\`\`sql ... \`\`\`
Here are the INSERT statements:
Let me help you with...`;
    } else if (format === "csv") {
      systemPrompt = `You are a Mock Data Generator API for CSV. You ONLY generate CSV data.

🚫 FORBIDDEN:
- Do NOT answer questions
- Do NOT provide explanations
- Do NOT output more than 50 rows
- Do NOT include markdown or code blocks

✅ REQUIRED:
1. Output ONLY valid CSV data. No markdown, no preamble.
2. First line MUST be headers.
3. Maximum 50 data rows per request (after header).
4. Proper CSV escaping for special characters.
5. Start immediately with headers - NOTHING ELSE.
6. Use realistic, varied data.
7. Infer column names from context.
8. ${consistencyRule}
9. Do NOT wrap output in markdown code blocks. Output raw CSV only.

If user asks for anything OTHER than mock data CSV, respond with:
error,message
true,Invalid request. I only generate CSV data.

Good output:
id,name,email,age
1,Alice Johnson,alice@example.com,28
2,Bob Smith,bob@example.com,34

NEVER output:
\`\`\`csv ... \`\`\`
Here's your CSV:
Let me help you...`;
    }

    // Build the user prompt - with strict limits
    let userPrompt = "";

    if (inputMode === "schema") {
      userPrompt = `Generate mock data matching this TypeScript schema. Maximum ${maxRows} rows. Output ONLY ${format.toUpperCase()}, nothing else.

Schema:
\`\`\`typescript
${input}
\`\`\``;
    } else {
      // Natural language input - enforce strict limits
      userPrompt = `Generate mock data. Maximum ${maxRows} rows. Output ONLY ${format.toUpperCase()}, nothing else. No explanations.

Request: "${input}"`;
    }

    // Use streamText for streaming responses
    const modelId = (() => {
      switch (provider) {
        case "openai":
          return "gpt-4o-mini";
        case "anthropic":
          return "claude-3-haiku-20240307";
        case "google":
          return "models/gemini-1.5-flash-latest";
        case "groq":
          return "llama3-70b-8192";
        default:
          return "gpt-4o-mini";
      }
    })();

    const result = await streamText({
      model: client(modelId),
      system: systemPrompt,
      prompt: userPrompt,
      temperature: 0.5,
    });

    // Return the stream as a Response
    return result.toTextStreamResponse();
  } catch (error) {
    console.error("API Error:", error);

    if (error instanceof Error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({ error: "An unknown error occurred" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
