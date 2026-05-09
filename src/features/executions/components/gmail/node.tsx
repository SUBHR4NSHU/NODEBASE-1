'use client';

import { useReactFlow, type Node, type NodeProps } from '@xyflow/react';
import { memo, useState } from 'react';
import { BaseExecutionNode } from '../base-execution-node';
import { useNodeStatus } from '../../hooks/use-node-status';
import { GMAIL_CHANNEL_NAME } from '@/inngest/channels/gmail';
import { fetchGmailRealtimeToken } from './actions';
import { GmailDialog, GmailFormValues } from './dialog';

type GmailNodeData = {
    credentialId?: string;
    to?: string;
    subject?: string;
    body?: string;
};

type GmailNodeType = Node<GmailNodeData>;

export const GmailNode = memo((props: NodeProps<GmailNodeType>) => {
    const [dialogOpen, setDialogOpen] = useState(false);
    const { setNodes } = useReactFlow();

    const nodeStatus = useNodeStatus({
        nodeId: props.id,
        channel: GMAIL_CHANNEL_NAME,
        topic: 'status',
        refreshToken: fetchGmailRealtimeToken,
    });

    const handleOpenSettings = () => setDialogOpen(true);

    const handleSubmit = (values: GmailFormValues) => {
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
    const description = nodeData?.to
        ? `To: ${nodeData.to.slice(0, 40)}${nodeData.to.length > 40 ? '...' : ''}`
        : 'Not configured';

    return (
        <>
        <GmailDialog
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            onSubmit={handleSubmit}
            defaultValues={nodeData}
        />
        <BaseExecutionNode
            {...props}
            id={props.id}
            icon={'/logos/gmail.svg'}
            name='Gmail'
            status={nodeStatus}
            description={description}
            onSettings={handleOpenSettings}
            onDoubleClick={handleOpenSettings}
        />
        </>
    );
});

GmailNode.displayName = 'GmailNode';
