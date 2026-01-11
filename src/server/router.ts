import { os } from "@orpc/server";
import { chatRouter } from "./routers/chat";
import { organizationRouter } from "./routers/organization";

export const router = os.router({
  chat: os.router(chatRouter),
  organization: os.router(organizationRouter),
});

export type AppRouter = typeof router;

