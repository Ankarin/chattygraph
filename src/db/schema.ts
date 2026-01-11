import { jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const chats = pgTable("chats", {
    id: text("id").primaryKey(),
    messages: jsonb("messages"),
    userId: text("user_id").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
