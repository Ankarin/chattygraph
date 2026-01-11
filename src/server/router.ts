import { os } from "@orpc/server";
import { chatRouter } from "./routers/chat";

export const router = os.router({
  chat: os.router(chatRouter),
});

export type AppRouter = typeof router;
