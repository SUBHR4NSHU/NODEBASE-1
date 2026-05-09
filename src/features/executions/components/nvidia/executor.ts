import Handlebars from 'handlebars';
import type { NodeExecutor } from "@/features/executions/types";
import { NonRetriableError } from "inngest";
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { generateText } from 'ai';
import { nvidiaChannel } from '@/inngest/channels/nvidia';
import { sanitizeTemplate } from '@/features/executions/lib/sanitize-template';
import prisma from '@/lib/db';
import { decrypt } from '@/lib/encryption';

Handlebars.registerHelper('json', (context) => {
    const jsonString = JSON.stringify(context, null, 2);
    const safeString = new Handlebars.SafeString(jsonString);

    return safeString;
});

type NvidiaData = {
    variableName?: string;
    credentialId?: string;
    model?: string;
    systemPrompt?: string;
    userPrompt?: string;
};

export const nvidiaExecutor: NodeExecutor<NvidiaData> = async ({
    data,
    nodeId,
    userId,
    context,
    step,
    publish,
}) => {
    // Publish 'loading' state
    await publish(
       nvidiaChannel().status({
            nodeId,
            status: 'loading',
        }),
    );

    if (!data.variableName) {
        await publish(
            nvidiaChannel().status({
                nodeId,
                status: 'error',
            }),
        );

        throw new NonRetriableError('Nvidia node: Variable name is missing');
    };

    if (!data.credentialId) {
            await publish(
                nvidiaChannel().status({
                    nodeId,
                    status: 'error',
                }),
            );
    
            throw new NonRetriableError('Nvidia node: Credential is required');
        };
    

    if (!data.userPrompt) {
        await publish(
            nvidiaChannel().status({
                nodeId,
                status: 'error',
            }),
        );

        throw new NonRetriableError('Nvidia node: User prompt is missing');
    };

    const systemPrompt = data.systemPrompt
        ? Handlebars.compile(sanitizeTemplate(data.systemPrompt))(context)
        : 'You are a helpful assistant';
    const userPrompt = Handlebars.compile(sanitizeTemplate(data.userPrompt))(context);

    const credential = await step.run('get-credential', async () => {

        return prisma.credential.findUnique({
            where: {
                id: data.credentialId,
                userId,
            },
        });
    });

    if (!credential) {
        await publish(
            nvidiaChannel().status({
                nodeId,
                status: 'error',
            }),
        );
        throw new NonRetriableError('Credential not found');
    };

    const nvidia = createOpenAICompatible({
        name: 'nvidia-nim',
        apiKey: decrypt(credential.value),
        baseURL: 'https://integrate.api.nvidia.com/v1',
    });

    const modelId = data.model || 'minimaxai/minimax-m2.7';

    try {
        const { steps } = await step.ai.wrap(
            'nvidia-generate-text',
            generateText,
            {
                model: nvidia(modelId),
                system: systemPrompt,
                prompt: userPrompt,
                experimental_telemetry: {
                    isEnabled: true,
                    recordInputs: true,
                    recordOutputs: true,
                },
            },
        );

        const text = 
            steps[0].content[0].type === 'text'
            ? steps[0].content[0].text
            : '';
        
        await publish(
            nvidiaChannel().status({
                nodeId,
                status: 'success',
            }),
        );

        return {
            ...context,
            [data.variableName]: {
                 text,
            },
        }
    } catch (error) {
        await publish(
            nvidiaChannel().status({
                nodeId,
                status: 'error',
            }),
        );

        throw error;
    };
}
