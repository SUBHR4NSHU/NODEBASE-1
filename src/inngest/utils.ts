import { Node, Connection } from '@/generated/prisma';
import toposort from 'toposort';
import { inngest } from './client';
import { createId } from "@paralleldrive/cuid2";

export const topologicalSort = (
    nodes: Node[],
    connections: Connection[],
): Node[] => {
    // If no connections, return the node array
    if (connections.length === 0) return nodes;

    //Create the edges array for toposort
    const edges: [string, string][] = connections.map((conn) => [
        conn.fromNodeId,
        conn.toNodeId,
    ]);

    //Track which nodes are connected
    const connectedNodeIds = new Set<string>();
    for (const conn of connections) {
        connectedNodeIds.add(conn.fromNodeId);
        connectedNodeIds.add(conn.toNodeId);
    }

    // Collect disconnected nodes separately (don't add self-edges — they cause false cycle detection)
    const disconnectedNodes = nodes.filter((node) => !connectedNodeIds.has(node.id));

    //Perform topological sort on connected edges only
    let sortedNodeIds: string[];
    try {
        sortedNodeIds = toposort(edges);
        //Remove duplicates
        sortedNodeIds = [...new Set(sortedNodeIds)];
    } catch (error) {
        if (error instanceof Error && error.message.includes('Cyclic')) {
            throw new Error('Workflow contains a cycle');
        }
        throw error;
    }

    // Map sorted IDs back to node objects, then append any disconnected nodes at the end
    const nodeMap = new Map(nodes.map((n) => [n.id, n]));
    const sortedNodes = sortedNodeIds.map((id) => nodeMap.get(id)!).filter(Boolean);
    return [...sortedNodes, ...disconnectedNodes];
};

export const sendWorkflowExecution = async (data: {
    workflowId: string;
    [key: string]: any;
}) => {
    await inngest.send({
        name: 'workflows/execute.workflow',
        data,
        id: createId(),
    });
}