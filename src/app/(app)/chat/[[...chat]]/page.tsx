'use client';

import { ChatInterface } from '@/components/chat-interface';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { orpc } from '@/lib/orpc';
import { Loader } from '@/components/ai-elements/loader';
import type { UIMessage } from '@ai-sdk/react';

export default function ChatPage() {
    const params = useParams();
    const chatId = params.chat?.[0] as string | undefined;

    const { data: chatData, isLoading, isFetched } = useQuery({
        ...orpc.chat.get.queryOptions({ input: { id: chatId! } }),
        enabled: !!chatId,
    });

    if (chatId && (isLoading || !isFetched)) {
        return (
            <div className="flex h-[calc(100vh-4rem)] w-full items-center justify-center">
                <Loader size={32} />
            </div>
        );
    }

    return (
        <ChatInterface
            key={chatId ?? 'new'}
            chatId={chatId}
            initialMessages={chatData?.messages as UIMessage[] | undefined}
        />
    );
}
