# Implementation Plan for Adding Notion and Gmail Nodes

## 1. Database Schema Update
- **File**: `prisma/schema.prisma`
- Add `NOTION` and `GMAIL` to the `NodeType` enum.
- Add `NOTION` and `GMAIL` to the `CredentialType` enum to allow storing API keys and OAuth tokens.
- Run `npx prisma generate` and `npx prisma db push` to synchronize changes with the local database.

## 2. Inngest Channels Configuration
- **File**: `src/inngest/channels/notion.ts`
  - Define the event channel for tracking the execution status of Notion nodes (`notionChannel`).
- **File**: `src/inngest/channels/gmail.ts`
  - Define the event channel for tracking the execution status of Gmail nodes (`gmailChannel`).

## 3. Notion Execution Components
- **Directory**: `src/features/executions/components/notion/`
- **`node.tsx`**: Create the React Flow custom node. Use `BaseExecutionNode` and hook it up to the Notion dialog and realtime status updates.
- **`dialog.tsx`**: Build a configuration dialog (using React Hook Form and Zod) that allows users to configure properties like Action (e.g., "Create Page"), Database ID, and properties.
- **`executor.ts`**: Implement the `notionExecutor` function. This function will be triggered by Inngest to call the Notion API (using `ky` or `@notionhq/client`) and will update node statuses (`loading`, `success`, `error`) via the Inngest step framework.
- **`actions.ts`**: Provide server actions like `fetchNotionRealtimeToken` to allow the frontend node to subscribe to live status updates.

## 4. Gmail Execution Components
- **Directory**: `src/features/executions/components/gmail/`
- **`node.tsx`**: Create the React Flow custom node.
- **`dialog.tsx`**: Build the configuration form to capture "To", "Subject", and "Body" fields, supporting Handlebars for variable interpolation.
- **`executor.ts`**: Implement the `gmailExecutor` to interact with the Gmail API (using Nodemailer or REST API) and handle Inngest event publication for status updates.
- **`actions.ts`**: Implement `fetchGmailRealtimeToken` for status tracking.

## 5. UI Integration & Node Registration
- **File**: `src/components/node-selector.tsx`
  - Add Notion and Gmail to the `executionNodes` array to make them available in the sidebar (provide label, description, and SVG paths like `/logos/notion.svg` and `/logos/gmail.svg`).
- **File**: `src/config/node-components.ts`
  - Import the new React components and map `NodeType.NOTION` and `NodeType.GMAIL` to them in the `nodeComponents` object.

## 6. Execution & Orchestration Wiring
- **File**: `src/features/executions/lib/executor-registry.ts`
  - Map `NodeType.NOTION` to `notionExecutor` and `NodeType.GMAIL` to `gmailExecutor` inside `executorRegistry`.
- **File**: `src/inngest/functions.ts`
  - Import `notionChannel` and `gmailChannel`.
  - Add both channels to the `channels` array inside the `executeWorkflow` function so that they can communicate their status back to the frontend.

## 7. Assets
- **Directory**: `public/logos/`
  - Ensure `notion.svg` and `gmail.svg` exist in the public assets directory for the Node selector and UI rendering.
