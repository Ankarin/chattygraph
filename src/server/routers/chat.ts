import { z } from "zod";
import { db } from "@/db";
import { chats } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { type UIMessage } from "ai";
import { nanoid } from "nanoid";
import { authedProcedure } from "../middleware/auth";

export const chatRouter = {
    create: authedProcedure
        .input(z.object({}))
        .handler(async ({ context }) => {
            const chatId = nanoid();

            const [newChat] = await db.insert(chats).values({
                id: chatId,
                organizationId: context.organizationId,
                messages: [],
            }).returning();

            if (!newChat) {
                throw new Error('Failed to create chat');
            }

            return {
                id: newChat.id,
                organizationId: newChat.organizationId,
            };
        }),

    list: authedProcedure
        .input(z.object({}))
        .handler(async ({ context }) => {
            const chatList = await db.query.chats.findMany({
                where: eq(chats.organizationId, context.organizationId),
                orderBy: [desc(chats.updatedAt)],
            });

            const formattedChats = chatList.map((chat) => {
                const messages = (chat.messages as UIMessage[]) || [];
                const firstUserMessage = messages.find((msg) => msg.role === 'user');
                let title = 'New Chat';

                if (firstUserMessage) {
                    if ('parts' in firstUserMessage && firstUserMessage.parts?.[0]?.type === 'text') {
                        title = firstUserMessage.parts[0].text?.substring(0, 50) || 'New Chat';
                    } else if ('content' in firstUserMessage) {
                        title = (firstUserMessage.content as string)?.substring(0, 50) || 'New Chat';
                    }
                }

                return {
                    id: chat.id,
                    title,
                    updatedAt: chat.updatedAt,
                    createdAt: chat.createdAt,
                };
            });

            return { chats: formattedChats };
        }),

    get: authedProcedure
        .input(z.object({
            id: z.string().min(1),
        }))
        .handler(async ({ input, context }) => {
            const chat = await db.query.chats.findFirst({
                where: eq(chats.id, input.id),
            });

            if (!chat) {
                throw new Error('Chat not found');
            }

            if (chat.organizationId !== context.organizationId) {
                throw new Error('Chat does not belong to this organization');
            }

            return {
                id: chat.id,
                messages: chat.messages || [],
                createdAt: chat.createdAt,
                updatedAt: chat.updatedAt,
            };
        }),

    delete: authedProcedure
        .input(z.object({
            id: z.string().min(1),
        }))
        .handler(async ({ input, context }) => {
            const chat = await db.query.chats.findFirst({
                where: eq(chats.id, input.id),
            });

            if (!chat) {
                throw new Error('Chat not found');
            }

            if (chat.organizationId !== context.organizationId) {
                throw new Error('Chat does not belong to this organization');
            }

            await db.delete(chats).where(eq(chats.id, input.id));

            return { success: true };
        }),
};

