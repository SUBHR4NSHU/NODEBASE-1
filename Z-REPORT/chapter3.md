# Chapter 3: Methodology / System Design

---

## 3.1 Functional Requirements

Functional requirements define the specific behaviours and capabilities the system must provide to its users. The following functional requirements were identified for NODEBASE through analysis of the target use case and the implemented feature set.

### FR-1: User Authentication and Account Management

- **FR-1.1** The system shall allow new users to register an account using an email address and password.
- **FR-1.2** The system shall allow registered users to log in and maintain an authenticated session across browser tabs and page refreshes.
- **FR-1.3** The system shall allow users to log out, invalidating their current session.
- **FR-1.4** The system shall associate all workflows, nodes, credentials, and executions with the authenticated user's account.

### FR-2: Workflow Management

- **FR-2.1** The system shall allow authenticated users to create new, empty workflow pipelines with a user-defined name.
- **FR-2.2** The system shall allow users to view a list of all workflows belonging to their account.
- **FR-2.3** The system shall allow users to open an existing workflow for editing on the visual canvas.
- **FR-2.4** The system shall allow users to rename an existing workflow.
- **FR-2.5** The system shall allow users to delete a workflow and all its associated nodes, connections, and execution records.

### FR-3: Visual Workflow Editor

- **FR-3.1** The system shall provide an interactive, infinite canvas where users can add, position, and connect workflow nodes using a mouse or trackpad.
- **FR-3.2** The system shall support the following node types on the canvas: `INITIAL`, `MANUAL_TRIGGER`, `HTTP_REQUEST`, `GOOGLE_FORM_TRIGGER`, `STRIPE_TRIGGER`, `OPENAI`, `GEMINI`, `ANTHROPIC`, `SLACK`, `DISCORD`.
- **FR-3.3** The system shall allow users to create a directed connection (edge) between a source node's output handle and a target node's input handle.
- **FR-3.4** The system shall prevent the creation of connections that would introduce a cycle in the workflow graph.
- **FR-3.5** Each node shall display an inline configuration panel allowing users to enter node-specific parameters (e.g., prompt text, webhook URL, channel name).
- **FR-3.6** The system shall persist all canvas changes (node positions, configurations, connections) to the database automatically when the user saves.

### FR-4: Credential Management

- **FR-4.1** The system shall provide a credential vault where users can securely store API keys for supported providers: `OPENAI`, `ANTHROPIC`, `GEMINI`.
- **FR-4.2** Stored credentials shall be retrievable by name during workflow execution without being exposed in plaintext in the workflow configuration UI.
- **FR-4.3** Users shall be able to add, view (name only), and delete credentials.

### FR-5: Workflow Execution

- **FR-5.1** The system shall allow users to manually trigger the execution of a workflow from within the editor.
- **FR-5.2** The system shall support automatic workflow triggering from external events: HTTP webhooks, Google Form submissions, and Stripe payment events.
- **FR-5.3** The execution engine shall process workflow nodes in topological order, respecting inter-node data dependencies defined by connections.
- **FR-5.4** The output of each node shall be made available as input to all nodes directly downstream in the workflow graph.
- **FR-5.5** The system shall record the execution state of each workflow run with a status of `RUNNING`, `SUCCESS`, or `FAILED`.
- **FR-5.6** The system shall persist an `inngestEventId` for each execution, enabling traceability to the underlying durable event in Inngest.

### FR-6: Execution Monitoring

- **FR-6.1** The system shall provide a list view of all past and current executions for a given workflow, showing status and timestamp.
- **FR-6.2** Users shall be able to inspect the detailed log output of a specific execution, including per-node results and error messages.

### FR-7: Subscription Management

- **FR-7.1** The system shall integrate with the Polar billing platform to manage user subscription plans.
- **FR-7.2** Access to premium features (e.g., increased execution limits, additional node types) shall be gated based on the authenticated user's active subscription tier.

---

## 3.2 Non-Functional Requirements

Non-functional requirements define the quality attributes and operational constraints that the system must satisfy.

### NFR-1: Performance

- **NFR-1.1** The workflow editor canvas shall render smoothly at a minimum of 60 frames per second for workflows containing up to 50 nodes.
- **NFR-1.2** API responses for CRUD operations (workflow fetch, node save) shall complete within 500 milliseconds under normal load conditions.
- **NFR-1.3** Workflow execution shall begin within 2 seconds of a trigger event being received, excluding inherent external API latency (e.g., LLM inference time).

### NFR-2: Reliability and Durability

- **NFR-2.1** The execution engine shall be fault-tolerant: if a transient error occurs during a workflow step, the system shall automatically retry the step up to 3 times before marking the execution as `FAILED`.
- **NFR-2.2** No workflow execution event shall be lost due to application server restarts or crashes, as events are persisted by Inngest prior to processing.
- **NFR-2.3** The system shall maintain data integrity through database-level foreign key constraints and Prisma-enforced schema validation.

### NFR-3: Security

- **NFR-3.1** All communication between the client and server shall be transmitted over HTTPS/TLS.
- **NFR-3.2** User API credentials stored in the credential vault shall not be returned in plaintext via any API endpoint; only credential names/identifiers shall be exposed to the frontend.
- **NFR-3.3** All tRPC procedures that access or modify user data shall enforce authentication checks, rejecting unauthenticated requests with an appropriate HTTP 401 response.
- **NFR-3.4** Session tokens shall be stored as HTTP-only cookies to mitigate cross-site scripting (XSS) risks.

### NFR-4: Scalability

- **NFR-4.1** The architecture shall support horizontal scaling of the Next.js application layer without modification, leveraging stateless server components and Inngest's managed event queue.
- **NFR-4.2** The database schema shall support multi-tenancy through user-scoped data associations, allowing the user base to grow without schema changes.

### NFR-5: Maintainability

- **NFR-5.1** The codebase shall maintain end-to-end TypeScript type safety, ensuring that API contract changes propagate compile-time errors throughout the affected layers.
- **NFR-5.2** New node types shall be addable by implementing a standardised node component interface and a corresponding execution handler, without modifying the core execution engine.
- **NFR-5.3** Database schema migrations shall be managed through Prisma Migrate, providing a versioned, reproducible migration history.

### NFR-6: Usability

- **NFR-6.1** A new user with no prior experience in workflow automation shall be able to create and execute a simple two-node workflow (trigger → AI node) within 10 minutes of account creation.
- **NFR-6.2** Error messages displayed in the execution log shall be human-readable and provide sufficient context to identify the failing node and the nature of the error.

### NFR-7: Availability

- **NFR-7.1** The platform shall target 99.5% uptime for the web application layer during standard operating hours.
- **NFR-7.2** Planned maintenance windows shall not require permanent data loss or execution record deletion.

---

## 3.3 Hardware Requirements

NODEBASE is a cloud-native web application. As such, it does not impose rigid hardware requirements on end users. The requirements are categorised by deployment context.

### 3.3.1 Client-Side (End User)

| Component | Minimum Requirement | Recommended |
|---|---|---|
| **Processor** | Dual-core CPU (1.8 GHz) | Quad-core CPU (2.5 GHz+) |
| **RAM** | 4 GB | 8 GB |
| **Display Resolution** | 1280 × 720 | 1920 × 1080 or higher |
| **Network** | Broadband internet (5 Mbps) | Broadband internet (25 Mbps+) |
| **Browser** | Chrome 110+, Firefox 115+, Edge 110+ | Latest version of Chrome or Edge |
| **Input Device** | Mouse or trackpad | Mouse with scroll wheel (for canvas navigation) |

> **Note:** The visual canvas editor is optimised for desktop browsers. Mobile and tablet devices are not officially supported in the current release.

### 3.3.2 Server-Side (Deployment)

| Component | Minimum Requirement | Recommended (Production) |
|---|---|---|
| **Processor** | 2 vCPU | 4 vCPU |
| **RAM** | 2 GB | 4 GB |
| **Storage** | 20 GB SSD | 50 GB SSD |
| **Database** | PostgreSQL 14+ (shared or managed) | Managed PostgreSQL (e.g., Supabase, Neon, Railway) |
| **Network** | 100 Mbps uplink | 1 Gbps uplink |
| **OS** | Ubuntu 22.04 LTS / Debian 11+ | Ubuntu 22.04 LTS |

> The recommended deployment targets are serverless/container platforms such as **Vercel** (Next.js application) and **Railway** or **Supabase** (PostgreSQL database), which abstract hardware management entirely.

---

## 3.4 Software Requirements

### 3.4.1 Development Environment

| Software | Version | Purpose |
|---|---|---|
| **Node.js** | v20.x LTS | JavaScript runtime for server and build tools |
| **npm / pnpm** | 9.x / 8.x | Package manager |
| **Git** | 2.x | Version control |
| **PostgreSQL** | 15.x | Local development database |
| **Prisma CLI** | 5.x | Database schema management and migrations |

### 3.4.2 Runtime Dependencies (Key Packages)

| Package | Version | Role |
|---|---|---|
| `next` | 15.x | Full-stack React framework (App Router) |
| `react` | 19.x | UI component library |
| `@trpc/server` / `@trpc/client` | 11.x | Type-safe API layer |
| `@prisma/client` | 5.x | Database ORM query client |
| `inngest` | Latest | Durable background job execution |
| `@inngest/realtime` | Latest | Real-time execution status streaming |
| `@xyflow/react` | Latest | Visual node-graph canvas editor |
| `better-auth` | Latest | Authentication framework |
| `@polar-sh/better-auth` | Latest | Subscription billing integration |
| `openai` | 4.x | OpenAI GPT API client |
| `@anthropic-ai/sdk` | Latest | Anthropic Claude API client |
| `@google/generative-ai` | Latest | Google Gemini API client |
| `tailwindcss` | 3.x | Utility-first CSS framework |
| `@shadcn/ui` | Latest | Accessible React UI component library |
| `zod` | 3.x | TypeScript-first schema validation |

### 3.4.3 Deployment Software

| Software | Purpose |
|---|---|
| **Vercel** (or equivalent Node.js host) | Hosting the Next.js application |
| **Supabase / Railway / Neon** | Managed PostgreSQL database hosting |
| **Inngest Cloud** (or self-hosted) | Durable workflow execution event bus |
| **Polar** | Subscription and billing management |

---

## 3.5 Tools and Technologies Used

### 3.5.1 Frontend Technologies

**Next.js 15 (App Router)**
Next.js is a production-grade React framework developed by Vercel. The App Router, introduced in Next.js 13 and stabilised in version 15, uses a file-based routing system aligned with React Server Components (RSC). NODEBASE leverages RSC for server-side data fetching and rendering of workflow lists and execution histories, reducing client-side JavaScript bundle size and improving initial page load performance.

**React 19**
React 19 introduces improved concurrent rendering capabilities and the `use` hook for async data handling. NODEBASE uses React's component model to construct the node-based editor, configuration panels, and execution monitoring interfaces.

**Tailwind CSS & Shadcn UI**
Tailwind CSS provides a utility-first styling system. Shadcn UI provides an accessible, unstyled component library built on Radix UI primitives (Dialog, DropdownMenu, Tooltip, etc.), customised with Tailwind to match NODEBASE's design system. Together they enable rapid, consistent UI development without bespoke CSS files.

**`@xyflow/react` (React Flow)**
React Flow is the core library enabling the interactive workflow canvas. It provides the node and edge rendering infrastructure, pan/zoom controls, connection line rendering, and state management integration.

### 3.5.2 Backend Technologies

**tRPC**
tRPC enables the definition of backend API procedures in TypeScript that are directly consumable from the React frontend with full type inference. NODEBASE defines tRPC routers for each feature domain: `workflows`, `nodes`, `connections`, `executions`, `credentials`, and `subscriptions`. Each router exports type-safe procedures (queries and mutations) consumed via React Query hooks on the client.

**Prisma ORM**
Prisma serves as the interface between the Node.js application and the PostgreSQL database. The Prisma schema (`schema.prisma`) declaratively defines all models and their relationships. Running `prisma migrate dev` generates SQL migration files and applies them to the database. The generated Prisma Client is fully typed based on the schema, providing auto-completed, type-safe database queries.

**Inngest**
Inngest provides the durable, event-driven execution engine for NODEBASE workflows. Workflow executions are registered as Inngest functions that are triggered by named events. Each execution step within an Inngest function is automatically persisted and retried on failure. The `@inngest/realtime` package provides streaming capabilities for pushing live execution status updates to the frontend.

### 3.5.3 Database

**PostgreSQL 15**
PostgreSQL is an enterprise-grade open-source relational database. NODEBASE uses PostgreSQL for all persistent storage, including user accounts, workflow definitions, node configurations, connection topologies, execution records, and credential metadata. PostgreSQL's JSONB column type is used for storing variable node configuration payloads.

### 3.5.4 Authentication and Billing

**Better Auth**
Better Auth is a TypeScript-native authentication library providing session management, password hashing, and OAuth integration. It is integrated with Next.js middleware to protect server-side routes and with tRPC context to expose the authenticated user to all API procedures.

**Polar SDK**
Polar is an open-source merchant of record platform. The `@polar-sh/better-auth` plugin extends Better Auth to handle subscription state synchronisation between Polar's billing API and the NODEBASE user database.

### 3.5.5 Development Tools

| Tool | Purpose |
|---|---|
| **TypeScript 5.x** | Static type checking across the entire codebase |
| **ESLint** | Code linting and style enforcement |
| **Prettier** | Automated code formatting |
| **Prisma Studio** | Visual database browser for development |
| **VS Code** | Primary development IDE |
| **Postman / curl** | Manual API endpoint testing |

---

## 3.6 Algorithm and Workflow

This section describes the two core algorithmic processes that drive NODEBASE: the **DAG Traversal Algorithm** used by the execution engine to order node processing, and the **Inngest Event Execution Flow** that provides durable, step-by-step execution.

### 3.6.1 Workflow Execution — High-Level Overview

```
User Trigger / External Event
        │
        ▼
  Inngest Event Published
        │
        ▼
  Inngest Function Invoked
        │
        ▼
  ┌─────────────────────────┐
  │  Load Workflow from DB  │  ← Fetch all Nodes and Connections
  └────────────┬────────────┘
               │
               ▼
  ┌─────────────────────────┐
  │  Build Adjacency Graph  │  ← Map connections to node dependency graph
  └────────────┬────────────┘
               │
               ▼
  ┌─────────────────────────┐
  │  Topological Sort (DAG) │  ← Compute valid execution ordering
  └────────────┬────────────┘
               │
               ▼
  ┌─────────────────────────────────────────┐
  │  For each node in sorted order:         │
  │    1. Resolve input from upstream nodes │
  │    2. Execute node handler (step.run)   │
  │    3. Store output in execution context │
  │    4. Update execution status in DB     │
  └────────────┬────────────────────────────┘
               │
               ▼
  Mark Execution as SUCCESS or FAILED
```

### 3.6.2 Topological Sort Algorithm (DAG Traversal)

NODEBASE uses **Kahn's Algorithm** (BFS-based topological sort) to determine the execution order of nodes in a workflow.

**Algorithm:**

```
Input:  Set of nodes N, Set of directed edges E (connections)
Output: Ordered list σ representing execution sequence

1.  Compute in-degree for each node n ∈ N
    in_degree[n] = count of edges (u → n) in E

2.  Initialise queue Q with all nodes where in_degree[n] = 0
    (these are root/trigger nodes with no dependencies)

3.  Initialise result list σ = []

4.  While Q is not empty:
    a. Dequeue node u from Q
    b. Append u to σ
    c. For each edge (u → v) in E:
         i.  Decrement in_degree[v] by 1
         ii. If in_degree[v] = 0, enqueue v into Q

5.  If |σ| ≠ |N|, a cycle exists → reject workflow (invalid DAG)

6.  Return σ
```

**Complexity:** O(V + E) where V is the number of nodes and E is the number of connections.

**Cycle Detection:** If the final ordered list contains fewer nodes than the total node count, it implies that one or more nodes were never enqueued (their in-degree never reached zero), indicating a cycle. The system rejects such workflows at both the UI level (preventing cyclical connections via React Flow's `isValidConnection` callback) and the execution engine level.

### 3.6.3 Inngest Durable Step Execution

Within an Inngest function, each node execution is wrapped in a `step.run()` call. Inngest's execution model guarantees the following:

```
inngest.createFunction(
  { id: "execute-workflow" },
  { event: "workflow/execute" },
  async ({ event, step }) => {

    const sortedNodes = await step.run("build-dag", async () => {
      // Load workflow, build graph, run topological sort
      return topologicalSort(workflow.nodes, workflow.connections);
    });

    const context = {};  // Shared execution context for passing outputs

    for (const node of sortedNodes) {
      const result = await step.run(`execute-node-${node.id}`, async () => {
        const input = resolveInputFromContext(node, context);
        return executeNodeHandler(node, input);
      });
      context[node.id] = result;
    }

    // Mark execution as SUCCESS
  }
);
```

**Key Durability Properties:**

| Property | Description |
|---|---|
| **Step Persistence** | Each `step.run()` result is serialised and stored by Inngest. On a crash/retry, completed steps are replayed from stored results without re-execution. |
| **Automatic Retry** | Failed steps are retried up to the configured maximum (default: 3 attempts) with exponential back-off. |
| **Idempotency** | Because completed step outputs are persisted, re-running a partially completed workflow does not duplicate side effects (e.g., a Slack message is not sent twice). |
| **Event Traceability** | Every execution is linked to a unique `inngestEventId`, providing a complete audit trail in the Inngest dashboard. |

### 3.6.4 Node Handler Dispatch Pattern

Each node type is associated with a dedicated handler function. The dispatcher resolves the correct handler based on the node's `type` field:

```
function executeNodeHandler(node, input) {
  switch (node.type) {
    case "OPENAI":     return handleOpenAINode(node, input);
    case "GEMINI":     return handleGeminiNode(node, input);
    case "ANTHROPIC":  return handleAnthropicNode(node, input);
    case "SLACK":      return handleSlackNode(node, input);
    case "DISCORD":    return handleDiscordNode(node, input);
    case "HTTP_REQUEST": return handleHttpRequestNode(node, input);
    // ... additional handlers
    default: throw new Error(`Unknown node type: ${node.type}`);
  }
}
```

Each handler is a pure async function that:
1. Reads the node's configuration from its `metadata` JSON field (stored in PostgreSQL).
2. Retrieves any required API credential from the user's credential vault using the credential name stored in the node configuration.
3. Invokes the appropriate third-party SDK or HTTP client.
4. Returns a structured output object that is stored in the execution context for downstream nodes.

This dispatch pattern ensures that the core execution engine remains agnostic to the implementation details of individual node types, satisfying the **Open/Closed Principle** — the engine is open for extension (new node types can be added by registering new handlers) but closed for modification (the engine loop itself does not change).
