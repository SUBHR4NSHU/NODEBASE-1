'use client';

import { useReactFlow, type Node, type NodeProps } from '@xyflow/react';
import { memo, useState } from 'react';
import { BaseExecutionNode } from '../base-execution-node';
import { useNodeStatus } from '../../hooks/use-node-status';
import { NVIDIA_CHANNEL_NAME } from '@/inngest/channels/nvidia';
import { NvidiaDialog, NvidiaFormValues } from './dialog';
import { fetchNvidiaRealtimeToken } from './actions';

type NvidiaNodeData = {
    variableName?: string;
    credentialId?: string;
    model?: string;
    systemPrompt?: string;
    userPrompt?: string;
};

type NvidiaNodeType = Node<NvidiaNodeData>;

export const NvidiaNode = memo((props: NodeProps<NvidiaNodeType>) => {
    const [dialogOpen, setDialogOpen] = useState(false);
    const { setNodes } = useReactFlow();
    
    const nodeStatus = useNodeStatus({
        nodeId: props.id,
        channel: NVIDIA_CHANNEL_NAME,
        topic: 'status',
        refreshToken: fetchNvidiaRealtimeToken,
    });

    const handleOpenSettings = () => setDialogOpen(true);

    const handleSubmit = (values: NvidiaFormValues) => {
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
    const modelName = nodeData?.model?.split('/').pop() || 'Not configured';
    const description = nodeData?.userPrompt ? `${modelName}: ${nodeData.userPrompt.slice(0, 50)}...` : 'Not configured';
    

    return (
        <>
        <NvidiaDialog 
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            onSubmit={handleSubmit}
            defaultValues={nodeData}
        />
        <BaseExecutionNode
            {...props}
            id={props.id}
            icon={'/logos/nvidia-color.svg'}
            name='Nvidia NIM'
            status={nodeStatus}
            description={description}
            onSettings={handleOpenSettings}
            onDoubleClick={handleOpenSettings}
        />
        </>
    );
});

NvidiaNode.displayName = 'NvidiaNode';
