import { sendWorkflowExecution } from "@/inngest/utils";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const url = new URL(request.url);
        const workflowId = url.searchParams.get('workflowId');

        if (!workflowId) {
            return NextResponse.json(
                { success: false, error: 'Missing required query parameter: workflowId'},
                { status: 400 },
            );
        };

        const body = await request.json();

        // Sanitize response keys: replace spaces/special chars with underscores
        // so Handlebars templates can use dot notation (e.g. {{googleForm.responses.Full_Name}})
        const sanitizedResponses: Record<string, unknown> = {};
        if (body.responses && typeof body.responses === 'object') {
            for (const [key, value] of Object.entries(body.responses)) {
                const sanitizedKey = key.replace(/[^a-zA-Z0-9]/g, '_');
                sanitizedResponses[sanitizedKey] = value;
            }
        }

        const formData = {
            formId: body.formId,
            formTitle: body.formTitle,
            responseId: body.responseId,
            timestamp: body.timestamp,
            respondentEmail: body.respondentEmail,
            responses: sanitizedResponses,
            rawResponses: body.responses, // preserve original keys
            raw: body,
        };

        // Trigger an Inngest job
        await sendWorkflowExecution({
                    workflowId,
                    initialData: {
                        googleForm: formData,
                    },
                });
        return NextResponse.json(
                    { success: true },
                    { status: 200 },
                );

    } catch (error) {
        console.log('Google Form webhook error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to process Google Form submission'},
            { status: 500 },
        );
    }
}