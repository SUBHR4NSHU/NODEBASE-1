'use client';

import { useReactFlow, type Node, type NodeProps } from '@xyflow/react';
import { memo, useState } from 'react';
import { BaseExecutionNode } from '../base-execution-node';
import { useNodeStatus } from '../../hooks/use-node-status';
import { NOTION_CHANNEL_NAME } from '@/inngest/channels/notion';
import { fetchNotionRealtimeToken } from './actions';
import { NotionDialog, NotionFormValues } from './dialog';

type NotionNodeData = {
    action?: string;
    databaseId?: string;
    pageId?: string;
    content?: string;
    apiKey?: string;
};

type NotionNodeType = Node<NotionNodeData>;

export const NotionNode = memo((props: NodeProps<NotionNodeType>) => {
    const [dialogOpen, setDialogOpen] = useState(false);
    const { setNodes } = useReactFlow();

    const nodeStatus = useNodeStatus({
        nodeId: props.id,
        channel: NOTION_CHANNEL_NAME,
        topic: 'status',
        refreshToken: fetchNotionRealtimeToken,
    });

    const handleOpenSettings = () => setDialogOpen(true);

    const handleSubmit = (values: NotionFormValues) => {
        setNodes((nodes) => nodes.map((node) => {
            if (node.id === props.id) {
                return {
                    ...node,
                    data: {
                        ...node.data,
                        ...values,
                    }
                }
            }
            return node;
        }))
    };

    const nodeData = props.data;
    const actionLabel = nodeData?.action?.replace(/_/g, ' ') || '';
    const description = nodeData?.action
        ? `Action: ${actionLabel.charAt(0).toUpperCase() + actionLabel.slice(1)}`
        : 'Not configured';

    return (
        <>
        <NotionDialog
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            onSubmit={handleSubmit}
            defaultValues={nodeData}
        />
        <BaseExecutionNode
            {...props}
            id={props.id}
            icon={'/logos/notion.svg'}
            name='Notion'
            status={nodeStatus}
            description={description}
            onSettings={handleOpenSettings}
            onDoubleClick={handleOpenSettings}
        />
        </>
    );
});

NotionNode.displayName = 'NotionNode';
