# Slide 1
# NODEBASE: Visual Workflow Automation with Native AI
A Final Year Project

**Presenters:** [Your Name/Team]
**Date:** [Date]

---

# Slide 2
## Background & Motivation
- **The Integration Challenge:** Modern software relies on diverse APIs and services that must be wired together.
- **Rise of LLMs:** The emergence of Large Language Models (LLMs) requires integrations that go beyond simple API calls (e.g., prompt engineering, model selection).
- **Current Tool Limitations:** Existing tools (Zapier, Make.com) lack native AI support and rely on unreliable synchronous HTTP execution.
- **The Solution:** Visual programming via node-graph interfaces improves comprehension and accelerates automation development.

---

# Slide 3
## Problem Statement
Despite the availability of workflow tools, critical problems persist:
- **No Native AI Integration:** AI providers are treated as generic HTTP endpoints, forcing users to manage raw API schemas.
- **Unreliable Execution:** Long-running workflows fail silently due to transient errors or timeouts during synchronous execution.
- **Opaque Runtime Visibility:** Limited per-node state inspection and debugging.
- **Credential & Extensibility Constraints:** Managing API keys securely is difficult, and proprietary platforms are closed ecosystems.

---

# Slide 4
## What is NODEBASE?
**NODEBASE** is a visual, node-based workflow automation platform that merges node-graph editors with the power of modern AI providers.
- **Visual Interface:** Interactive drag-and-drop canvas for building automation pipelines.
- **First-Class AI:** Native integration of OpenAI GPT, Google Gemini, and Anthropic Claude.
- **Fault-Tolerant:** Durable, event-driven background execution with Inngest.
- **Open and Extensible:** Built on a modern, open-source stack.

---

# Slide 5
## Project Objectives
**Primary Objectives:**
1. **Visual Workflow Editor:** Drag-and-drop interface for composing connected, typed nodes.
2. **Native AI Integration:** Built-in OpenAI, Gemini, and Anthropic nodes with configuration panels.
3. **Durable Execution Engine:** Fault-tolerant DAG traversal with Inngest.
4. **Multi-Source Triggers:** Support for HTTP webhooks, Google Forms, and Stripe.
5. **Output Nodes:** Integration with external services like Slack and Discord.

---

# Slide 6
## System Architecture & Tech Stack
NODEBASE leverages a modern, type-safe full-stack architecture:
- **Frontend:** Next.js 15 (App Router), React 19, Tailwind CSS, Shadcn UI.
- **Workflow Canvas:** `@xyflow/react` (React Flow) for Directed Acyclic Graphs (DAG).
- **Backend & API:** tRPC for end-to-end type safety.
- **Database:** PostgreSQL managed via Prisma ORM.
- **Execution Engine:** Inngest for durable, event-driven background execution.
- **Auth & Billing:** Better Auth and Polar SDK.

---

# Slide 7
## Core Functionalities
- **Interactive DAG Editor:** Users can drag, connect, and configure nodes without writing code.
- **Real-Time Execution Feedback:** WebSockets push live status updates (RUNNING, SUCCESS, FAILED) to individual nodes.
- **Secure Credential Vault:** Per-user API key management, isolating raw secrets from the workflow configuration.
- **Executor Registry:** A plug-in architecture decoupling node dispatch from the core execution engine, ensuring easy extensibility.

---

# Slide 8
## Durable Execution Engine
**Powered by Inngest**
- **Fault-Tolerant Step Execution:** The `executeWorkflow` function traverses the DAG in dependency order using Kahn's topological sort.
- **State Persistence:** Each step's output is independently persisted, allowing automatic retries without re-running completed nodes.
- **Reliable Error Handling:** The `onFailure` callback accurately logs structured error data for actionable debugging.
- **Asynchronous Reliability:** Eliminates the risk of full-pipeline failure caused by a single transient API timeout.

---

# Slide 9
## Key Outcomes & Contributions
- **Fully Functional Platform:** An end-to-end deployable system enabling complex AI pipelines.
- **Native LLM Architecture:** A practical pattern for embedding inference into visual automation.
- **Execution Guarantees:** Step-level durability unparalleled in current open-source visual automation.
- **End-to-End Type Safety:** API changes propagate as compile-time errors from DB to UI.
- **Real-Time Canvas Trace:** Live visual feedback of workflow execution state.

---

# Slide 10
## Current Limitations
- **No Conditional Logic:** DAG model requires acyclic graphs; looping and conditional branches (IF/ELSE) are not yet supported.
- **Plaintext Credentials:** User API keys currently lack field-level encryption at rest.
- **Single-User Ownership:** No collaborative team workspaces or role-based access control (RBAC).
- **Linear Context Propagation:** Complex branching can lead to key collisions when merging context.

---

# Slide 11
## Future Scope
1. **Control-Flow Nodes:** Introduce `IF_ELSE` condition nodes and `FOR_EACH` loop constructs.
2. **Expanded Integrations:** Add support for Gmail, Notion, HubSpot, Airtable, and GitHub.
3. **Advanced AI Features:** Expose configuration for temperature, max tokens, tool calling, and streaming responses.
4. **Security & Collaboration:** Implement AES-256-GCM encryption for credentials and team workspaces with RBAC.
5. **Execution Scheduling:** Support for cron-based `SCHEDULE_TRIGGER` nodes.

---

# Slide 12
## Conclusion
- NODEBASE successfully bridges the gap between low-code visual programming and advanced AI automation.
- It proves that durable background execution and native LLM integration are technically achievable in an open-source platform.
- The project delivers a highly extensible, fault-tolerant, and type-safe architectural foundation.
- NODEBASE is positioned as a scalable prototype capable of evolving into a production-grade enterprise automation tool.
