import { NextRequest } from "next/server";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { chats } from "@/db/schema";
import { eq } from "drizzle-orm";
import { INFOGRAPHIC_SYSTEM_PROMPT } from "@/lib/prompts/infographic";

const chatRequestSchema = z.object({
    messages: z.array(z.any()),
    chatId: z.string().optional(),
});

export async function POST(request: NextRequest) {
    try {
        const { userId, orgId } = await auth();

        if (!userId) {
            return new Response(
                JSON.stringify({ error: 'Unauthorized' }),
                { status: 401 }
            );
        }

        const body = await request.json();
        const parsed = chatRequestSchema.parse(body);
        const { messages, chatId } = parsed;

        const MAX_HISTORY_MESSAGES = 20;
        const recentMessages = messages.slice(-MAX_HISTORY_MESSAGES);

        const result = streamText({
            model: 'anthropic/claude-sonnet-4-20250514',
            system: INFOGRAPHIC_SYSTEM_PROMPT,
            messages: await convertToModelMessages(recentMessages),
        });

        result.consumeStream();

        return result.toUIMessageStreamResponse({
            originalMessages: messages as UIMessage[],
            onFinish: async ({ messages: allMessages }) => {
                if (chatId && orgId) {
                    try {
                        await db.update(chats)
                            .set({
                                messages: allMessages,
                                updatedAt: new Date(),
                            })
                            .where(eq(chats.id, chatId));
                    } catch (err) {
                        console.error('[Chat] Failed to save messages:', err);
                    }
                }
            },
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return new Response(
                JSON.stringify({ error: 'Validation error', details: error.issues }),
                { status: 400 }
            );
        }
        console.error('Error in chat route:', error);
        return new Response(
            JSON.stringify({ error: 'Internal server error' }),
            { status: 500 }
        );
    }
}
