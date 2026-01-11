'use client';

import { useAuth } from '@clerk/nextjs';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter, usePathname } from 'next/navigation';
import { orpc } from '@/lib/orpc';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";

export function AppSidebar() {
    const { isSignedIn } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const queryClient = useQueryClient();

    // Extract chatId from pathname like /abc123 or /
    const currentChatId = pathname === '/' ? undefined : pathname.slice(1);

    const { data: chatHistoryData } = useQuery(orpc.chat.list.queryOptions({
        input: {},
        enabled: isSignedIn,
    }));

    const chatHistory = chatHistoryData?.chats || [];

    const createChatMutation = useMutation(orpc.chat.create.mutationOptions({
        onSuccess: (data) => {
            queryClient.invalidateQueries({
                queryKey: orpc.chat.list.key({ type: 'query', input: {} })
            });
            router.push(`/${data.id}`);
        },
    }));

    const deleteChatMutation = useMutation(orpc.chat.delete.mutationOptions({
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: orpc.chat.list.key({ type: 'query', input: {} })
            });
            if (currentChatId) {
                router.push('/');
            }
        },
    }));

    const handleNewChat = () => {
        router.push('/');
    };

    const handleSelectChat = (chatId: string) => {
        router.push(`/${chatId}`);
    };

    const handleDeleteChat = (e: React.MouseEvent, chatId: string) => {
        e.stopPropagation();
        deleteChatMutation.mutate({ id: chatId });
    };

    return (
        <Sidebar>
            <SidebarHeader className="p-4">
                <Button
                    onClick={handleNewChat}
                    variant="outline"
                    className="w-full justify-start gap-2"
                >
                    <Icons.Plus className="h-4 w-4" />
                    New Chat
                </Button>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {chatHistory.length === 0 ? (
                                <div className="px-4 py-2 text-sm text-muted-foreground">
                                    No chats yet
                                </div>
                            ) : (
                                chatHistory.map((chat) => (
                                    <SidebarMenuItem key={chat.id}>
                                        <div className="group flex items-center w-full gap-1">
                                            <SidebarMenuButton
                                                onClick={() => handleSelectChat(chat.id)}
                                                isActive={currentChatId === chat.id}
                                                className="flex-1"
                                            >
                                                <span className="truncate">
                                                    {chat.title || 'New Chat'}
                                                </span>
                                            </SidebarMenuButton>
                                            <button
                                                type="button"
                                                className="h-8 w-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shrink-0 hover:bg-accent rounded-md"
                                                onClick={(e) => handleDeleteChat(e, chat.id)}
                                            >
                                                <Icons.Trash className="h-3 w-3" />
                                            </button>
                                        </div>
                                    </SidebarMenuItem>
                                ))
                            )}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter />
        </Sidebar>
    );
}
