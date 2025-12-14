# Mockator

> AI-powered mock data generator with polyglot output, multi-provider BYOK, and a polished, client-first UX.

![Next.js](https://img.shields.io/badge/Next.js-16.0.10-black)
![TypeScript](https://img.shields.io/badge/TypeScript-%5E5-blue)
![Status](https://img.shields.io/badge/Project-Private-lightgrey)

## Why Mockator?

Mockator sits between static libraries and generic chat interfaces:

- 🧱 **Faker.js**: Fast but static; hard to enforce relationships or output multiple formats.
- 💬 **Chat UIs**: Flexible but unstructured; formatting and consistency are often unreliable.
- 🚀 **Mockator**: Purpose-built for generating consistent, realistic mock data with strict output formats (JSON/SQL/CSV), schema following, and instant client-side transformers.

## Key Features

- **Schema Mode (TS)**: Paste TypeScript interfaces; output adheres to your schema.
- **Natural Language Mode**: Describe desired data; Mockator infers sensible schema.
- **Polyglot Output**: Generate once (JSON), then convert on the client to SQL or CSV without re-fetching.
- **Multi-Provider BYOK**: Use your own API keys for OpenAI, Anthropic, Google Gemini, or Groq.
- **Privacy-First (Session-Only)**: Keys are held only in memory in your browser tab and sent directly to the selected provider; no server-side storage and cleared on refresh/close.
- **Streaming UX**: Results stream into a Monaco editor with syntax highlighting.

## Tech Stack

Core libraries and exact versions (from `package.json`):

- **Next.js**: `16.0.10`
- **React**: `19.2.1`
- **Tailwind CSS**: `^4`
- **Monaco Editor (React)**: `^4.7.0`
- **Radix UI (Dialog/Tabs/Select)**: `@radix-ui/react-dialog@^1.1.15`, `@radix-ui/react-tabs@^1.1.13`, `@radix-ui/react-select@^2.2.6`
- **Shadcn UI foundations**: `class-variance-authority@^0.7.1`, `clsx@^2.1.1`, `tailwind-merge@^3.4.0`
- **Resizable Panels**: `react-resizable-panels@^3.0.6`
- **Icons**: `lucide-react@^0.561.0`
- **Vercel AI SDK**: `ai@^5.0.113`
- **AI Providers**: `@ai-sdk/openai@^2.0.86`, `@ai-sdk/anthropic@^2.0.56`, `@ai-sdk/google@^2.0.46`
- **Type Safety / Utils**: `typescript@^5`, `zod@^4.1.13`

## Architecture

- **Client-First Rendering**: UI is composed of `InputPanel` and `OutputPanel` inside a resizable workbench.
- **Stateless Server**: The API route accepts BYOK via headers and streams text back; no server key storage.
- **Session-Only Keys**: Keys are maintained in memory via `MockatorProvider` and the `ApiKeySettings` dialog.
- **Derived Output**: The app requests JSON once; client-side transformers derive SQL/CSV instantly when tabs change.

### Data Flow

1. User describes data (Natural Language) or pastes TypeScript (Schema).
2. `Generate` posts to `/api/generate` with headers `X-Provider` and `X-Api-Key`.
3. The API streams JSON text.
4. `Workbench` parses JSON and renders output; switching tabs triggers client-side conversion to SQL/CSV.

## Features in the Code

### Polyglot Output (Client-Side Transformers)

- File: `src/components/workbench.tsx`
- Transformers: `src/lib/transformers.ts`

The app always fetches JSON and uses two utilities to render other formats without additional network calls:

- `jsonToCsv(json: any[]): string`
  - Extracts headers from the first object.
  - Escapes values with quotes when needed and preserves booleans/dates.
- `jsonToSql(json: any[], tableName = 'mock_data'): string`
  - Infers columns from the first object.
  - Escapes strings and formats primitives, emitting `INSERT` statements.

`Workbench` memoizes parsed JSON and computed `displayContent`, and sets Monaco language dynamically (`json`, `sql`, or `plaintext`).

### Multi-Provider BYOK (Bring Your Own Key)

- Settings UI: `src/components/api-key-settings.tsx`
- Context/Actions: `src/providers/mockator-provider.tsx`
- API Route: `src/app/api/generate/route.ts`

Users select a provider (OpenAI, Anthropic, Google Gemini, Groq) and enter their API key in the Settings dialog. The key is kept in memory while the tab is open and sent via headers:

- `X-Provider`: one of `openai | anthropic | google | groq`
- `X-Api-Key`: the session-only API key

The server constructs the correct client (OpenAI/Groq compatible, Anthropic, Google Gemini) and streams results using the Vercel AI SDK.

### Privacy-First

- Keys are **not** persisted and **never** stored on our server.
- Keys live only in browser memory for the current tab and are cleared when you refresh or close.

## Getting Started

Clone, install, and run locally:

```bash
git clone https://github.com/yourname/mockator.git
cd mockator
pnpm install   # or: npm install / yarn
pnpm dev       # or: npm run dev
```

Open the app at `http://localhost:3000`.

### Configure Providers (BYOK)

- Click the gear icon in the header to open Settings.
- Select your provider (OpenAI, Anthropic, Google Gemini, Groq).
- Paste your API key and Save.
- Keys are held only for this tab session.

### Generate Data

- Natural Language: Type a description (e.g., “Generate 10 orders with id, customer, total, status, date”).
- Schema (TS): Paste an interface; the model follows it strictly.
- Pick output tab: JSON, SQL, or CSV.
- Click “Generate Mock Data”.

## Demo

![Mockator Screenshot](public/assets/screenshot-main.png)

## 🗺️ Roadmap & Future Plans

We are actively building Mockator into a robust, privacy-first SaaS for developers and data teams. Here’s what lies ahead:

- [ ] **👤 User Profiles & Cloud Sync**: Authentication (Supabase/Clerk) with a managed PostgreSQL database to save schemas, view generation history, and access your workbench from any device.
- [ ] **💳 SaaS Mode (No-Key Required)**: A managed subscription tier (Stripe) so users can generate data without bringing their own OpenAI/Anthropic keys. We’ll handle provider billing; you focus on outputs.
- [ ] **🌐 Public Schema Sharing**: Publish a schema and share it via a unique link (e.g., `mockator.com/s/e-commerce-v1`) to collaborate and standardize domain models.

## Contributing

Contributions are welcome! Please:

- Keep changes focused and well-scoped.
- Follow the existing component and provider patterns.
- Add or update documentation when needed.

## License

This project is currently private for portfolio demonstration purposes.

---

### File References

- Workbench: `src/components/workbench.tsx`
- Transformers: `src/lib/transformers.ts`
- Settings Dialog: `src/components/api-key-settings.tsx`
- Provider Context: `src/providers/mockator-provider.tsx`
- API Route: `src/app/api/generate/route.ts`
  This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).
