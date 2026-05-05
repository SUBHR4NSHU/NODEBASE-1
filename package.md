# 📦 NODEBASE — Package Reference

A full breakdown of every dependency and devDependency used in this project, what it does, and why it's here.

---

## 🚀 Scripts

| Script | Command | Purpose |
|---|---|---|
| `dev` | `next dev --turbopack` | Start Next.js dev server with Turbopack bundler |
| `build` | `next build --turbopack` | Build production bundle using Turbopack |
| `start` | `next start` | Run the built production server |
| `lint` | `biome check` | Run Biome linter/formatter checks |
| `format` | `biome format --write` | Auto-format all code with Biome |
| `ngrok:dev` | `ngrok http ...` | Expose local port 3000 via a fixed ngrok tunnel (for webhooks) |
| `inngest:dev` | `inngest-cli dev` | Start the local Inngest dev server |
| `dev:all` | `dotenv -- mprocs` | Load `.env` and run all dev processes concurrently with mprocs |

---

## 📦 Dependencies (Production)

### 🤖 AI & LLM Providers

| Package | Version | Description |
|---|---|---|
| `ai` | `^6.0.168` | **Vercel AI SDK** — Core SDK for streaming AI responses, tool calls, and structured outputs. The primary engine for all AI interactions in NODEBASE. |
| `@ai-sdk/openai` | `^3.0.53` | AI SDK provider for **OpenAI** models (GPT-4o, GPT-4, etc.). Plug-and-play adapter to use OpenAI via the Vercel AI SDK. |
| `@ai-sdk/anthropic` | `^3.0.71` | AI SDK provider for **Anthropic** models (Claude 3.5, Claude 3 Haiku, etc.). Lets NODEBASE send prompts to Claude. |
| `@ai-sdk/google` | `^3.0.64` | AI SDK provider for **Google Gemini** models. Enables use of Gemini 1.5 Pro/Flash through the unified AI SDK interface. |

---

### 🔐 Authentication & Billing

| Package | Version | Description |
|---|---|---|
| `better-auth` | `^1.6.9` | **Better Auth** — A modern, full-featured authentication library for Next.js. Handles sessions, OAuth providers, email/password, and more. |
| `@polar-sh/better-auth` | `^1.8.3` | Better Auth plugin that integrates **Polar.sh** billing directly into the auth layer. Links user subscriptions/payments to their session. |
| `@polar-sh/sdk` | `^0.46.7` | Official **Polar.sh SDK** — Used to interact with the Polar API for managing subscriptions, products, and checkouts programmatically. |

---

### 🗄️ Database & ORM

| Package | Version | Description |
|---|---|---|
| `@prisma/client` | `^7.8.0` | **Prisma ORM Client** — Auto-generated, type-safe database client for querying PostgreSQL. Used throughout the app for all DB reads/writes. |
| `@prisma/adapter-pg` | `^7.7.0` | Prisma adapter for the `pg` (node-postgres) driver. Allows Prisma to connect to PostgreSQL using the native `pg` library directly. |
| `pg` | `^8.20.0` | **node-postgres** — The core PostgreSQL client for Node.js. Used under the hood by Prisma to execute SQL queries against the database. |

---

### ⚡ Background Jobs & Realtime

| Package | Version | Description |
|---|---|---|
| `inngest` | `^3.54.0` | **Inngest SDK** — Durable, event-driven background job execution. Powers all async workflow steps, retries, and long-running AI executions in NODEBASE. |
| `@inngest/realtime` | `^0.4.6` | Inngest Realtime extension — Enables **live streaming of job progress** to the frontend via Server-Sent Events or WebSocket channels. |

---

### 🌐 Networking & HTTP

| Package | Version | Description |
|---|---|---|
| `ky` | `^2.0.2` | A tiny, elegant HTTP client built on the Fetch API. Used for making external API requests with retry logic, hooks, and clean syntax. |
| `dotenv` | `^17.4.1` | Loads environment variables from `.env` files into `process.env`. Used at runtime for configuration. |

---

### 🔑 IDs & Cryptography

| Package | Version | Description |
|---|---|---|
| `@paralleldrive/cuid2` | `^3.3.0` | Generates **collision-resistant, URL-safe unique IDs** (CUIDs). Used for creating IDs for workflows, nodes, executions, etc. |
| `cryptr` | `^6.4.0` | Simple AES-256-GCM **symmetric encryption/decryption** utility. Used to safely encrypt sensitive user data like API keys before storing in the DB. |

---

### 🎨 UI Framework & Styling

| Package | Version | Description |
|---|---|---|
| `next` | `15.5.4` | **Next.js** — The core React framework. Handles routing (App Router), Server Components, API routes, and SSR/SSG. |
| `react` | `19.1.0` | **React 19** — The UI rendering library. Used for all component-based UI construction. |
| `react-dom` | `19.1.0` | React's DOM renderer — binds React to the browser DOM. Required alongside `react`. |
| `radix-ui` | `^1.4.3` | **Radix UI** — Unstyled, accessible component primitives (Dialog, Dropdown, Tooltip, etc.). The design system foundation of NODEBASE's UI. |
| `@base-ui/react` | `^1.3.0` | **Base UI** by MUI — Another set of unstyled, accessible React primitives. Complements or extends Radix for additional headless components. |
| `tailwind-merge` | `^3.5.0` | Intelligently merges Tailwind CSS class strings, resolving conflicts. Essential when composing dynamic class names in components. |
| `clsx` | `^2.1.1` | Utility for conditionally joining class names. Used with `tailwind-merge` to build conditional `className` props cleanly. |
| `class-variance-authority` | `^0.7.1` | **CVA** — Defines component variants (e.g., `button size="sm"`) using a type-safe variant schema. Powers the component variant system (shadcn-style). |
| `next-themes` | `^0.4.6` | Theme management for Next.js — enables **dark/light mode** switching with zero flicker on load. |
| `lucide-react` | `^1.7.0` | **Lucide Icons** — A comprehensive, beautiful open-source icon library for React. Used for all iconography in the UI. |

---

### 🧩 Specialized UI Components

| Package | Version | Description |
|---|---|---|
| `@xyflow/react` | `^12.10.2` | **React Flow** — The **core node-based graph editor** library. Renders the visual workflow canvas where users build and connect nodes. This is central to NODEBASE. |
| `cmdk` | `^1.1.1` | **Command Menu** — A fast, accessible command palette component (`⌘K`). Used for the global search/action command bar. |
| `sonner` | `^2.0.7` | Beautiful, lightweight **toast notification** library for React. Used for success/error/info feedback messages. |
| `vaul` | `^1.1.2` | Animated **drawer/bottom sheet** component for React. Used for mobile-friendly slide-up panels. |
| `input-otp` | `^1.4.2` | Accessible **OTP/PIN input** component. Used for one-time password entry flows (e.g., email verification). |
| `embla-carousel-react` | `^8.6.0` | Lightweight, performant **carousel/slider** component. Used for multi-step wizards or image galleries in the UI. |
| `react-resizable-panels` | `^4.9.0` | **Resizable panel layouts** — Lets users drag to resize split panes (e.g., the canvas vs. the properties panel). |
| `react-day-picker` | `^9.14.0` | Flexible **date picker / calendar** component for React. Used in form fields requiring date selection. |
| `recharts` | `^3.8.0` | Composable **charting library** built on D3 + React. Used for rendering graphs, analytics dashboards, and usage stats. |

---

### 📝 Forms & Validation

| Package | Version | Description |
|---|---|---|
| `react-hook-form` | `^7.72.1` | **React Hook Form** — Performant, minimal-re-render form state management. Handles all form inputs, validation, and submission in NODEBASE. |
| `@hookform/resolvers` | `^5.2.2` | Adapters that connect `react-hook-form` with validation libraries (specifically `zod`). Enables schema-based form validation. |
| `zod` | `^4.3.6` | **Zod** — TypeScript-first schema validation and parsing library. Defines data shapes for forms, API inputs, and tRPC procedures throughout the app. |

---

### 🔄 State Management & Data Fetching

| Package | Version | Description |
|---|---|---|
| `@tanstack/react-query` | `^5.100.1` | **TanStack Query (React Query)** — Powerful async state management for server data: fetching, caching, background refetching, and mutations. |
| `@trpc/client` | `^11.16.0` | tRPC client — Makes end-to-end type-safe API calls from the React frontend. |
| `@trpc/server` | `^11.16.0` | **tRPC server** — Defines type-safe API routers and procedures on the Next.js backend. Eliminates the need for REST/GraphQL schemas. |
| `@trpc/tanstack-react-query` | `^11.16.0` | Official tRPC adapter for TanStack Query. Bridges tRPC calls with React Query's caching/loading/error state management. |
| `jotai` | `^2.19.1` | **Jotai** — Atomic, bottom-up state management for React. Used for lightweight, component-local or cross-component shared state (e.g., selected node, canvas state). |
| `nuqs` | `^2.8.9` | **nuqs** — Type-safe URL search parameter state management for Next.js. Syncs state to the URL query string (e.g., active tab, filters). |
| `superjson` | `^2.2.6` | Serializes JavaScript values that JSON can't handle natively (Dates, Maps, Sets, BigInt). Used by tRPC to safely transfer rich data types over HTTP. |

---

### 🛠️ Utilities & Helpers

| Package | Version | Description |
|---|---|---|
| `handlebars` | `^4.7.9` | **Handlebars.js** — A logic-less templating engine. Used in NODEBASE to let users define dynamic node prompts/configurations with `{{variable}}` syntax. |
| `html-entities` | `^2.6.0` | Encodes/decodes HTML entities (`&amp;`, `&lt;`, etc.). Used to safely handle text that may contain HTML when rendering content in the UI. |
| `date-fns` | `^4.1.0` | Modern **date utility library**. Provides functions for formatting, parsing, and manipulating dates (e.g., "2 hours ago", date ranges). |
| `random-word-slugs` | `^0.1.7` | Generates human-readable **random slugs** (e.g., `happy-blue-dolphin`). Used to auto-name new workflows or other entities. |
| `toposort` | `^2.0.2` | **Topological sort** algorithm. Critically used to determine the correct execution order of nodes in a workflow DAG (Directed Acyclic Graph). |
| `client-only` | `^0.0.1` | A guard package — importing it in a module causes a build error if that module is accidentally included in server-side code. |
| `server-only` | `^0.0.1` | The server-side counterpart — importing it ensures a module is never bundled for the client. Enforces the server/client boundary in Next.js App Router. |
| `react-error-boundary` | `^6.1.1` | A React component that catches JavaScript errors in child component trees and renders a fallback UI instead of crashing the whole app. |

---

### 📊 Monitoring & Error Tracking

| Package | Version | Description |
|---|---|---|
| `@sentry/nextjs` | `^10.50.0` | **Sentry** for Next.js — Automatic error tracking, performance monitoring, and session replay. Captures runtime exceptions and sends alerts for production issues. |

---

## 🔧 DevDependencies (Development Only)

### 🧹 Linting & Formatting

| Package | Version | Description |
|---|---|---|
| `@biomejs/biome` | `2.2.0` | **Biome** — An all-in-one, ultra-fast linter and formatter (replaces ESLint + Prettier). Enforces code style and catches issues at dev time. |

---

### 🎨 CSS & Styling Toolchain

| Package | Version | Description |
|---|---|---|
| `tailwindcss` | `^4` | **Tailwind CSS v4** — Utility-first CSS framework. Generates all atomic CSS classes used throughout the project's styling. |
| `@tailwindcss/postcss` | `^4` | PostCSS plugin for Tailwind CSS v4. Integrates Tailwind into the CSS build pipeline. |
| `tw-animate-css` | `^1.4.0` | Pre-built CSS animations compatible with Tailwind. Provides `animate-*` utility classes for entrance/exit transitions. |
| `shadcn` | `^4.2.0` | **shadcn/ui CLI** — Used to add, update, and manage pre-built accessible UI components (built on Radix + Tailwind) into the project. |

---

### 🏗️ Database Tooling

| Package | Version | Description |
|---|---|---|
| `prisma` | `^7.8.0` | **Prisma CLI** — Used to manage database migrations, generate the Prisma client, and introspect the database schema. Run via `npx prisma migrate dev`. |

---

### 🔤 TypeScript Type Definitions

| Package | Version | Description |
|---|---|---|
| `typescript` | `^5` | **TypeScript** compiler — Provides static typing for the entire codebase. Catches type errors at build time. |
| `@types/node` | `^20` | TypeScript types for **Node.js** built-in modules (`fs`, `path`, `process`, etc.). |
| `@types/react` | `^19` | TypeScript types for **React** — enables type checking on JSX and React APIs. |
| `@types/react-dom` | `^19` | TypeScript types for **React DOM** APIs. |
| `@types/pg` | `^8.20.0` | TypeScript types for the **`pg`** (node-postgres) library. |
| `@types/toposort` | `^2.0.7` | TypeScript types for the **`toposort`** library. |

---

### ⚙️ Developer Tooling

| Package | Version | Description |
|---|---|---|
| `tsx` | `^4.21.0` | TypeScript execution engine for Node.js. Allows running `.ts` files directly without compiling first (e.g., for seed scripts or CLI tools). |
| `dotenv-cli` | `^11.0.0` | CLI wrapper for `dotenv`. Injects `.env` variables into any shell command (used in the `dev:all` script with `dotenv -- mprocs`). |
| `mprocs` | `^0.7.3` | **mprocs** — Runs multiple terminal processes concurrently in a single terminal with a TUI dashboard. Used in `dev:all` to start Next.js + Inngest simultaneously. |
| `inngest-cli` | `^1.18.0` | **Inngest Dev Server CLI** — Provides a local dashboard to monitor, trigger, and debug Inngest background job executions during development. |

---

## 🔒 Overrides

| Package | Pinned Version | Reason |
|---|---|---|
| `import-in-the-middle` | `3.0.1` | Pinned to resolve version conflicts between OpenTelemetry instrumentation packages (`@prisma/instrumentation`, `@fastify/otel`, etc.) that required different versions of this transitive dependency. |

---

## 🗺️ Dependency Map

```
NODEBASE
├── Core Framework
│   ├── next (App Router, SSR, API Routes)
│   ├── react + react-dom
│   └── typescript
│
├── AI Layer
│   ├── ai (Vercel AI SDK)
│   ├── @ai-sdk/openai
│   ├── @ai-sdk/anthropic
│   └── @ai-sdk/google
│
├── Workflow Engine
│   ├── @xyflow/react (Canvas)
│   ├── inngest (Durable execution)
│   ├── @inngest/realtime (Live updates)
│   └── toposort (Execution ordering)
│
├── Data Layer
│   ├── @prisma/client + prisma
│   ├── @prisma/adapter-pg + pg
│   ├── @trpc/server + @trpc/client
│   └── @tanstack/react-query
│
├── Auth & Billing
│   ├── better-auth
│   ├── @polar-sh/better-auth
│   └── @polar-sh/sdk
│
├── UI System
│   ├── radix-ui + @base-ui/react
│   ├── tailwindcss + tailwind-merge + clsx
│   ├── class-variance-authority
│   └── lucide-react
│
└── State & Utilities
    ├── jotai (atom state)
    ├── nuqs (URL state)
    ├── zod (validation)
    ├── react-hook-form
    ├── handlebars (templating)
    └── cryptr (encryption)
```
