'use client';

import { useState, useMemo } from 'react';
import { useChat, type UIMessage } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { Conversation, ConversationContent, ConversationScrollButton } from './ai-elements/conversation';
import { Message, MessageContent } from './ai-elements/message';
import { PromptInput, PromptInputBody, PromptInputSubmit, PromptInputTextarea } from './ai-elements/prompt-input';
import { Response } from './ai-elements/response';
import { Loader } from './ai-elements/loader';
import { InfographicPreview, extractHtmlFromContent } from './infographic-preview';
import { Button } from './ui/button';
import { Icons } from './ui/icons';

interface ChatInterfaceProps {
    chatId?: string;
    initialMessages?: UIMessage[];
}

export function ChatInterface({ chatId, initialMessages }: ChatInterfaceProps) {
    const [input, setInput] = useState('');
    const [showPreview, setShowPreview] = useState<string | null>(null);

    const { messages, sendMessage, status, stop } = useChat({
        id: chatId,
        messages: initialMessages,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        transport: new DefaultChatTransport({
            api: '/api/chat',
            body: { chatId },
        }) as any,
    });

    const isLoading = status === 'submitted' || status === 'streaming';

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;
        sendMessage({ text: input });
        setInput('');
        setShowPreview(null);
    };

    // Extract HTML from the latest assistant message for preview
    const latestHtml = useMemo(() => {
        const assistantMessages = messages.filter(m => m.role === 'assistant');
        if (assistantMessages.length === 0) return null;

        const lastMessage = assistantMessages[assistantMessages.length - 1];
        const textParts = lastMessage.parts?.filter(p => p.type === 'text' && 'text' in p) || [];
        const fullText = textParts.map(p => 'text' in p ? p.text : '').join('\n');

        return extractHtmlFromContent(fullText);
    }, [messages]);

    const renderMessageParts = (message: UIMessage) => {
        if (!message.parts || message.parts.length === 0) return null;

        return message.parts.map((part, index) => {
            if (part.type === 'text' && 'text' in part && part.text) {
                const html = extractHtmlFromContent(part.text);
                const isLatestAssistant = message.role === 'assistant' &&
                    messages.filter(m => m.role === 'assistant').pop()?.id === message.id;

                return (
                    <div key={`${message.id}-${index}`}>
                        {message.role === 'assistant' ? (
                            <Response>{part.text}</Response>
                        ) : (
                            <div>{part.text}</div>
                        )}

                        {/* Show preview button if HTML detected in assistant message */}
                        {html && message.role === 'assistant' && (
                            <div className="mt-4 flex gap-2">
                                <Button
                                    variant="default"
                                    size="sm"
                                    onClick={() => setShowPreview(showPreview === html ? null : html)}
                                    className="gap-2"
                                >
                                    {showPreview === html ? (
                                        <>
                                            <Icons.EyeOff className="h-4 w-4" />
                                            Hide Preview
                                        </>
                                    ) : (
                                        <>
                                            <Icons.Eye className="h-4 w-4" />
                                            Show Preview
                                        </>
                                    )}
                                </Button>
                            </div>
                        )}

                        {/* Show inline preview for the latest message */}
                        {showPreview === html && html && (
                            <div className="mt-4">
                                <InfographicPreview html={html} />
                            </div>
                        )}
                    </div>
                );
            }
            return null;
        });
    };

    const hasVisibleContent = (message: UIMessage) => {
        if (!message.parts) return false;
        return message.parts.some(part =>
            part.type === 'text' && 'text' in part && part.text
        );
    };

    // When there are no messages, center the input
    if (messages.length === 0) {
        return (
            <div className="flex h-[calc(100vh-4rem)] w-full flex-col items-center justify-center p-6 gap-8">
                <div className="text-center space-y-4">
                    <h1 className="text-4xl font-semibold">
                        Create an Infographic
                    </h1>
                    <p className="text-muted-foreground max-w-md">
                        Describe what you want to visualize and I'll generate a professional infographic for you.
                    </p>
                </div>

                {/* Example prompts */}
                <div className="flex flex-wrap gap-2 max-w-2xl justify-center">
                    {[
                        "Create an infographic about prompt engineering best practices",
                        "Make a comparison chart: React vs Vue vs Angular",
                        "Design an infographic showing the software development lifecycle",
                    ].map((prompt, i) => (
                        <Button
                            key={i}
                            variant="outline"
                            size="sm"
                            className="text-xs"
                            onClick={() => setInput(prompt)}
                        >
                            {prompt}
                        </Button>
                    ))}
                </div>

                <div className="w-full max-w-3xl">
                    <PromptInput
                        onSubmit={(_, event) => handleSubmit(event)}
                        className="border rounded-3xl shadow-lg w-full transition-all focus-within:shadow-xl"
                    >
                        <PromptInputBody>
                            <div className="flex items-center gap-2 p-2">
                                <PromptInputTextarea
                                    onChange={(e) => setInput(e.target.value)}
                                    value={input}
                                    className="flex-1 border-0 focus-visible:ring-0 bg-transparent resize-none !min-h-[2.5rem] px-3 py-2 text-base"
                                    disabled={isLoading}
                                    placeholder="e.g., Create an infographic about AI trends in 2025..."
                                    autoFocus
                                />
                                <PromptInputSubmit
                                    disabled={!input.trim() && !isLoading}
                                    className="h-10 w-10 shrink-0 rounded-full flex items-center justify-center"
                                    onClick={(e) => {
                                        if (isLoading) {
                                            e.preventDefault();
                                            stop();
                                        }
                                    }}
                                />
                            </div>
                        </PromptInputBody>
                    </PromptInput>
                </div>
            </div>
        );
    }

    // When there are messages, use the normal layout
    return (
        <div className="flex h-[calc(100vh-4rem)] w-full flex-col">
            <Conversation>
                <ConversationContent>
                    {messages.map((message) => {
                        if (!hasVisibleContent(message)) return null;

                        return (
                            <Message key={message.id} from={message.role}>
                                <MessageContent>
                                    {renderMessageParts(message)}
                                </MessageContent>
                            </Message>
                        );
                    })}
                    {isLoading && (
                        !messages.length ||
                        messages[messages.length - 1]?.role === 'user' ||
                        !hasVisibleContent(messages[messages.length - 1])
                    ) && (
                            <Message from="assistant">
                                <MessageContent>
                                    <Loader size={20} />
                                </MessageContent>
                            </Message>
                        )}
                </ConversationContent>
                <ConversationScrollButton />
            </Conversation>

            <div className="p-6 flex justify-center">
                <div className="w-full max-w-3xl">
                    <PromptInput
                        onSubmit={(_, event) => handleSubmit(event)}
                        className="border rounded-3xl shadow-lg w-full transition-all focus-within:shadow-xl"
                    >
                        <PromptInputBody>
                            <div className="flex items-center gap-2 p-2">
                                <PromptInputTextarea
                                    onChange={(e) => setInput(e.target.value)}
                                    value={input}
                                    className="flex-1 border-0 focus-visible:ring-0 bg-transparent resize-none !min-h-[2.5rem] px-3 py-2 text-base"
                                    disabled={isLoading}
                                    placeholder="Ask for changes or create a new infographic..."
                                    autoFocus
                                />
                                <PromptInputSubmit
                                    disabled={!input.trim() && !isLoading}
                                    className="h-10 w-10 shrink-0 rounded-full flex items-center justify-center"
                                    onClick={(e) => {
                                        if (isLoading) {
                                            e.preventDefault();
                                            stop();
                                        }
                                    }}
                                />
                            </div>
                        </PromptInputBody>
                    </PromptInput>
                </div>
            </div>
        </div>
    );
}
