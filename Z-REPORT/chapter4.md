# Chapter 4: Implementation / Experimentation

---

## 4.1 Implementation Details

### 4.1.1 Project Structure and Module Organisation

The NODEBASE codebase follows a **feature-sliced architecture**, grouping all code related to a domain concern under `src/features/<domain>/`. This isolates concerns and makes the codebase navigable.

```
NODEBASE/
├── prisma/
│   └── schema.prisma           # Database schema (single source of truth)
├── src/
│   ├── app/                    # Next.js App Router pages and API routes
│   │   ├── (auth)/             # Sign-in / sign-up pages
│   │   └── (dashboard)/        # Protected dashboard, editor, executions
│   ├── features/
│   │   ├── auth/               # Better Auth integration
│   │   ├── credentials/        # Credential vault (store/retrieve API keys)
│   │   ├── editor/             # React Flow canvas and node components
│   │   ├── executions/         # Execution display, node executors, hooks
│   │   ├── subscriptions/      # Polar billing integration
│   │   ├── triggers/           # Trigger node executors (Manual, HTTP, etc.)
│   │   └── workflows/          # Workflow CRUD, tRPC hooks
│   ├── inngest/
│   │   ├── client.ts           # Inngest client initialisation
│   │   ├── functions.ts        # Core executeWorkflow Inngest function
│   │   ├── utils.ts            # Topological sort + event dispatch helpers
│   │   └── channels/           # Per-node realtime channel definitions
│   ├── trpc/
│   │   ├── init.ts             # tRPC initialisation + auth context
│   │   ├── routers/_app.ts     # Root router (composes feature routers)
│   │   ├── client.tsx          # Client-side tRPC + React Query provider
│   │   └── server.tsx          # Server-side tRPC caller
│   ├── config/
│   │   └── node-components.ts  # Node type → React component mapping
│   └── lib/
│       ├── db.ts               # Prisma client singleton
│       └── auth.ts             # Better Auth + Polar configuration
```

---

### 4.1.2 Database Schema Implementation

The Prisma schema (`prisma/schema.prisma`) defines all core entities. Key design decisions are noted below.

**User and Authentication Models**

```prisma
model User {
  id            String       @id
  name          String
  email         String       @unique
  emailVerified Boolean      @default(false)
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt
  workflows     Workflow[]
  credentials   Credential[]
  sessions      Session[]
  accounts      Account[]
  @@map("user")
}
```

The `User` model is the root of all multi-tenant data. Every `Workflow` and `Credential` record carries a `userId` foreign key with `onDelete: Cascade`, ensuring complete data cleanup when a user account is deleted.

**Workflow, Node, and Connection Models**

```prisma
model Workflow {
  id          String       @id @default(cuid())
  name        String
  userId      String
  user        User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  nodes       Node[]
  connections Connection[]
  executions  Execution[]
  @@map("workflow")
}

model Node {
  id                String       @id @default(cuid())
  workflowId        String
  type              NodeType
  name              String
  position          Json          // {x: number, y: number} for canvas position
  data              Json          @default("{}") // node-type-specific config
  credentialId      String?
  credential        Credential?   @relation(...)
  outputConnections Connection[]  @relation("FromNode")
  inputConnections  Connection[]  @relation("ToNode")
}

model Connection {
  id         String @id @default(cuid())
  workflowId String
  fromNodeId String
  toNodeId   String
  fromOutput String @default("main")
  toInput    String @default("main")
  @@unique([fromNodeId, toNodeId, fromOutput, toInput])
}
```

The `Node.position` and `Node.data` fields are stored as JSON, allowing the canvas coordinates and node-specific configuration (e.g., webhook URL, AI prompt) to be persisted flexibly without schema changes for each new node type. The `Connection` model's composite unique constraint prevents duplicate edges.

**Execution Model**

```prisma
enum ExecutionStatus { RUNNING  SUCCESS  FAILED }

model Execution {
  id             String          @id @default(cuid())
  workflowId     String
  status         ExecutionStatus @default(RUNNING)
  error          String?         @db.Text
  errorStack     String?         @db.Text
  startedAt      DateTime        @default(now())
  completedAt    DateTime?
  inngestEventId String          @unique
  output         Json?
}
```

The `inngestEventId` field (unique) links every execution record to its corresponding Inngest event, enabling external traceability via the Inngest dashboard. The `output` JSON field stores the final accumulated execution context after all nodes complete.

---

### 4.1.3 tRPC API Layer

The root tRPC router (`src/trpc/routers/_app.ts`) composes three feature routers:

```typescript
export const appRouter = createTRPCRouter({
  workflows:   workflowsRouter,   // CRUD for workflows and nodes/connections
  credentials: credentialsRouter, // Manage API key vault entries
  executions:  executionsRouter,  // Fetch execution records and status
});

export type AppRouter = typeof appRouter;
```

All tRPC procedures run within an authenticated context. The `init.ts` file extracts the session from the incoming request and makes the `userId` available to every procedure:

```typescript
export const protectedProcedure = baseProcedure.use(async ({ ctx, next }) => {
  if (!ctx.session?.user) throw new TRPCError({ code: 'UNAUTHORIZED' });
  return next({ ctx: { ...ctx, user: ctx.session.user } });
});
```

On the frontend, tRPC is consumed via auto-generated React Query hooks. For example, fetching a workflow:

```typescript
const { data: workflow } = useSuspenseWorkflow(workflowId);
// Internally calls: trpc.workflows.get.useSuspenseQuery({ id: workflowId })
```

This provides full TypeScript type inference from the Prisma model through the tRPC procedure to the React component, eliminating manual type definitions at the API boundary.

---

### 4.1.4 Visual Workflow Editor (React Flow)

The editor (`src/features/editor/components/editor.tsx`) wraps React Flow with NODEBASE's custom node types and canvas configuration:

```typescript
export const Editor = ({ workflowId }: { workflowId: string }) => {
  const { data: workflow } = useSuspenseWorkflow(workflowId);
  const [nodes, setNodes] = useState<Node[]>(workflow.nodes);
  const [edges, setEdges] = useState<Edge[]>(workflow.edges);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={(changes) => setNodes(applyNodeChanges(changes, nodes))}
      onEdgesChange={(changes) => setEdges(applyEdgeChanges(changes, edges))}
      onConnect={(params) => setEdges(addEdge(params, edges))}
      nodeTypes={nodeComponents}   // Custom node type → component mapping
      snapGrid={[10, 10]}
      snapToGrid
    >
      <Background />
      <Controls />
      <MiniMap />
      <Panel position="top-right"><AddNodeButton /></Panel>
      {hasManualTrigger && (
        <Panel position="bottom-center">
          <ExecuteWorkflowButton workflowId={workflowId} />
        </Panel>
      )}
    </ReactFlow>
  );
};
```

**Node Type Registry** (`src/config/node-components.ts`) maps each `NodeType` enum value to its React component, which React Flow uses to render the correct UI for each node on the canvas.

**Node Component Pattern** — Each node follows a consistent implementation pattern, illustrated by the Slack node:

```typescript
export const SlackNode = memo((props: NodeProps<SlackNodeType>) => {
  const nodeStatus = useNodeStatus({
    nodeId: props.id,
    channel: SLACK_CHANNEL_NAME,
    topic: 'status',
    refreshToken: fetchSlackRealtimeToken,
  });

  return (
    <>
      <SlackDialog ... />          {/* Configuration dialog */}
      <BaseExecutionNode
        icon='/logos/slack.svg'
        name='Slack'
        status={nodeStatus}        {/* Real-time execution status */}
        description={description}
        onSettings={handleOpenSettings}
      />
    </>
  );
});
```

The `useNodeStatus` hook subscribes to an Inngest realtime channel scoped to the node's ID, enabling live status updates (RUNNING / SUCCESS / FAILED) to appear on each canvas node during execution — without polling.

---

### 4.1.5 Execution Engine (Inngest Function)

The core execution logic resides in `src/inngest/functions.ts`. The `executeWorkflow` function is registered as an Inngest durable function triggered by the `workflows/execute.workflow` event:

```typescript
export const executeWorkflow = inngest.createFunction(
  {
    id: "execute-workflow",
    retries: process.env.NODE_ENV === 'production' ? 3 : 0,
    onFailure: async ({ event }) => {
      // Mark execution as FAILED in DB with error details
      await prisma.execution.update({
        where: { inngestEventId: event.data.event.id },
        data: { status: ExecutionStatus.FAILED, error: event.data.error.message },
      });
    },
  },
  { event: "workflows/execute.workflow" },
  async ({ event, step, publish }) => {
    // Step 1: Create execution record
    await step.run('create-execution', () =>
      prisma.execution.create({ data: { workflowId, inngestEventId } })
    );

    // Step 2: Load workflow and compute topological order
    const sortedNodes = await step.run('prepare-workflow', async () => {
      const workflow = await prisma.workflow.findUniqueOrThrow({
        where: { id: workflowId },
        include: { nodes: true, connections: true },
      });
      return topologicalSort(workflow.nodes, workflow.connections);
    });

    // Step 3: Execute each node in dependency order
    let context = event.data.initialData || {};
    for (const node of sortedNodes) {
      const executor = getExecutor(node.type as NodeType);
      context = await executor({ data: node.data, nodeId: node.id, userId, context, step, publish });
    }

    // Step 4: Mark execution SUCCESS
    await step.run('update-execution', () =>
      prisma.execution.update({
        where: { inngestEventId },
        data: { status: ExecutionStatus.SUCCESS, completedAt: new Date(), output: context },
      })
    );
  }
);
```

---

### 4.1.6 Topological Sort Implementation

`src/inngest/utils.ts` implements the DAG traversal using the `toposort` npm library:

```typescript
export const topologicalSort = (nodes: Node[], connections: Connection[]): Node[] => {
  if (connections.length === 0) return nodes;

  // Build edges array: [fromNodeId, toNodeId]
  const edges: [string, string][] = connections.map((c) => [c.fromNodeId, c.toNodeId]);

  // Include isolated nodes (no connections) as self-edges
  const connected = new Set(connections.flatMap((c) => [c.fromNodeId, c.toNodeId]));
  for (const node of nodes) {
    if (!connected.has(node.id)) edges.push([node.id, node.id]);
  }

  try {
    const sortedIds = [...new Set(toposort(edges))];
    const nodeMap = new Map(nodes.map((n) => [n.id, n]));
    return sortedIds.map((id) => nodeMap.get(id)!).filter(Boolean);
  } catch (error) {
    if (error instanceof Error && error.message.includes('Cyclic')) {
      throw new Error('Workflow contains a cycle');
    }
    throw error;
  }
};
```

---

### 4.1.7 Executor Registry Pattern

The Executor Registry (`src/features/executions/lib/executor-registry.ts`) maps every `NodeType` to its handler function, implementing the **Strategy Pattern**:

```typescript
export const executorRegistry: Record<NodeType, NodeExecutor> = {
  [NodeType.MANUAL_TRIGGER]:      manualTriggerExecutor,
  [NodeType.HTTP_REQUEST]:        httpRequestExecutor,
  [NodeType.GOOGLE_FORM_TRIGGER]: googleFormTriggerExecutor,
  [NodeType.STRIPE_TRIGGER]:      stripeTriggerExecutor,
  [NodeType.GEMINI]:              geminiExecutor,
  [NodeType.OPENAI]:              openaiExecutor,
  [NodeType.ANTHROPIC]:           anthropicExecutor,
  [NodeType.DISCORD]:             discordExecutor,
  [NodeType.SLACK]:               slackExecutor,
  [NodeType.INITIAL]:             manualTriggerExecutor,
};

export const getExecutor = (type: NodeType): NodeExecutor => {
  const executor = executorRegistry[type];
  if (!executor) throw new Error(`No executor found for type: ${type}`);
  return executor;
};
```

Each `NodeExecutor` is a typed async function with the signature:

```typescript
type NodeExecutor = (params: {
  data:    Record<string, unknown>;  // Node configuration from DB
  nodeId:  string;
  userId:  string;
  context: Record<string, unknown>;  // Accumulated outputs from upstream nodes
  step:    InngestStepTools;         // Inngest step wrapper for durability
  publish: InngestPublish;           // Realtime channel publisher
}) => Promise<Record<string, unknown>>;
```

Adding a new node type requires only: (1) a new executor function, (2) a new entry in `executorRegistry`, and (3) a new React node component — without touching the execution engine.

---

### 4.1.8 Execution Monitoring Interface

The `ExecutionView` component (`src/features/executions/components/execution.tsx`) renders the status, timing, output, and error details of a workflow run:

| Field Displayed | Source |
|---|---|
| Status (Running / Success / Failed) | `Execution.status` enum with matching icon and colour |
| Workflow name (linked) | `Execution.workflow.name` via Prisma relation include |
| Started / Completed timestamps | `Execution.startedAt`, `Execution.completedAt` (relative time via `date-fns`) |
| Duration | Computed as `completedAt - startedAt` in seconds |
| Inngest Event ID | `Execution.inngestEventId` for external tracing |
| Error message | `Execution.error` rendered in a red alert box |
| Stack trace (collapsible) | `Execution.errorStack` in a monospace `<pre>` block |
| JSON output | `Execution.output` pretty-printed with `JSON.stringify(..., null, 2)` |

---

## 4.2 Screenshots and Interface Descriptions

The following section describes the key interfaces of NODEBASE. Corresponding screenshots should be inserted at the indicated placeholders.

---

### 4.2.1 Dashboard — Workflow List

**[Insert Image: Workflow List Dashboard]**

The dashboard presents a card-based grid of all workflows belonging to the authenticated user. Each card displays the workflow name, creation date, and quick-action buttons (Open Editor, View Executions, Delete). A prominent "New Workflow" button initiates workflow creation via a modal dialog.

---

### 4.2.2 Visual Workflow Editor — Canvas

**[Insert Image: Workflow Editor Canvas with Multiple Nodes]**

The editor occupies the full browser viewport. Key UI elements include:

- **Canvas area:** Infinite scrollable grid with snap-to-grid alignment (10px increments). Background grid dots provide spatial reference.
- **Node cards:** Each node is rendered as a rounded card displaying the service logo, node name, configuration summary, and a real-time status indicator (animated spinner for RUNNING, green checkmark for SUCCESS, red X for FAILED).
- **Connection edges:** Bezier-curved lines connect node output handles to input handles, visually conveying data flow direction.
- **MiniMap (bottom-right):** A bird's-eye overview of the full canvas layout for large workflows.
- **Controls (bottom-left):** Zoom in, zoom out, and fit-to-view buttons.
- **Add Node button (top-right):** Opens a dropdown menu listing all available node types grouped by category (Triggers, AI, Actions).
- **Execute Workflow button (bottom-center):** Visible only when a `MANUAL_TRIGGER` node is present; fires the Inngest event to start execution.

---

### 4.2.3 Node Configuration Dialog

**[Insert Image: AI Node Configuration Dialog (OpenAI/Gemini/Anthropic)]**

Clicking the settings icon on an AI node opens a modal dialog containing:

- **Model selector:** Dropdown listing available models for the provider (e.g., gpt-4o, gpt-3.5-turbo for OpenAI).
- **Credential selector:** Dropdown listing the user's stored credentials of the matching type from the credential vault.
- **Prompt input:** Multi-line text area for entering the system/user prompt. Supports referencing outputs from upstream nodes using `{{context.nodeId.output}}` syntax.

For output nodes (Slack, Discord):
- **Webhook URL field** and **Message Content field** for configuring the outbound message.

---

### 4.2.4 Credential Vault Interface

**[Insert Image: Credentials Management Page]**

The credentials page displays a list of stored API keys. Each entry shows:
- Credential name (user-defined label)
- Type badge (OPENAI / ANTHROPIC / GEMINI)
- Creation date
- Delete button

A form at the top allows adding a new credential by entering the name, selecting the type, and pasting the API key value. The raw key value is never displayed after creation.

---

### 4.2.5 Execution History List

**[Insert Image: Execution History for a Workflow]**

The executions page for a workflow shows a chronological list of all past runs. Each row displays:
- Execution status icon (spinner / checkmark / X) with colour coding
- Start time (relative, e.g., "3 minutes ago")
- Duration in seconds
- Link to the detailed execution view

---

### 4.2.6 Execution Detail View

**[Insert Image: Execution Detail Card — Successful Run]**

**[Insert Image: Execution Detail Card — Failed Run with Stack Trace]**

The execution detail card presents all metadata for a single run:

- **Successful Run:** Displays status, timing, and a collapsible JSON output block showing the final accumulated context (e.g., the AI model's response text that was sent to Slack).
- **Failed Run:** Displays the error message in a red-highlighted panel with a "Show Stack Trace" collapsible section revealing the full JavaScript error stack for debugging.

---

### 4.2.7 Real-Time Node Status During Execution

**[Insert Image: Editor Canvas During Active Workflow Execution]**

When a workflow is executing, each node on the canvas updates its status indicator in real time via Inngest's realtime WebSocket channels:

| Node State | Visual Indicator |
|---|---|
| Pending (not yet reached) | Default card style, no status badge |
| Running | Blue animated spinning icon |
| Completed | Green checkmark icon |
| Failed | Red X icon |

This gives users immediate visual feedback on which step in the pipeline is currently processing and where failures occur, without requiring a page refresh.

---

### 4.2.8 Data Flow Model — Sample Workflow

The following table describes the data flow through a sample three-node workflow: **Stripe Payment → Gemini AI Summary → Slack Notification**.

| Step | Node Type | Input | Output |
|---|---|---|---|
| 1 | `STRIPE_TRIGGER` | Stripe webhook payload (JSON) | `{ amount, currency, customerEmail }` |
| 2 | `GEMINI` | Prompt: "Summarise this payment: `{{context}}`" | `{ summary: "Payment of $99 received from..." }` |
| 3 | `SLACK` | Content: `{{context.summary}}` | `{ messageTs, channel }` (Slack API response) |

Each node receives the full accumulated `context` object from all previously executed nodes, allowing downstream nodes to reference any prior output using the node ID as a key.
