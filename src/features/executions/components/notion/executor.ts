import Handlebars from 'handlebars';
import { decode } from 'html-entities';
import type { NodeExecutor } from "@/features/executions/types";
import { NonRetriableError } from "inngest";
import { notionChannel } from '@/inngest/channels/notion';
import { sanitizeTemplate } from '@/features/executions/lib/sanitize-template';
import ky from 'ky';

Handlebars.registerHelper('json', (context) => {
    const jsonString = JSON.stringify(context, null, 2);
    const safeString = new Handlebars.SafeString(jsonString);

    return safeString;
});

const NOTION_API_VERSION = '2022-06-28';
const NOTION_BASE_URL = 'https://api.notion.com/v1';

type NotionData = {
    variableName?: string;
    apiKey?: string;
    action?: string;
    databaseId?: string;
    pageId?: string;
    content?: string;
};

/**
 * Builds the Notion API request URL and HTTP method based on the selected action.
 */
function getNotionEndpoint(action: string, data: NotionData): { url: string; method: 'post' | 'patch' | 'get' } {
    switch (action) {
        case 'create_page':
            return { url: `${NOTION_BASE_URL}/pages`, method: 'post' };
        case 'update_page':
            if (!data.pageId) {
                throw new NonRetriableError('Notion node: Page ID is required for update_page action');
            }
            return { url: `${NOTION_BASE_URL}/pages/${data.pageId}`, method: 'patch' };
        case 'query_database':
            if (!data.databaseId) {
                throw new NonRetriableError('Notion node: Database ID is required for query_database action');
            }
            return { url: `${NOTION_BASE_URL}/databases/${data.databaseId}/query`, method: 'post' };
        case 'append_block':
            if (!data.pageId) {
                throw new NonRetriableError('Notion node: Page ID is required for append_block action');
            }
            return { url: `${NOTION_BASE_URL}/blocks/${data.pageId}/children`, method: 'patch' };
        default:
            throw new NonRetriableError(`Notion node: Unknown action "${action}"`);
    }
}

/**
 * Builds the request body for the Notion API based on the selected action.
 */
function buildRequestBody(action: string, data: NotionData, parsedContent: Record<string, unknown>): Record<string, unknown> {
    switch (action) {
        case 'create_page':
            return {
                parent: { database_id: data.databaseId },
                properties: parsedContent,
            };
        case 'update_page':
            return {
                properties: parsedContent,
            };
        case 'query_database':
            return parsedContent;
        case 'append_block':
            return {
                children: Array.isArray(parsedContent) ? parsedContent : parsedContent.children || [],
            };
        default:
            return parsedContent;
    }
}

export const notionExecutor: NodeExecutor<NotionData> = async ({
    data,
    nodeId,
    context,
    step,
    publish,
}) => {
    // Publish 'loading' state
    await publish(
        notionChannel().status({
            nodeId,
            status: 'loading',
        }),
    );

    if (!data.variableName) {
        await publish(
            notionChannel().status({
                nodeId,
                status: 'error',
            }),
        );

        throw new NonRetriableError('Notion node: Variable name is missing');
    };

    if (!data.apiKey) {
        await publish(
            notionChannel().status({
                nodeId,
                status: 'error',
            }),
        );

        throw new NonRetriableError('Notion node: API key is required');
    };

    if (!data.action) {
        await publish(
            notionChannel().status({
                nodeId,
                status: 'error',
            }),
        );

        throw new NonRetriableError('Notion node: Action is required');
    };

    if (!data.content) {
        await publish(
            notionChannel().status({
                nodeId,
                status: 'error',
            }),
        );

        throw new NonRetriableError('Notion node: Content/properties JSON is required');
    };

    // Compile Handlebars templates in the content field
    const rawContent = Handlebars.compile(sanitizeTemplate(data.content))(context);
    const content = decode(rawContent);

    let parsedContent: Record<string, unknown>;
    try {
        parsedContent = JSON.parse(content);
    } catch {
        await publish(
            notionChannel().status({
                nodeId,
                status: 'error',
            }),
        );

        throw new NonRetriableError('Notion node: Content must be valid JSON');
    }

    try {
        const result = await step.run('notion-api-call', async () => {
            const { url, method } = getNotionEndpoint(data.action!, data);
            const body = buildRequestBody(data.action!, data, parsedContent);

            const headers = {
                'Authorization': `Bearer ${data.apiKey}`,
                'Notion-Version': NOTION_API_VERSION,
            };

            const response = await ky(url, {
                method,
                headers,
                json: body,
            }).json<Record<string, unknown>>();

            return {
                ...context,
                [data.variableName!]: {
                    result: response,
                },
            };
        });

        await publish(
            notionChannel().status({
                nodeId,
                status: 'success',
            }),
        );

        return result;
    } catch (error) {
        await publish(
            notionChannel().status({
                nodeId,
                status: 'error',
            }),
        );

        throw error;
    };
};
