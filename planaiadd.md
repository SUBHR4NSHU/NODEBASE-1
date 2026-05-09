# Implementation Plan for Adding Nvidia NIM and OpenRouter Nodes

## Overview
This plan outlines the steps required to add two new AI nodes to NODEBASE: **Nvidia NIM** (preview free endpoint models) and **OpenRouter** (free models). Both of these providers offer OpenAI-compatible endpoints, which means we can leverage the existing `@ai-sdk/openai` package by configuring custom `baseURL`s.

## 1. Database Schema Update
- **File**: `prisma/schema.prisma`
- Add `NVIDIA` and `OPENROUTER` to the `NodeType` enum.
- Add `NVIDIA` and `OPENROUTER` to the `CredentialType` enum to securely store their respective API keys.
- Run `npx prisma generate` and `npx prisma db push` to synchronize changes with the local database.

## 2. Inngest Channels Configuration
- **File**: `src/inngest/channels/nvidia.ts`
  - Define the event channel for tracking the execution status of Nvidia nodes (`nvidiaChannel`).
- **File**: `src/inngest/channels/openrouter.ts`
  - Define the event channel for tracking the execution status of OpenRouter nodes (`openrouterChannel`).

## 3. Nvidia Execution Components
- **Directory**: `src/features/executions/components/nvidia/`
- **`node.tsx`**: Create the React Flow custom node using `BaseExecutionNode`.
- **`dialog.tsx`**: Build a configuration dialog that allows users to select from Nvidia's free preview models (e.g., `meta/llama3-70b-instruct`, `mistralai/mixtral-8x22b-instruct-v0.1`).
- **`executor.ts`**: Implement `nvidiaExecutor`. 
  - Use `createOpenAI` from `@ai-sdk/openai`.
  - Configure it with `baseURL: 'https://integrate.api.nvidia.com/v1'` and the decrypted Nvidia API key.
  - Wrap `generateText` with `step.ai.wrap` for Inngest execution.
- **`actions.ts`**: Provide server actions like `fetchNvidiaRealtimeToken` for live UI updates.

## 4. OpenRouter Execution Components
- **Directory**: `src/features/executions/components/openrouter/`
- **`node.tsx`**: Create the React Flow custom node.
- **`dialog.tsx`**: Build a configuration dialog that allows users to select from OpenRouter's free models (e.g., `huggingfaceh4/zephyr-7b-beta:free`, `meta-llama/llama-3-8b-instruct:free`).
- **`executor.ts`**: Implement `openrouterExecutor`.
  - Use `createOpenAI` from `@ai-sdk/openai`.
  - Configure it with `baseURL: 'https://openrouter.ai/api/v1'` and the decrypted OpenRouter API key.
- **`actions.ts`**: Provide server actions like `fetchOpenRouterRealtimeToken`.

## 5. UI Integration & Node Registration
- **File**: `src/components/node-selector.tsx`
  - Add Nvidia and OpenRouter to the `executionNodes` array to make them available in the drag-and-drop sidebar.
- **File**: `src/config/node-components.ts`
  - Map `NodeType.NVIDIA` to the Nvidia Node component and `NodeType.OPENROUTER` to the OpenRouter Node component.

## 6. Execution & Orchestration Wiring
- **File**: `src/features/executions/lib/executor-registry.ts`
  - Import the new executors.
  - Map `NodeType.NVIDIA` to `nvidiaExecutor`.
  - Map `NodeType.OPENROUTER` to `openrouterExecutor`.
- **File**: `src/inngest/functions.ts`
  - Import `nvidiaChannel` and `openrouterChannel`.
  - Add both channels to the `channels` array inside the `executeWorkflow` function so their statuses are reported correctly to the frontend.

## 7. Assets
- **Directory**: `public/logos/`
  - Add `nvidia.svg` and `openrouter.svg` for use in the UI node selector and node headers.

## Open Questions
> [!IMPORTANT]
> - **Model Selection:** Should the configuration dialog (`dialog.tsx`) hardcode a list of popular free models for these providers, or should it fetch the available models dynamically from their respective APIs? Hardcoding is easier but requires manual updates, whereas dynamic fetching provides all available models but requires an extra API call during configuration.
> - **System Prompt Handling:** Should we enforce a default system prompt for these models similar to the current OpenAI integration?
