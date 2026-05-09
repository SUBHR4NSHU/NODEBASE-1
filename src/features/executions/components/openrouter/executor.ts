import Handlebars from 'handlebars';
import type { NodeExecutor } from "@/features/executions/types";
import { NonRetriableError } from "inngest";
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { generateText } from 'ai';
import { openrouterChannel } from '@/inngest/channels/openrouter';
import { sanitizeTemplate } from '@/features/executions/lib/sanitize-template';
import prisma from '@/lib/db';
import { decrypt } from '@/lib/encryption';

Handlebars.registerHelper('json', (context) => {
    const jsonString = JSON.stringify(context, null, 2);
    const safeString = new Handlebars.SafeString(jsonString);

    return safeString;
});

type OpenRouterData = {
    variableName?: string;
    credentialId?: string;
    model?: string;
    systemPrompt?: string;
    userPrompt?: string;
};

export const openrouterExecutor: NodeExecutor<OpenRouterData> = async ({
    data,
    nodeId,
    userId,
    context,
    step,
    publish,
}) => {
    // Publish 'loading' state
    await publish(
       openrouterChannel().status({
            nodeId,
            status: 'loading',
        }),
    );

    if (!data.variableName) {
        await publish(
            openrouterChannel().status({
                nodeId,
                status: 'error',
            }),
        );

        throw new NonRetriableError('OpenRouter node: Variable name is missing');
    };

    if (!data.credentialId) {
            await publish(
                openrouterChannel().status({
                    nodeId,
                    status: 'error',
                }),
            );
    
            throw new NonRetriableError('OpenRouter node: Credential is required');
        };
    

    if (!data.userPrompt) {
        await publish(
            openrouterChannel().status({
                nodeId,
                status: 'error',
            }),
        );

        throw new NonRetriableError('OpenRouter node: User prompt is missing');
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
            openrouterChannel().status({
                nodeId,
                status: 'error',
            }),
        );
        throw new NonRetriableError('Credential not found');
    };

    const modelId = data.model || 'meta-llama/llama-3-8b-instruct:free';

    const openrouter = createOpenAICompatible({
        name: 'openrouter',
        apiKey: decrypt(credential.value),
        baseURL: 'https://openrouter.ai/api/v1',
        headers: {
            'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
            'X-OpenRouter-Title': 'NODEBASE',
        },
        fetch: async (url, options) => {
            // Add fallback models to prevent workflow failures due to rate limits on free models
            if (options?.body && typeof options.body === 'string') {
                try {
                    const bodyObj = JSON.parse(options.body);
                    if (!bodyObj.models) {
                        // Attempt the selected model first, then fallback to other reliable free models
                        bodyObj.models = [
                            modelId, 
                            'google/gemma-4-31b-it:free',
                            'meta-llama/llama-3.3-70b-instruct:free'
                        ];
                        // OpenRouter expects 'model' to be present but uses 'models' for fallbacks when provided in OpenAI compat mode
                        // Actually, OpenRouter handles 'models' directly in the root JSON.
                    }
                    options.body = JSON.stringify(bodyObj);
                } catch (e) {
                    // Ignore body parsing errors
                }
            }

            const response = await fetch(url, options);
            if (!response.ok) {
                try {
                    const bodyText = await response.text();
                    const parsed = JSON.parse(bodyText);
                    const realMessage = parsed.error?.metadata?.raw || parsed.error?.message || bodyText;
                    
                    return new Response(JSON.stringify({
                        error: {
                            message: realMessage
                        }
                    }), {
                        status: response.status,
                        headers: response.headers
                    });
                } catch (e) {
                    // Ignore parsing errors, let original response through
                }
            }
            return response;
        }
    });

    try {
        const { steps } = await step.ai.wrap(
            'openrouter-generate-text',
            generateText,
            {
                model: openrouter(modelId),
                system: systemPrompt,
                prompt: userPrompt,
                maxRetries: 0,
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
            openrouterChannel().status({
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
    } catch (error: any) {
        await publish(
            openrouterChannel().status({
                nodeId,
                status: 'error',
            }),
        );

        throw new NonRetriableError(`OpenRouter Error: ${error?.message || 'An unknown error occurred'}`);
    };
}
