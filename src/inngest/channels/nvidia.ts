import { channel, topic } from '@inngest/realtime';

export const NVIDIA_CHANNEL_NAME = 'nvidia-execution';

export const nvidiaChannel = channel(NVIDIA_CHANNEL_NAME)
    .addTopic(
        topic('status').type<{
            nodeId: string;
            status: 'loading' | 'success' | 'error';
        }>(),
    );
