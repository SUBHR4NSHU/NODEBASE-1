import Handlebars from 'handlebars';
import { decode } from 'html-entities';
import type { NodeExecutor } from "@/features/executions/types";
import { NonRetriableError } from "inngest";
import { gmailChannel } from '@/inngest/channels/gmail';
import { sanitizeTemplate } from '@/features/executions/lib/sanitize-template';
import nodemailer from 'nodemailer';
import prisma from '@/lib/db';
import { decrypt } from '@/lib/encryption';

Handlebars.registerHelper('json', (context) => {
    const jsonString = JSON.stringify(context, null, 2);
    const safeString = new Handlebars.SafeString(jsonString);

    return safeString;
});

type GmailData = {
    variableName?: string;
    credentialId?: string;
    to?: string;
    subject?: string;
    body?: string;
};

export const gmailExecutor: NodeExecutor<GmailData> = async ({
    data,
    nodeId,
    userId,
    context,
    step,
    publish,
}) => {
    // Publish 'loading' state
    await publish(
        gmailChannel().status({
            nodeId,
            status: 'loading',
        }),
    );

    if (!data.variableName) {
        await publish(
            gmailChannel().status({
                nodeId,
                status: 'error',
            }),
        );
        throw new NonRetriableError('Gmail node: Variable name is missing');
    };

    if (!data.credentialId) {
        await publish(
            gmailChannel().status({
                nodeId,
                status: 'error',
            }),
        );
        throw new NonRetriableError('Gmail node: Gmail credential is required. Please select a connected Gmail account.');
    };

    if (!data.to) {
        await publish(
            gmailChannel().status({
                nodeId,
                status: 'error',
            }),
        );
        throw new NonRetriableError('Gmail node: Recipient email is required');
    };

    if (!data.subject) {
        await publish(
            gmailChannel().status({
                nodeId,
                status: 'error',
            }),
        );
        throw new NonRetriableError('Gmail node: Subject is required');
    };

    if (!data.body) {
        await publish(
            gmailChannel().status({
                nodeId,
                status: 'error',
            }),
        );
        throw new NonRetriableError('Gmail node: Email body is required');
    };

    // Fetch the credential from the database
    const credential = await step.run('get-gmail-credential', async () => {
        return prisma.credential.findUnique({
            where: {
                id: data.credentialId,
                userId,
            },
        });
    });

    if (!credential) {
        await publish(
            gmailChannel().status({
                nodeId,
                status: 'error',
            }),
        );
        throw new NonRetriableError('Gmail node: Credential not found');
    }

    // Decrypt and parse the stored OAuth credential
    let credentialData: { email: string; refreshToken: string };
    try {
        const decrypted = decrypt(credential.value);
        credentialData = JSON.parse(decrypted);
    } catch {
        await publish(
            gmailChannel().status({
                nodeId,
                status: 'error',
            }),
        );
        throw new NonRetriableError('Gmail node: Failed to decrypt credential. Please reconnect your Gmail account.');
    }

    if (!credentialData.email || !credentialData.refreshToken) {
        await publish(
            gmailChannel().status({
                nodeId,
                status: 'error',
            }),
        );
        throw new NonRetriableError('Gmail node: Invalid credential data. Please reconnect your Gmail account.');
    }

    // Compile Handlebars templates
    const to = decode(Handlebars.compile(sanitizeTemplate(data.to))(context));
    const subject = decode(Handlebars.compile(sanitizeTemplate(data.subject))(context));
    const body = decode(Handlebars.compile(sanitizeTemplate(data.body))(context));

    try {
        const result = await step.run('gmail-send-email', async () => {
            const clientId = process.env.GOOGLE_GMAIL_CLIENT_ID;
            const clientSecret = process.env.GOOGLE_GMAIL_CLIENT_SECRET;

            if (!clientId || !clientSecret) {
                throw new Error('Missing Google Gmail OAuth credentials in environment variables.');
            }

            // Manually fetch the access token to get better error messages
            const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({
                    client_id: clientId,
                    client_secret: clientSecret,
                    refresh_token: credentialData.refreshToken,
                    grant_type: 'refresh_token',
                }),
            });

            if (!tokenResponse.ok) {
                const errData = await tokenResponse.json().catch(() => ({}));
                console.error('Failed to refresh access token:', errData);
                throw new Error(`Failed to refresh access token: ${errData.error_description || errData.error || tokenResponse.statusText}. Please reconnect your Gmail account.`);
            }

            const tokenData = await tokenResponse.json();

            // Configure the OAuth2 transporter using nodemailer
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    type: 'OAuth2',
                    user: credentialData.email,
                    clientId: clientId,
                    clientSecret: clientSecret,
                    refreshToken: credentialData.refreshToken,
                    accessToken: tokenData.access_token,
                },
            });

            // Send the email
            const info = await transporter.sendMail({
                from: credentialData.email,
                to,
                subject,
                text: body, // Provide plain text version
                html: `<pre style="font-family: sans-serif; white-space: pre-wrap;">${body.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>`, // Provide simple HTML version
            });

            return {
                ...context,
                [data.variableName!]: {
                    messageId: info.messageId,
                    to,
                    subject,
                },
            };
        });

        await publish(
            gmailChannel().status({
                nodeId,
                status: 'success',
            }),
        );

        return result;
    } catch (error) {
        await publish(
            gmailChannel().status({
                nodeId,
                status: 'error',
            }),
        );
        throw error;
    };
};
