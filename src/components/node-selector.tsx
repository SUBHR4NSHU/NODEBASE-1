'use client';

import { createId } from '@paralleldrive/cuid2';
import { useReactFlow } from '@xyflow/react';
import { useCallback } from 'react';
import { toast } from 'sonner';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import {
    GlobeIcon,
    MousePointerIcon,
} from 'lucide-react';
import { NodeType } from '@/generated/prisma';
import { Separator } from './ui/separator';

export type NodeTypeOption = {
    type: NodeType;
    label: string;
    description: string;
    icon: React.ComponentType<{ className?: string }> | string;
};


const triggerNodes: NodeTypeOption[] = [
    {
        type: NodeType.MANUAL_TRIGGER,
        label: 'Trigger manually',
        description: 'Runs the flow on clicking a button. Good for getting started quickly',
        icon: MousePointerIcon,
    },
    {
        type: NodeType.GOOGLE_FORM_TRIGGER,
        label: 'Google Form',
        description: 'Runs the flow when a GoogleForm is submitted',
        icon: '/logos/googleform.svg',
    },
    {
        type: NodeType.STRIPE_TRIGGER,
        label: 'Stripe Event',
        description: 'Runs the flow when a Stripe Event is submitted',
        icon: '/logos/stripe.svg',
    },
    
];

const executionNodes: NodeTypeOption[] = [
    {
        type: NodeType.HTTP_REQUEST,
        label: 'HTTP Request',
        description: 'Makes an HTTP request',
        icon: GlobeIcon,
    },
    {
        type: NodeType.GEMINI,
        label: 'Gemini',
        description: 'Uses Google Gemini to generate text',
        icon: '/logos/gemini.svg',
    },
    {
        type: NodeType.OPENAI,
        label: 'OpenAI',
        description: 'Uses Open AI to generate text',
        icon: '/logos/openai.svg',
    },
    {
        type: NodeType.ANTHROPIC,
        label: 'Anthropic',
        description: 'Uses Anthropic AI to generate text',
        icon: '/logos/anthropic.svg',
    },
    {
        type: NodeType.DISCORD,
        label: 'Discord',
        description: 'Send a message to Discord',
        icon: '/logos/discord.svg',
    },
    {
        type: NodeType.SLACK,
        label: 'Slack',
        description: 'Send a message to Slack',
        icon: '/logos/slack.svg',
    },
    {
        type: NodeType.NVIDIA,
        label: 'Nvidia NIM',
        description: 'Uses Nvidia NIM free preview models to generate text',
        icon: '/logos/nvidia-color.svg',
    },
    {
        type: NodeType.OPENROUTER,
        label: 'OpenRouter',
        description: 'Uses OpenRouter free models to generate text',
        icon: '/logos/openrouter (1).svg',
    },
    {
        type: NodeType.NOTION,
        label: 'Notion',
        description: 'Create pages, query databases, and manage content in Notion',
        icon: '/logos/notion.svg',
    },
    {
        type: NodeType.GMAIL,
        label: 'Gmail',
        description: 'Send emails via Gmail',
        icon: '/logos/gmail.svg',
    },
];

const getDefaultNodeData = (type: NodeType): Record<string, unknown> => {
    switch (type) {
        case NodeType.NVIDIA:
            return {
                variableName: 'nvidia',
                model: 'meta/llama-3.1-8b-instruct',
                systemPrompt: 'You are a helpful assistant',
                userPrompt: '',
            };
        case NodeType.OPENROUTER:
            return {
                variableName: 'openrouter',
                model: 'meta-llama/llama-3-8b-instruct:free',
                systemPrompt: 'You are a helpful assistant',
                userPrompt: '',
            };
        case NodeType.OPENAI:
            return {
                variableName: 'openai',
                systemPrompt: 'You are a helpful assistant',
                userPrompt: '',
            };
        case NodeType.GEMINI:
            return {
                variableName: 'gemini',
                systemPrompt: 'You are a helpful assistant',
                userPrompt: '',
            };
        case NodeType.ANTHROPIC:
            return {
                variableName: 'anthropic',
                systemPrompt: 'You are a helpful assistant',
                userPrompt: '',
            };
        case NodeType.NOTION:
            return {
                variableName: 'notion',
                action: 'create_page',
                databaseId: '',
                pageId: '',
                content: '',
                apiKey: '',
            };
        case NodeType.GMAIL:
            return {
                variableName: 'gmail',
                to: '',
                subject: '',
                body: '',
                smtpHost: 'smtp.gmail.com',
                smtpPort: '587',
                smtpUser: '',
                smtpPass: '',
            };
        default:
            return {};
    }
};

interface NodeSelectorProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    children: React.ReactNode;
}

export function NodeSelector({
    open,
    onOpenChange,
    children,
}: NodeSelectorProps) {
    const { setNodes, getNodes, screenToFlowPosition } = useReactFlow();

    const handleNodeSelect = useCallback((selection: NodeTypeOption) => {
        // check if trying to add a manual trigger when one already exists
        if (selection.type === NodeType.MANUAL_TRIGGER) {
            const nodes = getNodes();
            const hasManualTrigger = nodes.some((node) => node.type === NodeType.MANUAL_TRIGGER,
        );

        if (hasManualTrigger) {
            toast.error('Only one manual trigger is allowed per workflow');
            return;
        };
    };

        setNodes((nodes) => {
            const hasInitialTrigger = nodes.some((node) => node.type === NodeType.INITIAL);

            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;

            const flowPosition = screenToFlowPosition({
                x: centerX + (Math.random() - 0.5) * 200,
                y: centerY + (Math.random() - 0.5) * 200,
            });

            const newNode = {
                id: createId(),
                data: getDefaultNodeData(selection.type),
                position: flowPosition,
                type: selection.type,
            };

            if (hasInitialTrigger) return [newNode];

            return [...nodes, newNode];
        });

        onOpenChange(false);
        
    }, [
        setNodes,
        getNodes,
        screenToFlowPosition,
        onOpenChange,
    ]);

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetTrigger asChild>{children}</SheetTrigger>
                <SheetContent side='right' className='w-full sm:max-w-md overflow-y-auto'>
                    <SheetHeader>
                        <SheetTitle>What triggers this workflow?</SheetTitle>
                        <SheetDescription>A trigger is a step that starts your workflow</SheetDescription>
                    </SheetHeader>
                    <div>
                        {triggerNodes.map((nodeType) => {
                            const Icon = nodeType.icon;

                            return (
                                <div
                                  key={nodeType.type}
                                  className='w-full justify-start h-auto
                                  py-5 px-4 rounded-none cursor-pointer border-l-2
                                  border-transparent hover:border-l-primary'
                                  onClick={() => handleNodeSelect(nodeType)}
                                >
                                    <div className='flex items-center gap-6 w-full overflow-hidden'>
                                        {typeof Icon === 'string' ? (
                                            <img 
                                              src={Icon}
                                              alt={nodeType.label}
                                              className='size-5 object-contain rounded-sm'
                                            />
                                        ) : (
                                            <Icon className='size-5' />
                                        )}
                                        <div className='flex flex-col items-start text-left'>
                                            <span className='font-medium text-sm'>{nodeType.label}</span>
                                            <span className='text-xs text-muted-foreground'>{nodeType.description}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <Separator />
                    <div>
                        {executionNodes.map((nodeType) => {
                            const Icon = nodeType.icon;

                            return (
                                <div
                                  key={nodeType.type}
                                  className='w-full justify-start h-auto
                                  py-5 px-4 rounded-none cursor-pointer border-l-2
                                  border-transparent hover:border-l-primary'
                                  onClick={() => handleNodeSelect(nodeType)}
                                >
                                    <div className='flex items-center gap-6 w-full overflow-hidden'>
                                        {typeof Icon === 'string' ? (
                                            <img 
                                              src={Icon}
                                              alt={nodeType.label}
                                              className='size-5 object-contain rounded-sm'
                                            />
                                        ) : (
                                            <Icon className='size-5' />
                                        )}
                                        <div className='flex flex-col items-start text-left'>
                                            <span className='font-medium text-sm'>{nodeType.label}</span>
                                            <span className='text-xs text-muted-foreground'>{nodeType.description}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </SheetContent>
            
        </Sheet>
    );
}
