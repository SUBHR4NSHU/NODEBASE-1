'use server';

import { getSubscriptionToken, type Realtime } from "@inngest/realtime";
import { inngest } from "@/inngest/client";
import { nvidiaChannel } from "@/inngest/channels/nvidia";

export type NvidiaToken = Realtime.Token<
    typeof nvidiaChannel,
    ['status']
>;

export async function fetchNvidiaRealtimeToken(): Promise<NvidiaToken> {
    const token = await getSubscriptionToken(inngest, {
        channel: nvidiaChannel(),
        topics: ['status'],
    });

    return token;
};
